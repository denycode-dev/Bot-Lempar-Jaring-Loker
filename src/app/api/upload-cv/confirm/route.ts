import { NextResponse } from 'next/server';
import { db } from '@/db';
import { applicantProfiles, screeningQuestions } from '@/db/schema';
import { normalizeQuestionText } from '@/lib/cvAnalyzer';
import { saveConfig } from '@/lib/config';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, screeningQuestions: rawQuestions } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Data profil pelamar tidak ditemukan dalam request.' },
        { status: 400 }
      );
    }

    const userId = 'default-user';

    // 1. Persist/Upsert Applicant Profile in PostgreSQL
    const skillsList = typeof profile.skills === 'string'
      ? profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : (Array.isArray(profile.skills) ? profile.skills : []);

    const expectedSalaryNum = profile.expectedSalary ? Number(profile.expectedSalary) : undefined;

    await db
      .insert(applicantProfiles)
      .values({
        userId,
        fullName: profile.fullName || 'User',
        email: profile.email || 'user@example.com',
        phone: profile.phoneNumber || profile.phone || '-',
        currentAddress: profile.address || profile.domicile || '',
        linkedinUrl: profile.linkedinUrl || null,
        githubUrl: profile.githubUrl || null,
        portfolioUrl: profile.portfolioUrl || null,
        professionalSummary: profile.summary || profile.professionalSummary || null,
        skills: skillsList,
        expectedSalaryMax: expectedSalaryNum,
        expectedSalaryMin: expectedSalaryNum,
        noticePeriod: profile.noticePeriod || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [applicantProfiles.userId],
        set: {
          fullName: profile.fullName || 'User',
          email: profile.email || 'user@example.com',
          phone: profile.phoneNumber || profile.phone || '-',
          currentAddress: profile.address || profile.domicile || '',
          linkedinUrl: profile.linkedinUrl || null,
          githubUrl: profile.githubUrl || null,
          portfolioUrl: profile.portfolioUrl || null,
          professionalSummary: profile.summary || profile.professionalSummary || null,
          skills: skillsList,
          expectedSalaryMax: expectedSalaryNum,
          expectedSalaryMin: expectedSalaryNum,
          noticePeriod: profile.noticePeriod || null,
          updatedAt: new Date(),
        },
      });

    // 2. Batch Upsert Screening Questions in PostgreSQL (Supabase/PostgreSQL Best Practices)
    let savedQuestionsCount = 0;
    if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
      const validRecords = rawQuestions
        .filter((q) => q && typeof q.questionText === 'string' && q.questionText.trim() && q.answerText)
        .map((q) => {
          const qText = q.questionText.trim();
          const norm = q.normalizedQuestion || normalizeQuestionText(qText);
          return {
            userId,
            questionText: qText,
            normalizedQuestion: norm,
            answerText: String(q.answerText).trim(),
            category: q.category || 'general',
            matchType: 'exact',
            confidenceScore: '1.00',
            reviewStatus: 'verified',
            portalSource: 'cv_ai_enhancement',
          };
        });

      if (validRecords.length > 0) {
        // Execute high-performance batch insert with conflict handling on idx_questions_normalized_user
        await db
          .insert(screeningQuestions)
          .values(validRecords)
          .onConflictDoUpdate({
            target: [screeningQuestions.userId, screeningQuestions.normalizedQuestion],
            set: {
              answerText: sql`excluded.answer_text`,
              category: sql`excluded.category`,
              reviewStatus: 'verified',
              confidenceScore: sql`excluded.confidence_score`,
              portalSource: 'cv_ai_enhancement',
            },
          });
        savedQuestionsCount = validRecords.length;
      }
    }

    // 3. Update AppConfig storage for immediate synchronization with active runners
    const configUpdates: Record<string, any> = {
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber || profile.phone,
      address: profile.address || profile.domicile,
      domicile: profile.domicile || profile.address,
      educationLevel: profile.educationLevel,
      gpa: profile.gpa,
      yearsOfExperience: profile.yearsOfExperience ? Number(profile.yearsOfExperience) : 2,
      expectedSalary: expectedSalaryNum,
      noticePeriod: profile.noticePeriod,
      skills: typeof profile.skills === 'string' ? profile.skills : skillsList.join(', '),
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      portfolioUrl: profile.portfolioUrl,
    };

    if (profile.cvFileName) configUpdates.cvFileName = profile.cvFileName;
    if (profile.cvExtractedText) configUpdates.cvExtractedText = profile.cvExtractedText;
    if (profile.cvAnalyzedAt) configUpdates.cvAnalyzedAt = profile.cvAnalyzedAt;

    const savedConfig = saveConfig(configUpdates);

    return NextResponse.json({
      success: true,
      message: `Profil pelamar berhasil diperbarui & ${savedQuestionsCount} soal screening tersimpan di PostgreSQL!`,
      savedQuestionsCount,
      config: savedConfig,
    });
  } catch (error: any) {
    console.error('Error confirming CV diff and screening questions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan profil dan bank soal' },
      { status: 500 }
    );
  }
}
