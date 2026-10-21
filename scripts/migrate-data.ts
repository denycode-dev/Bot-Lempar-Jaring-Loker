import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db, client } from '../src/db';
import {
  users,
  applicantProfiles,
  screeningQuestions,
  portalSessions,
} from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting Data Migration to PostgreSQL...');

  const userId = 'default-user';

  // 1. Seed Default User
  console.log('👤 Seeding default user...');
  await db
    .insert(users)
    .values({
      id: userId,
      email: 'user@autoapply.local',
      name: 'Primary User',
    })
    .onConflictDoNothing();
  console.log('✅ User seeded.');

  // 2. Seed Default Applicant Profile
  console.log('📄 Seeding initial applicant profile...');
  const existingProfile = await db.query.applicantProfiles.findFirst({
    where: eq(applicantProfiles.userId, userId),
  });

  if (!existingProfile) {
    const configPath = path.join(process.cwd(), 'config.example.json');
    let exampleConfig: any = {};
    if (fs.existsSync(configPath)) {
      try {
        exampleConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch {
        console.warn('Could not read config.example.json');
      }
    }

    const skillsArray = (exampleConfig.skills || 'React, JavaScript, TypeScript, Tailwind CSS, REST API, Git')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    await db.insert(applicantProfiles).values({
      userId,
      fullName: exampleConfig.fullName || 'Yoga Pratama',
      email: exampleConfig.email || 'pelamar@example.com',
      phone: exampleConfig.phoneNumber || '081234567890',
      currentAddress: exampleConfig.address || 'Jakarta, Indonesia',
      linkedinUrl: exampleConfig.linkedinUrl || 'https://linkedin.com/in/example',
      githubUrl: exampleConfig.githubUrl || 'https://github.com/example',
      portfolioUrl: exampleConfig.portfolioUrl || 'https://example.com',
      professionalSummary: 'Full Stack & Frontend Software Engineer dengan pengalaman membangun aplikasi modern.',
      skills: skillsArray,
      workExperiences: [
        {
          company: 'Tech Solutions Indonesia',
          role: 'Frontend Developer',
          period: '2023 - Sekarang',
          highlights: 'Mengembangkan dashboard internal, micro-frontend, dan integrasi API.',
        },
      ],
      education: [
        {
          institution: 'Universitas Indonesia',
          degree: exampleConfig.educationLevel || 'Sarjana (S1)',
          field: 'Teknik Informatika',
          graduationYear: 2023,
          gpa: exampleConfig.gpa || '3.50',
        },
      ],
      workAuthorizationStatus: "I'm an Indonesian citizen",
      requiresVisaSponsorship: false,
      noticePeriod: exampleConfig.noticePeriod || 'Immediately',
      expectedSalaryMin: Number(exampleConfig.minSalary || 5000000),
      expectedSalaryMax: Number(exampleConfig.expectedSalary || 10000000),
      salaryCurrency: 'IDR',
      eeoData: {
        gender: exampleConfig.gender || 'Laki-laki',
        maritalStatus: exampleConfig.maritalStatus || 'Single',
        dateOfBirth: exampleConfig.dateOfBirth || '2000-01-01',
        disabilityStatus: 'no',
        veteranStatus: 'no',
      },
    });
    console.log('✅ Applicant profile seeded.');
  } else {
    console.log('ℹ️ Applicant profile already exists, skipping.');
  }

  // 3. Seed Portal Sessions
  console.log('🌐 Seeding portal session records...');
  const portals = ['glints', 'jobstreet', 'linkedin', 'indeed'];
  for (const portal of portals) {
    await db
      .insert(portalSessions)
      .values({
        userId,
        portalName: portal,
        status: 'disconnected',
        isActive: true,
      })
      .onConflictDoNothing();
  }
  console.log('✅ Portal sessions initialized.');

  // 4. Ingest CSV Questions into screening_questions
  const csvPath = path.join(process.cwd(), 'public', 'imploye-question.csv');
  if (fs.existsSync(csvPath)) {
    console.log(`📥 Reading CSV questions from: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf8');
    const records: string[][] = parse(content, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
    });

    console.log(`📊 Total rows in CSV: ${records.length}`);
    const questionMap = new Map<string, {
      userId: string;
      questionText: string;
      normalizedQuestion: string;
      answerText: string;
      category: string;
      matchType: string;
      confidenceScore: string;
      reviewStatus: string;
      portalSource: string;
      usageCount: number;
    }>();

    for (let i = 1; i < records.length; i++) {
      const cols = records[i];
      if (!cols || cols.length < 2) continue;

      let q = '';
      let answerRaw = '';

      if (cols.length >= 4) {
        q = cols[0] || '';
        answerRaw = cols[3] || '';
      } else if (cols.length === 3) {
        q = cols[0] || '';
        answerRaw = cols[2] || '';
      } else if (cols.length === 2) {
        q = cols[0] || '';
        answerRaw = cols[1] || '';
      }

      q = q.trim();
      answerRaw = answerRaw.trim();
      if (!q || !answerRaw) continue;

      const normalized = q.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!normalized) continue;

      let category = 'general';
      const qLower = q.toLowerCase();
      if (qLower.includes('salary') || qLower.includes('gaji') || qLower.includes('remuneration')) {
        category = 'salary';
      } else if (qLower.includes('experience') || qLower.includes('pengalaman') || qLower.includes('tahun')) {
        category = 'experience';
      } else if (qLower.includes('skill') || qLower.includes('framework') || qLower.includes('library') || qLower.includes('developer') || qLower.includes('bahasa')) {
        category = 'skills';
      } else if (qLower.includes('right to work') || qLower.includes('visa') || qLower.includes('warga negara') || qLower.includes('sponsorship')) {
        category = 'work_auth';
      } else if (qLower.includes('notice') || qLower.includes('kapan') || qLower.includes('start')) {
        category = 'availability';
      } else if (qLower.includes('pendidikan') || qLower.includes('degree') || qLower.includes('qualification') || qLower.includes('lulus')) {
        category = 'education';
      }

      questionMap.set(normalized, {
        userId,
        questionText: q,
        normalizedQuestion: normalized,
        answerText: answerRaw,
        category,
        matchType: 'exact',
        confidenceScore: '1.00',
        reviewStatus: 'verified',
        portalSource: 'imploye-question.csv',
        usageCount: 0,
      });
    }

    console.log(`✨ Unique normalized questions to insert: ${questionMap.size}`);

    const allQuestions = Array.from(questionMap.values());
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize);
      await db
        .insert(screeningQuestions)
        .values(batch)
        .onConflictDoNothing();
      inserted += batch.length;
      if (inserted % 200 === 0 || inserted === allQuestions.length) {
        console.log(`  Processed ${inserted}/${allQuestions.length} questions...`);
      }
    }

    console.log(`✅ Ingested ${inserted} questions into PostgreSQL.`);
  }

  console.log('🎉 Migration completed successfully!');
  await client.end();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
