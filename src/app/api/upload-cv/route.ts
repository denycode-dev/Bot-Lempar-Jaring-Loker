import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getConfig, saveConfig } from '@/lib/config';
import { extractTextFromFile, analyzeCvWithAi } from '@/lib/cvAnalyzer';
import { db } from '@/db';
import { cvDocuments, applicantProfiles } from '@/db/schema';
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

    const updateProfile = formData.get('updateProfile') !== 'false'; // default true

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
    let aiParsedProfile: any = null;
    let aiError = '';

    try {
      aiParsedProfile = await analyzeCvWithAi(extractedText);
    } catch (e: any) {
      console.warn('AI analysis failed or skipped:', e?.message || e);
      aiError = e?.message || 'AI gagal memproses ringkasan otomatis.';
    }

    // 3. Simpan path & hasil ke AppConfig
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
        aiAnalysisSummary: aiParsedProfile || {},
        isPrimary: true,
      });
    } catch (dbErr) {
      console.warn('Could not persist cv document to PostgreSQL:', dbErr);
    }

    const updatedFields: string[] = [];
    const unchangedFields: string[] = [];

    const fieldKeys = [
      'fullName',
      'email',
      'phoneNumber',
      'gender',
      'maritalStatus',
      'dateOfBirth',
      'postalCode',
      'expectedSalary',
      'yearsOfExperience',
      'educationLevel',
      'gpa',
      'noticePeriod',
      'domicile',
      'address',
      'portfolioUrl',
      'linkedinUrl',
      'githubUrl',
      'skills',
    ];

    if (aiParsedProfile && updateProfile) {
      if (aiParsedProfile.fullName) {
        updates.fullName = aiParsedProfile.fullName;
        updatedFields.push('fullName');
      }
      if (aiParsedProfile.email) {
        updates.email = aiParsedProfile.email;
        updatedFields.push('email');
      }
      if (aiParsedProfile.phoneNumber) {
        updates.phoneNumber = aiParsedProfile.phoneNumber;
        updatedFields.push('phoneNumber');
      }
      if (aiParsedProfile.gender) {
        updates.gender = aiParsedProfile.gender;
        updatedFields.push('gender');
      }
      if (aiParsedProfile.maritalStatus) {
        updates.maritalStatus = aiParsedProfile.maritalStatus;
        updatedFields.push('maritalStatus');
      }
      if (aiParsedProfile.dateOfBirth) {
        updates.dateOfBirth = aiParsedProfile.dateOfBirth;
        updatedFields.push('dateOfBirth');
      }
      if (aiParsedProfile.postalCode) {
        updates.postalCode = aiParsedProfile.postalCode;
        updatedFields.push('postalCode');
      }
      if (aiParsedProfile.domicile) {
        updates.domicile = aiParsedProfile.domicile;
        updatedFields.push('domicile');
      }
      if (aiParsedProfile.address) {
        updates.address = aiParsedProfile.address;
        updatedFields.push('address');
      }
      if (aiParsedProfile.educationLevel) {
        updates.educationLevel = aiParsedProfile.educationLevel;
        updatedFields.push('educationLevel');
      }
      if (aiParsedProfile.gpa) {
        updates.gpa = String(aiParsedProfile.gpa);
        updatedFields.push('gpa');
      }
      if (aiParsedProfile.yearsOfExperience !== undefined && aiParsedProfile.yearsOfExperience !== null) {
        updates.yearsOfExperience = Number(aiParsedProfile.yearsOfExperience);
        updatedFields.push('yearsOfExperience');
      }
      if (aiParsedProfile.skills) {
        updates.skills = aiParsedProfile.skills;
        updatedFields.push('skills');
      }
      if (aiParsedProfile.linkedinUrl) {
        updates.linkedinUrl = aiParsedProfile.linkedinUrl;
        updatedFields.push('linkedinUrl');
      }
      if (aiParsedProfile.githubUrl) {
        updates.githubUrl = aiParsedProfile.githubUrl;
        updatedFields.push('githubUrl');
      }
      if (aiParsedProfile.portfolioUrl) {
        updates.portfolioUrl = aiParsedProfile.portfolioUrl;
        updatedFields.push('portfolioUrl');
      }

      // Sync updated profile to PostgreSQL applicant_profiles
      try {
        const skillsArr = typeof aiParsedProfile.skills === 'string'
          ? aiParsedProfile.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : (Array.isArray(aiParsedProfile.skills) ? aiParsedProfile.skills : undefined);

        await db
          .insert(applicantProfiles)
          .values({
            userId: 'default-user',
            fullName: aiParsedProfile.fullName || 'User',
            email: aiParsedProfile.email || 'user@example.com',
            phone: aiParsedProfile.phoneNumber || '-',
            currentAddress: aiParsedProfile.address || aiParsedProfile.domicile,
            linkedinUrl: aiParsedProfile.linkedinUrl,
            githubUrl: aiParsedProfile.githubUrl,
            portfolioUrl: aiParsedProfile.portfolioUrl,
            professionalSummary: aiParsedProfile.summary,
            skills: skillsArr || [],
          })
          .onConflictDoUpdate({
            target: [applicantProfiles.userId],
            set: {
              ...(aiParsedProfile.fullName ? { fullName: aiParsedProfile.fullName } : {}),
              ...(aiParsedProfile.email ? { email: aiParsedProfile.email } : {}),
              ...(aiParsedProfile.phoneNumber ? { phone: aiParsedProfile.phoneNumber } : {}),
              ...(aiParsedProfile.address || aiParsedProfile.domicile ? { currentAddress: aiParsedProfile.address || aiParsedProfile.domicile } : {}),
              ...(aiParsedProfile.linkedinUrl ? { linkedinUrl: aiParsedProfile.linkedinUrl } : {}),
              ...(aiParsedProfile.githubUrl ? { githubUrl: aiParsedProfile.githubUrl } : {}),
              ...(aiParsedProfile.portfolioUrl ? { portfolioUrl: aiParsedProfile.portfolioUrl } : {}),
              ...(aiParsedProfile.summary ? { professionalSummary: aiParsedProfile.summary } : {}),
              ...(skillsArr ? { skills: skillsArr } : {}),
              updatedAt: new Date(),
            },
          });
      } catch (profErr) {
        console.warn('Could not sync applicant profile to PostgreSQL:', profErr);
      }
    }

    for (const key of fieldKeys) {
      if (!updatedFields.includes(key)) {
        unchangedFields.push(key);
      }
    }

    const updatedConfig = saveConfig(updates);

    return NextResponse.json({
      success: true,
      message: aiParsedProfile
        ? updateProfile
          ? `File CV diunggah & AI memperbarui ${updatedFields.length} kolom data profil!`
          : 'File CV berhasil diunggah (Data profil tidak diperbarui sesuai pilihan).'
        : 'File CV berhasil diunggah (analisis AI opsional).',
      extractedText,
      parsedCv: aiParsedProfile,
      aiParsed: aiParsedProfile,
      aiError: aiError || null,
      updatedFields,
      unchangedFields,
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error('Error handling CV upload:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengunggah CV' }, { status: 500 });
  }
}
