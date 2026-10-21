import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// 1. Users (Future-Ready Tenant Anchor)
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey().default('default-user'),
  email: varchar('email', { length: 255 }).notNull().default('user@autoapply.local'),
  name: varchar('name', { length: 255 }).notNull().default('Primary User'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Applicant Profiles
export const applicantProfiles = pgTable(
  'applicant_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    currentAddress: text('current_address'),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    githubUrl: varchar('github_url', { length: 500 }),
    portfolioUrl: varchar('portfolio_url', { length: 500 }),
    professionalSummary: text('professional_summary'),
    skills: jsonb('skills').$type<string[]>().default([]).notNull(),
    workExperiences: jsonb('work_experiences').$type<any[]>().default([]).notNull(),
    education: jsonb('education').$type<any[]>().default([]).notNull(),
    workAuthorizationStatus: varchar('work_authorization_status', { length: 100 }),
    requiresVisaSponsorship: boolean('requires_visa_sponsorship').default(false).notNull(),
    noticePeriod: varchar('notice_period', { length: 50 }),
    expectedSalaryMin: integer('expected_salary_min'),
    expectedSalaryMax: integer('expected_salary_max'),
    salaryCurrency: varchar('salary_currency', { length: 10 }).default('IDR').notNull(),
    eeoData: jsonb('eeo_data').$type<Record<string, any>>().default({}).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_profiles_user_unique').on(table.userId),
  ]
);

// 3. CV Documents
export const cvDocuments = pgTable(
  'cv_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    filePath: varchar('file_path', { length: 1000 }).notNull(),
    fileHash: varchar('file_hash', { length: 64 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    extractedText: text('extracted_text').notNull(),
    aiAnalysisSummary: jsonb('ai_analysis_summary').$type<Record<string, any>>(),
    isPrimary: boolean('is_primary').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_cv_user').on(table.userId),
  ]
);

// 4. AI Provider Credentials (AES-256-GCM Protected)
export const aiProviderCredentials = pgTable(
  'ai_provider_credentials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    provider: varchar('provider', { length: 50 }).notNull(),
    modelName: varchar('model_name', { length: 100 }).notNull(),
    baseUrl: varchar('base_url', { length: 500 }),
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    iv: varchar('iv', { length: 64 }).notNull(),
    authTag: varchar('auth_tag', { length: 64 }).notNull(),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    priority: integer('priority').default(1).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_provider_user_unique').on(table.userId, table.provider),
  ]
);

// 5. Screening Questions Bank
export const screeningQuestions = pgTable(
  'screening_questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    questionText: text('question_text').notNull(),
    normalizedQuestion: text('normalized_question').notNull(),
    answerText: text('answer_text').notNull(),
    category: varchar('category', { length: 50 }).default('general').notNull(),
    matchType: varchar('match_type', { length: 30 }).default('exact').notNull(),
    confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }).default('1.00').notNull(),
    reviewStatus: varchar('review_status', { length: 30 }).default('verified').notNull(),
    portalSource: varchar('portal_source', { length: 50 }),
    usageCount: integer('usage_count').default(0).notNull(),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_questions_normalized_user').on(table.userId, table.normalizedQuestion),
    index('idx_questions_review_status').on(table.reviewStatus),
    index('idx_questions_category').on(table.category),
  ]
);

// 6. Portal Sessions
export const portalSessions = pgTable(
  'portal_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    portalName: varchar('portal_name', { length: 50 }).notNull(),
    status: varchar('status', { length: 30 }).default('disconnected').notNull(),
    lastCheckedAt: timestamp('last_checked_at'),
    cookiesExpireAt: timestamp('cookies_expire_at'),
    lastErrorMessage: text('last_error_message'),
    isActive: boolean('is_active').default(true).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_portal_sessions_user_portal').on(table.userId, table.portalName),
  ]
);

// 9. Bot Runs (Audit History) - declared before jobApplications to resolve foreign key reference
export const botRuns = pgTable(
  'bot_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    portal: varchar('portal', { length: 50 }).notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    finishedAt: timestamp('finished_at'),
    status: varchar('status', { length: 30 }).default('running').notNull(),
    jobsDiscovered: integer('jobs_discovered').default(0).notNull(),
    jobsApplied: integer('jobs_applied').default(0).notNull(),
    jobsFailed: integer('jobs_failed').default(0).notNull(),
    searchCriteriaSnapshot: jsonb('search_criteria_snapshot').$type<Record<string, any>>().default({}).notNull(),
    errorSummary: text('error_summary'),
  },
  (table) => [
    index('idx_bot_runs_started_at').on(table.startedAt),
  ]
);

// 7. Job Applications
export const jobApplications = pgTable(
  'job_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    botRunId: uuid('bot_run_id').references(() => botRuns.id, { onDelete: 'set null' }),
    portal: varchar('portal', { length: 50 }).notNull(),
    jobId: varchar('job_id', { length: 255 }),
    jobTitle: text('job_title').notNull(),
    company: text('company').notNull(),
    location: text('location'),
    jobUrl: text('job_url').notNull(),
    status: varchar('status', { length: 50 }).default('applied').notNull(),
    salaryInfo: text('salary_info'),
    matchScore: numeric('match_score', { precision: 5, scale: 2 }),
    matchReason: text('match_reason'),
    coverLetterText: text('cover_letter_text'),
    screenshotPath: text('screenshot_path'),
    appliedAt: timestamp('applied_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_applications_job_url_unique').on(table.userId, table.jobUrl),
    index('idx_applications_portal').on(table.portal),
    index('idx_applications_status').on(table.status),
    index('idx_applications_applied_at').on(table.appliedAt),
  ]
);

// 8. Application Q&A Audit Logs
export const applicationQaLogs = pgTable(
  'application_qa_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    applicationId: uuid('application_id')
      .references(() => jobApplications.id, { onDelete: 'cascade' })
      .notNull(),
    questionAsked: text('question_asked').notNull(),
    answerGiven: text('answer_given').notNull(),
    source: varchar('source', { length: 50 }).notNull(),
    confidence: numeric('confidence', { precision: 3, scale: 2 }).default('1.00').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_qa_logs_app_id').on(table.applicationId),
  ]
);

// 10. Sourced Talents (Reverse Talent Scout)
export const sourcedTalents = pgTable(
  'sourced_talents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    candidateName: varchar('candidate_name', { length: 255 }).notNull(),
    headline: varchar('headline', { length: 500 }),
    currentCompany: varchar('current_company', { length: 255 }),
    location: varchar('location', { length: 255 }),
    profileUrl: text('profile_url').notNull(),
    snippet: text('snippet'),
    matchedSkills: jsonb('matched_skills').$type<string[]>().default([]).notNull(),
    sourcingPlatform: varchar('sourcing_platform', { length: 50 }).default('google_xray').notNull(),
    sourcedAt: timestamp('sourced_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_talents_profile_url_unique').on(table.userId, table.profileUrl),
  ]
);
