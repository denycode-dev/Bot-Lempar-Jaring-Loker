import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getConfig, saveConfig } from '@/lib/config';
import { extractTextFromFile, analyzeCvWithAi } from '@/lib/cvAnalyzer';
import { db } from '@/db';
import { cvDocuments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getConfig();
    const hasCv = Boolean(config.cvFilePath && fs.existsSync(config.cvFilePath));

    return NextResponse.json({
      success: true,
      hasCv,
      cvFileName: config.cvFileName || '',
      cvAnalyzedAt: config.cvAnalyzedAt || '',
      cvExtractedText: config.cvExtractedText || '',
      cvPreviewSnippet: config.cvExtractedText ? config.cvExtractedText.slice(0, 300) + '...' : '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    // Accept either 'file' or 'cv' field name
    const file = (formData.get('file') || formData.get('cv')) as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File CV tidak ditemukan dalam request' }, { status: 400 });
    }

    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    if (!['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung! Harap upload file .pdf atau .docx' },
        { status: 400 }
      );
    }

    // Maksimal 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar! Maksimal 10 MB' },
        { status: 400 }
      );
    }

    // Simpan file ke folder uploads
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedFileName = `cv_resume_${Date.now()}${ext}`;
    const targetFilePath = path.join(uploadDir, savedFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(targetFilePath, buffer);

    // 1. Ekstrak teks mentah dari dokumen PDF / DOCX
    const extractedText = await extractTextFromFile(targetFilePath);

    if (!extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Gagal membaca isi teks dari file CV. Pastikan file tidak terkunci atau berupa gambar hasil scan murni.' },
        { status: 400 }
      );
    }

    // 2. Analisis menggunakan AI Gemini / Gateway
    let aiEnhancedResponse: any = null;
    let aiError = '';

    try {
      aiEnhancedResponse = await analyzeCvWithAi(extractedText);
    } catch (e: any) {
      console.warn('AI analysis failed or skipped:', e?.message || e);
      aiError = e?.message || 'AI gagal memproses ringkasan otomatis.';
    }

    const aiParsedProfile = aiEnhancedResponse?.profile || null;
    const missingFields = aiEnhancedResponse?.missingFields || [];
    const screeningQuestions = aiEnhancedResponse?.screeningQuestions || [];
    const honestyNotes = aiEnhancedResponse?.honestyNotes || [];

    // 3. Simpan path & hasil dokumen ke AppConfig
    const updates: any = {
      cvFileName: originalName,
      cvFilePath: targetFilePath,
      cvExtractedText: extractedText,
      cvAnalyzedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    };

    // 4. Simpan ke database PostgreSQL (cv_documents)
    try {
      const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

      await db
        .update(cvDocuments)
        .set({ isPrimary: false })
        .where(eq(cvDocuments.userId, 'default-user'));

      await db.insert(cvDocuments).values({
        userId: 'default-user',
        fileName: originalName,
        filePath: targetFilePath,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || (ext === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        extractedText,
        aiAnalysisSummary: aiEnhancedResponse || {},
        isPrimary: true,
      });
    } catch (dbErr) {
      console.warn('Could not persist cv document to PostgreSQL:', dbErr);
    }

    const updatedConfig = saveConfig(updates);

    return NextResponse.json({
      success: true,
      message: aiParsedProfile
        ? 'File CV berhasil diunggah & dianalisis oleh AI!'
        : 'File CV berhasil diunggah (analisis AI opsional).',
      extractedText,
      parsedCv: aiParsedProfile,
      aiParsed: aiParsedProfile,
      missingFields,
      screeningQuestions,
      honestyNotes,
      aiError: aiError || null,
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error('Error handling CV upload:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengunggah CV' }, { status: 500 });
  }
}
