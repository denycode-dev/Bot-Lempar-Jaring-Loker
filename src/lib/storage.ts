import { db } from '../db';
import { jobApplications, applicationQaLogs } from '../db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

export interface AppliedJob {
  id?: string;
  company: string;
  title: string;
  platform: string;
  jobUrl: string;
  date: string;
  status: string;
  salary?: string;
  location?: string;
  matchScore?: number;
  matchReason?: string;
  coverLetterText?: string;
  screenshotPath?: string;
  questionsAndAnswers?: Array<{
    question: string;
    answer: string;
    type?: string;
  }>;
}

// In-memory cache for fast O(1) duplicate checks and responsive UI
let memoryCache: {
  timestamp: number;
  data: AppliedJob[];
  urlSet: Set<string>;
} | null = null;

// Clean and normalize URLs across platforms
export function cleanJobUrl(url: string): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url);

    // Indeed: Unique identifier is in query param 'jk' or 'vjk'
    if (urlObj.hostname.includes('indeed.com')) {
      const jk = urlObj.searchParams.get('jk') || urlObj.searchParams.get('vjk');
      if (jk) {
        return `https://${urlObj.hostname}/viewjob?jk=${jk}`;
      }
      return url.trim();
    }

    // LinkedIn: Unique identifier currentJobId
    if (urlObj.hostname.includes('linkedin.com')) {
      const currentJobId = urlObj.searchParams.get('currentJobId');
      if (currentJobId) {
        return `https://www.linkedin.com/jobs/view/${currentJobId}`;
      }
      return `${urlObj.origin}${urlObj.pathname.replace(/\/+$/, '')}`;
    }

    // Glints, JobStreet, etc: Pathname is unique
    return `${urlObj.origin}${urlObj.pathname.replace(/\/+$/, '')}`;
  } catch {
    return url.trim();
  }
}

/**
 * Retrieve applied jobs from PostgreSQL with in-memory caching (30s)
 */
export async function getAppliedJobs(forceRefresh = false): Promise<AppliedJob[]> {
  const now = Date.now();

  if (!forceRefresh && memoryCache && now - memoryCache.timestamp < 30000) {
    return memoryCache.data;
  }

  let jobs: AppliedJob[] = [];

  try {
    const rows = await db
      .select({
        id: jobApplications.id,
        company: jobApplications.company,
        title: jobApplications.jobTitle,
        platform: jobApplications.portal,
        jobUrl: jobApplications.jobUrl,
        date: jobApplications.appliedAt,
        status: jobApplications.status,
        salary: jobApplications.salaryInfo,
        location: jobApplications.location,
        matchScore: jobApplications.matchScore,
        matchReason: jobApplications.matchReason,
        coverLetterText: jobApplications.coverLetterText,
        screenshotPath: jobApplications.screenshotPath,
      })
      .from(jobApplications)
      .where(eq(jobApplications.userId, 'default-user'))
      .orderBy(desc(jobApplications.appliedAt));

    // Fetch related QA logs
    const qaRows = await db
      .select()
      .from(applicationQaLogs);

    const qaMap = new Map<string, Array<{ question: string; answer: string; type?: string }>>();
    for (const qa of qaRows) {
      const list = qaMap.get(qa.applicationId) || [];
      list.push({
        question: qa.questionAsked,
        answer: qa.answerGiven,
        type: qa.source,
      });
      qaMap.set(qa.applicationId, list);
    }

    jobs = rows.map((r) => ({
      id: r.id,
      company: r.company,
      title: r.title,
      platform: r.platform,
      jobUrl: r.jobUrl,
      date: r.date ? new Date(r.date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '',
      status: r.status,
      salary: r.salary || undefined,
      location: r.location || undefined,
      matchScore: r.matchScore ? Number(r.matchScore) : undefined,
      matchReason: r.matchReason || undefined,
      coverLetterText: r.coverLetterText || undefined,
      screenshotPath: r.screenshotPath || undefined,
      questionsAndAnswers: qaMap.get(r.id) || undefined,
    }));
  } catch (err: any) {
    console.error('Failed to read applied jobs from PostgreSQL:', err?.message || err);
    jobs = [];
  }

  // Populate in-memory Set for O(1) duplicate checks
  const urlSet = new Set<string>();
  jobs.forEach((j) => {
    const cleaned = cleanJobUrl(j.jobUrl);
    if (cleaned && !cleaned.endsWith('/viewjob') && !cleaned.endsWith('/jobs')) {
      urlSet.add(cleaned);
    }
  });

  memoryCache = {
    timestamp: now,
    data: jobs,
    urlSet,
  };

  return jobs;
}

/**
 * Add a new applied job record into PostgreSQL
 */
export async function addAppliedJob(job: {
  company: string;
  title: string;
  platform: string;
  jobUrl: string;
  status: string;
  salary?: string;
  location?: string;
  matchScore?: number;
  matchReason?: string;
  coverLetterText?: string;
  screenshotPath?: string;
  botRunId?: string;
  questionsAndAnswers?: Array<{
    question: string;
    answer: string;
    type?: string;
  }>;
}): Promise<void> {
  const cleanedUrl = cleanJobUrl(job.jobUrl);

  try {
    const [inserted] = await db
      .insert(jobApplications)
      .values({
        userId: 'default-user',
        botRunId: job.botRunId || null,
        portal: job.platform || 'General',
        jobTitle: job.title || 'Untitled Job',
        company: job.company || 'Unknown Company',
        location: job.location || null,
        jobUrl: cleanedUrl || job.jobUrl,
        status: job.status || 'applied',
        salaryInfo: job.salary || null,
        matchScore: job.matchScore ? String(job.matchScore) : null,
        matchReason: job.matchReason || null,
        coverLetterText: job.coverLetterText || null,
        screenshotPath: job.screenshotPath || null,
        appliedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [jobApplications.userId, jobApplications.jobUrl],
        set: {
          status: job.status || 'applied',
          salaryInfo: job.salary || null,
          location: job.location || null,
          appliedAt: new Date(),
        },
      })
      .returning({ id: jobApplications.id });

    // Insert Q&A audit logs if present
    if (inserted?.id && Array.isArray(job.questionsAndAnswers) && job.questionsAndAnswers.length > 0) {
      const qaInserts = job.questionsAndAnswers.map((qa) => ({
        applicationId: inserted.id,
        questionAsked: qa.question || '',
        answerGiven: qa.answer || '',
        source: qa.type || 'bot',
        confidence: '1.00',
      }));

      await db.insert(applicationQaLogs).values(qaInserts).onConflictDoNothing();
    }

    // Invalidate memory cache so next read reflects newly inserted job
    if (memoryCache) {
      memoryCache.timestamp = 0;
      if (cleanedUrl) {
        memoryCache.urlSet.add(cleanedUrl);
      }
    }
  } catch (err: any) {
    console.error('Failed to insert applied job to PostgreSQL:', err?.message || err);
  }
}

/**
 * Fast O(1) duplicate check
 */
export async function isJobAlreadyApplied(jobUrl: string): Promise<boolean> {
  const cleanedUrl = cleanJobUrl(jobUrl);
  if (!cleanedUrl || cleanedUrl.endsWith('/viewjob') || cleanedUrl.endsWith('/jobs')) {
    return false;
  }

  // Check in-memory Set first
  if (memoryCache && memoryCache.urlSet.has(cleanedUrl)) {
    return true;
  }

  // Fast index query against PostgreSQL
  try {
    const existing = await db.query.jobApplications.findFirst({
      where: and(
        eq(jobApplications.userId, 'default-user'),
        eq(jobApplications.jobUrl, cleanedUrl)
      ),
      columns: { id: true },
    });

    if (existing) {
      if (memoryCache) {
        memoryCache.urlSet.add(cleanedUrl);
      }
      return true;
    }
  } catch (err) {
    console.warn('DB check for isJobAlreadyApplied failed, checking cache:', err);
  }

  return false;
}

/**
 * Export applied jobs to CSV formatted string
 */
export async function exportAppliedJobsCsv(): Promise<string> {
  const jobs = await getAppliedJobs(true);
  const headers = ['Company', 'Title', 'Platform', 'Job URL', 'Date', 'Status', 'Salary', 'Location'];
  const rows = jobs.map((j) => [
    `"${(j.company || '').replace(/"/g, '""')}"`,
    `"${(j.title || '').replace(/"/g, '""')}"`,
    `"${(j.platform || '').replace(/"/g, '""')}"`,
    `"${(j.jobUrl || '').replace(/"/g, '""')}"`,
    `"${(j.date || '').replace(/"/g, '""')}"`,
    `"${(j.status || '').replace(/"/g, '""')}"`,
    `"${(j.salary || '').replace(/"/g, '""')}"`,
    `"${(j.location || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Test active storage connection
 */
export async function testActiveStorage(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await db.execute(sql`SELECT 1 as connected`);
    if (result && result.length > 0) {
      return {
        success: true,
        message: 'PostgreSQL Database Terhubung (autoapply)',
      };
    }
    return {
      success: false,
      message: 'PostgreSQL tidak merespons query tes',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal terhubung ke PostgreSQL: ${err?.message || err}`,
    };
  }
}
