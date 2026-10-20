export interface BrowserProfileAccount {
  id: string;
  name: string;
  profileFolder: string;
  createdAt: string;
}

export interface AiEndpointConfig {
  id: string;
  name: string;
  type: 'gemini' | 'openai_compatible';
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive?: boolean;
}

export interface AppConfig {
  storageType?: 'sqlite' | 'json' | 'sheets';
  spreadsheetId: string;
  sheetName: string;
  googleCredentialsJson: string;
  searchKeywords: string;
  location: string;
  minSalary: string;
  limitPerDay: number;
  limitMode?: 'shared' | 'per_platform';
  limitGlints?: number;
  limitJobstreet?: number;
  limitLinkedin?: number;
  limitIndeed?: number;
  enableGlints: boolean;
  enableJobstreet: boolean;
  enableLinkedin?: boolean;
  enableIndeed?: boolean;
  indeedNoJobTitleFilter?: boolean;
  debugTest: boolean;
  concurrency: number;
  browserEngine?: 'camoufox';
  noticePeriod?: string;
  fullName?: string;
  email?: string;
  gender?: string;
  maritalStatus?: string;
  dateOfBirth?: string;
  postalCode?: string;
  expectedSalary?: number;
  educationLevel?: string;
  gpa?: string;
  yearsOfExperience?: number;
  skills?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  domicile?: string;
  address?: string;
  cvFileName?: string;
  cvFilePath?: string;
  cvExtractedText?: string;
  cvAnalyzedAt?: string;
  aiProvider?: 'gemini' | 'custom_router';
  geminiApiKey?: string;
  customAiBaseUrl?: string;
  customAiApiKey?: string;
  customAiModel?: string;
  aiEndpoints?: AiEndpointConfig[];
  activeAiEndpointId?: string;
  browserAccounts?: BrowserProfileAccount[];
  activeBrowserAccountId?: string;
  enableCoverLetterGen?: boolean;
  enableJobMatchFilter?: boolean;
  minMatchScore?: number;
  negativeKeywords?: string;
  blacklistedCompanies?: string;
  autoApplyMode?: 'auto' | 'review';
  enableHumanStealth?: boolean;
  portalCookies?: {
    linkedin?: string;
    indeed?: string;
    glints?: string;
    jobstreet?: string;
  };
  // Search Filters
  datePosted?: '' | '24h' | 'week' | 'month';
  jobType?: string[];        // 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
  workMode?: string[];       // 'onsite' | 'hybrid' | 'remote'
  experienceLevel?: string[]; // 'fresh' | '1-3' | '3-5' | '5+'
  // EEO / Work Authorization
  citizenshipStatus?: string;
  visaRequired?: boolean;
  disabilityStatus?: 'yes' | 'no' | 'prefer_not_to_say';
  veteranStatus?: 'yes' | 'no' | 'prefer_not_to_say';
}

export interface AppliedJob {
  company: string;
  title: string;
  platform: string;
  jobUrl: string;
  date: string;
  status: string;
  salary?: string;
  location?: string;
  questionsAndAnswers?: Array<{
    question: string;
    answer: string;
    type?: string;
  }>;
}

export interface QuestionItem {
  id: string;
  question: string;
  type: string;
  options: string;
  answer: string;
}

export interface ConfigPreset {
  id: string;
  name: string;
  savedAt: string; // ISO string
  config: AppConfig;
}

export type NavTab = 'wizard' | 'questions' | 'logs' | 'history' | 'jobs' | 'talent' | 'settings';
export type WizardStep = 1 | 2;
