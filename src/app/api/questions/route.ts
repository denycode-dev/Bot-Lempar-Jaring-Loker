import { NextResponse } from 'next/server';
import { db } from '@/db';
import { screeningQuestions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(screeningQuestions)
      .where(eq(screeningQuestions.userId, 'default-user'))
      .orderBy(desc(screeningQuestions.createdAt));

    const questions = rows.map((r) => ({
      id: r.id,
      question: r.questionText,
      type: r.matchType || 'dropdown',
      options: '',
      answer: r.answerText,
      category: r.category,
      reviewStatus: r.reviewStatus,
      confidenceScore: r.confidenceScore,
      usageCount: r.usageCount,
      lastUsedAt: r.lastUsedAt,
    }));

    // Generate CSV string for export/raw view
    const csvLines = ['Question,Type,Options,Answer'];
    for (const q of questions) {
      const escQ = `"${(q.question || '').replace(/"/g, '""')}"`;
      const escType = `"${(q.type || 'dropdown').replace(/"/g, '""')}"`;
      const escAns = `"${(q.answer || '').replace(/"/g, '""')}"`;
      csvLines.push(`${escQ},${escType},"",${escAns}`);
    }

    return NextResponse.json({
      success: true,
      questions,
      rawCsv: csvLines.join('\n') + '\n',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const userId = 'default-user';

    // 0. Handle File Upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
      }

      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv')) {
        return NextResponse.json(
          { success: false, error: 'Hanya file .csv yang diizinkan.' },
          { status: 400 }
        );
      }

      const text = await file.text();
      const records: string[][] = parse(text, {
        columns: false,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
      });

      let insertedCount = 0;
      for (let i = 1; i < records.length; i++) {
        const cols = records[i];
        if (!cols || cols.length < 2) continue;

        const q = (cols[0] || '').trim();
        const ans = (cols.length >= 4 ? cols[3] : (cols.length === 3 ? cols[2] : cols[1]) || '').trim();

        if (!q || !ans) continue;
        const norm = q.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!norm) continue;

        await db
          .insert(screeningQuestions)
          .values({
            userId,
            questionText: q,
            normalizedQuestion: norm,
            answerText: ans,
            category: 'general',
            matchType: 'exact',
            confidenceScore: '1.00',
            reviewStatus: 'verified',
            portalSource: file.name,
          })
          .onConflictDoNothing();
        insertedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `File ${file.name} berhasil diunggah (${insertedCount} diproses ke database)!`,
      });
    }

    const body = await req.json();
    const { action, id, question, answer, category, reviewStatus } = body;

    // Single Question Create
    if (action === 'create' || (!action && question && answer)) {
      const qText = (question || '').trim();
      const ansText = (answer || '').trim();
      if (!qText || !ansText) {
        return NextResponse.json({ success: false, error: 'Pertanyaan dan jawaban wajib diisi' }, { status: 400 });
      }

      const norm = qText.toLowerCase().replace(/[^a-z0-9]/g, '');
      const [newRow] = await db
        .insert(screeningQuestions)
        .values({
          userId,
          questionText: qText,
          normalizedQuestion: norm,
          answerText: ansText,
          category: category || 'general',
          matchType: 'exact',
          confidenceScore: '1.00',
          reviewStatus: 'verified',
          portalSource: 'manual_input',
        })
        .onConflictDoUpdate({
          target: [screeningQuestions.userId, screeningQuestions.normalizedQuestion],
          set: {
            answerText: ansText,
            category: category || 'general',
            reviewStatus: 'verified',
          },
        })
        .returning();

      return NextResponse.json({ success: true, message: 'Pertanyaan berhasil disimpan!', data: newRow });
    }

    // Single Question Update
    if (action === 'update' && id) {
      await db
        .update(screeningQuestions)
        .set({
          questionText: question ? question.trim() : undefined,
          answerText: answer ? answer.trim() : undefined,
          category: category || undefined,
          reviewStatus: reviewStatus || undefined,
        })
        .where(and(eq(screeningQuestions.id, id), eq(screeningQuestions.userId, userId)));

      return NextResponse.json({ success: true, message: 'Pertanyaan berhasil diperbarui!' });
    }

    // Approve unreviewed question
    if (action === 'approve' && id) {
      await db
        .update(screeningQuestions)
        .set({ reviewStatus: 'verified' })
        .where(and(eq(screeningQuestions.id, id), eq(screeningQuestions.userId, userId)));

      return NextResponse.json({ success: true, message: 'Pertanyaan diverifikasi!' });
    }

    // Single Question Delete
    if (action === 'delete' && id) {
      await db
        .delete(screeningQuestions)
        .where(and(eq(screeningQuestions.id, id), eq(screeningQuestions.userId, userId)));

      return NextResponse.json({ success: true, message: 'Pertanyaan berhasil dihapus!' });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
