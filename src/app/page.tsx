'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Database,
  Terminal,
  History,
  Play,
  Square,
  KeyRound,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Edit3,
  Globe,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Check,
  Sun,
  Moon,
  Upload,
  FileUp,
  Download,
  FileJson,
  FileText,
  Bot,
  Users,
  UserCheck,
  ShieldAlert,
  FolderOpen,
  Eye,
  EyeOff,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  Clock,
  X,
  RotateCcw,
  Sliders,
  Settings2,
  Briefcase,
  Filter,
  MapPin,
  Tag,
  Info,
  Lightbulb,
  Search,
  Copy,
  Target,
  Menu,
  Save,
} from 'lucide-react';
import { OnboardingTour } from '@/components/OnboardingTour';
import BatchQuestionModal from '@/components/BatchQuestionModal';
import TalentScoutTab from '@/components/TalentScoutTab';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { PortalStatusGrid } from '@/components/wizard/PortalStatusGrid';
import { ProfileStep } from '@/components/wizard/ProfileStep';
import { TargetCriteriaStep } from '@/components/wizard/TargetCriteriaStep';
import { TerminalLogViewer } from '@/components/logs/TerminalLogViewer';
import { QuestionsBank } from '@/components/questions/QuestionsBank';
import { AppliedJobsView } from '@/components/history/AppliedJobsView';
import { SettingsTab } from '@/components/settings/SettingsTab';
import { JobDetailDialog } from '@/components/modals/JobDetailDialog';
import { QuestionFormDialog } from '@/components/modals/QuestionFormDialog';
import { AddAccountDialog } from '@/components/modals/AddAccountDialog';
import { PresetsDialog } from '@/components/modals/PresetsDialog';
import { CvDiffDialog } from '@/components/modals/CvDiffDialog';
import { CookieImportDialog } from '@/components/modals/CookieImportDialog';
import { ProfileSyncDialog } from '@/components/modals/ProfileSyncDialog';
import type {
  BrowserProfileAccount,
  AiEndpointConfig,
  AppConfig,
  AppliedJob,
  QuestionItem,
  ConfigPreset,
  NavTab,
  WizardStep,
} from '@/types';

const DRAFT_KEY = 'autoapply-draft';
const OLD_DRAFT_KEY = 'cv-blaster-draft';
const PRESETS_KEY = 'autoapply-presets';
const OLD_PRESETS_KEY = 'cv-blaster-presets';

export default function Home() {
  const [config, setConfig] = useState<AppConfig>({
    storageType: 'sqlite',
    spreadsheetId: '',
    sheetName: 'Sheet1',
    googleCredentialsJson: '',
    searchKeywords: '',
    location: '',
    minSalary: '',
    limitPerDay: 200,
    limitMode: 'shared',
    limitGlints: 80,
    limitJobstreet: 75,
    limitLinkedin: 50,
    limitIndeed: 50,
    enableGlints: true,
    enableJobstreet: true,
    enableLinkedin: true,
    enableIndeed: true,
    indeedNoJobTitleFilter: false,
    blacklistedCompanies: '',
    negativeKeywords: 'magang, intern, unpaid, sales lapangan, mandarin',
    autoApplyMode: 'auto',
    debugTest: true,
    concurrency: 3,
  browserEngine: 'camoufox',
  noticePeriod: 'Immediately',
    fullName: '',
    email: '',
    gender: 'Laki-laki',
    maritalStatus: 'Single',
    dateOfBirth: '',
    postalCode: '',
    expectedSalary: 5000000,
    educationLevel: 'Sarjana (S1)',
    gpa: '',
    yearsOfExperience: 1,
    skills: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    phoneNumber: '',
    domicile: '',
    address: '',
    cvFileName: '',
    cvFilePath: '',
    cvExtractedText: '',
    cvAnalyzedAt: '',
    aiProvider: 'custom_router',
    geminiApiKey: '',
    customAiBaseUrl: 'https://api.9router.com/v1',
    customAiApiKey: '',
    customAiModel: 'google/gemini-2.5-flash',
    activeAiEndpointId: 'ep-primary',
    aiEndpoints: [
      {
        id: 'ep-primary',
        name: '9Router (OpenAI-Compatible)',
        type: 'openai_compatible',
        baseUrl: 'https://api.9router.com/v1',
        apiKey: '',
        model: 'google/gemini-2.5-flash',
        isActive: true,
      },
    ],
    activeBrowserAccountId: 'account-1',
    browserAccounts: [
      {
        id: 'account-1',
        name: 'Akun Utama',
        profileFolder: 'automation-profile',
        createdAt: '2026-09-19',
      },
    ],
    datePosted: '',
    jobType: [],
    workMode: [],
    experienceLevel: [],
    citizenshipStatus: 'WNI',
    visaRequired: false,
    disabilityStatus: 'prefer_not_to_say',
    veteranStatus: 'prefer_not_to_say',
  });

  const [activeTab, setActiveTab] = useState<NavTab>('wizard');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  const [logs, setLogs] = useState<string[]>([]);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [isSetupBrowserRunning, setIsSetupBrowserRunning] = useState(false);
  const [isSetupBrowserLoading, setIsSetupBrowserLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [selectedJobDetail, setSelectedJobDetail] = useState<AppliedJob | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Question CSV state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [rawCsvText, setRawCsvText] = useState('');
  const [csvViewMode, setCsvViewMode] = useState<'table' | 'raw'>('table');
  const [questionSearch, setQuestionSearch] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);
  const [isBatchAiModalOpen, setIsBatchAiModalOpen] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState<Omit<QuestionItem, 'id'>>({
    question: '',
    type: 'radiobutton',
    options: '',
    answer: '',
  });

  const filteredQuestions = useMemo(() => {
    if (!questionSearch.trim()) return questions;
    const term = questionSearch.toLowerCase();
    return questions.filter((q) =>
      q.question.toLowerCase().includes(term) ||
      q.answer.toLowerCase().includes(term) ||
      q.type.toLowerCase().includes(term) ||
      (q.options && q.options.toLowerCase().includes(term))
    );
  }, [questions, questionSearch]);

  // Multi-Account & Session Status State
  const [isCheckingSessions, setIsCheckingSessions] = useState(false);
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, {
    glints: { loggedIn: boolean; details?: string };
    jobstreet: { loggedIn: boolean; details?: string };
    linkedin: { loggedIn: boolean; details?: string };
    indeed: { loggedIn: boolean; details?: string };
  }>>({});
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [cookieTargetPlatform, setCookieTargetPlatform] = useState<'linkedin' | 'indeed' | 'glints' | 'jobstreet'>('linkedin');
  const [rawCookieInput, setRawCookieInput] = useState('');

  // CV Upload & Dynamic Diff Tracking States
  const [shouldUpdateProfileWithCv, setShouldUpdateProfileWithCv] = useState(true);
  const [updatedCvFields, setUpdatedCvFields] = useState<string[]>([]);
  const [unchangedCvFields, setUnchangedCvFields] = useState<string[]>([]);
  const [cvAnalysisSummary, setCvAnalysisSummary] = useState<string>('');
  const [isCvPreviewOpen, setIsCvPreviewOpen] = useState(false);
  const [cvPreviewTab, setCvPreviewTab] = useState<'diff' | 'raw'>('diff');
  const [pendingParsedCv, setPendingParsedCv] = useState<any>(null);
  const [pendingDiffList, setPendingDiffList] = useState<Array<{ field: string; label: string; oldVal: string; newVal: string; willChange: boolean }>>([]);
  const [selectedDiffFields, setSelectedDiffFields] = useState<Set<string>>(new Set());

  // Web Profile Two-Way Sync Import State
  const [detectedWebProfile, setDetectedWebProfile] = useState<any>(null);
  const [isProfileImportModalOpen, setIsProfileImportModalOpen] = useState(false);
  const [isProfileSyncDropdownOpen, setIsProfileSyncDropdownOpen] = useState(false);
  const [selectedWebProfileFields, setSelectedWebProfileFields] = useState<Set<string>>(new Set(['fullName', 'phoneNumber', 'email', 'domicile', 'educationLevel', 'skills']));

  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Preset history state
  const [configPresets, setConfigPresets] = useState<ConfigPreset[]>([]);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize theme changes with media query and DOM after mount
  useEffect(() => {
    setIsMounted(true);
    const stored = (localStorage.getItem('theme') as 'system' | 'dark' | 'light') || 'system';
    setThemeMode(stored);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = (mode: 'system' | 'dark' | 'light') => {
      const isDark = mode === 'system' ? mediaQuery.matches : mode === 'dark';
      setResolvedTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateResolvedTheme(stored);

    const handleChange = () => {
      const currentStored = (localStorage.getItem('theme') as 'system' | 'dark' | 'light') || 'system';
      if (currentStored === 'system') {
        updateResolvedTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESETS_KEY) || localStorage.getItem(OLD_PRESETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConfigPreset[];
        if (Array.isArray(parsed)) setConfigPresets(parsed);
      }
    } catch {}
  }, []);

  // Auto-save draft to localStorage (debounced 800ms)
  useEffect(() => {
    if (!isMounted) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(config));
      } catch {}
    }, 800);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [config, isMounted]);

  // Preset helpers
  const persistPresets = useCallback((list: ConfigPreset[]) => {
    setConfigPresets(list);
    try { localStorage.setItem(PRESETS_KEY, JSON.stringify(list)); } catch {}
  }, []);

  const handleSavePreset = useCallback(() => {
    const name = newPresetName.trim();
    if (!name) { toast.error('Nama preset tidak boleh kosong'); return; }
    setIsSavingPreset(true);
    const preset: ConfigPreset = {
      id: `preset-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      config: { ...config },
    };
    const updated = [preset, ...configPresets];
    persistPresets(updated);
    setNewPresetName('');
    setShowSavePresetInput(false);
    setIsSavingPreset(false);
    toast.success(`Preset "${name}" berhasil disimpan!`);
  }, [newPresetName, config, configPresets, persistPresets]);

  const handleLoadPreset = useCallback(async (preset: ConfigPreset) => {
    const merged = { ...config, ...preset.config };
    setConfig(merged);
    setIsPresetsModalOpen(false);
    toast.success(`Preset "${preset.name}" berhasil dimuat!`);
    
    // Auto sync to backend immediately so refresh won't lose it
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      fetchAppliedHistory();
    } catch {}
  }, [config]);

  const handleOverwritePreset = useCallback((preset: ConfigPreset) => {
    const updated = configPresets.map(p =>
      p.id === preset.id ? { ...p, config: { ...config }, savedAt: new Date().toISOString() } : p
    );
    persistPresets(updated);
    toast.success(`Preset "${preset.name}" berhasil diperbarui!`);
  }, [configPresets, config, persistPresets]);

  const handleDeletePreset = useCallback((preset: ConfigPreset) => {
    if (!confirm(`Hapus preset "${preset.name}"?`)) return;
    persistPresets(configPresets.filter(p => p.id !== preset.id));
    toast.info(`Preset "${preset.name}" dihapus`);
  }, [configPresets, persistPresets]);

  const handleRestoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY) || localStorage.getItem(OLD_DRAFT_KEY);
      if (!raw) { toast.info('Tidak ada draft tersimpan'); return; }
      const draft = JSON.parse(raw) as AppConfig;
      setConfig(prev => ({ ...prev, ...draft }));
      toast.success('Draft terakhir berhasil dipulihkan!');
    } catch { toast.error('Gagal memuat draft'); }
  }, []);

  const handleToggleTheme = () => {
    let nextMode: 'system' | 'dark' | 'light' = 'system';
    if (themeMode === 'system') {
      nextMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    } else if (themeMode === 'light') {
      nextMode = 'dark';
    } else {
      nextMode = 'system';
    }

    setThemeMode(nextMode);
    localStorage.setItem('theme', nextMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = nextMode === 'system' ? mediaQuery.matches : nextMode === 'dark';
    setResolvedTheme(isDark ? 'dark' : 'light');

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const label = nextMode === 'system' ? 'Sistem Browser' : nextMode === 'dark' ? 'Mode Gelap' : 'Mode Terang';
    toast.info(`Tema diubah ke ${label}`);
  };

  const eventSourceRef = useRef<EventSource | null>(null);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Calculate setup completion score and granular per-step input progress
  const readinessMetrics = useMemo(() => {
    let completedSteps = 0;
    
    // Step 1: Profil Wajib (Nama, No Telp, Skills)
    const step1Complete = Boolean(
      config.fullName?.trim() &&
      config.skills?.trim() &&
      config.phoneNumber?.trim()
    );

    // Step 1 Detailed Field Progress (15 fields total)
    const step1Fields = [
      { id: 'field-profile-fullname', label: 'Nama Lengkap', isFilled: Boolean(config.fullName?.trim()) },
      { id: 'field-profile-phone', label: 'Nomor Telepon / WhatsApp', isFilled: Boolean(config.phoneNumber?.trim()) },
      { id: 'field-profile-email', label: 'Email Pelamar', isFilled: Boolean((config as any).email?.trim()) },
      { id: 'field-profile-gender', label: 'Jenis Kelamin', isFilled: Boolean((config as any).gender) },
      { id: 'field-profile-marital', label: 'Status Pernikahan', isFilled: Boolean((config as any).maritalStatus) },
      { id: 'field-profile-dob', label: 'Tanggal Lahir', isFilled: Boolean((config as any).dateOfBirth?.trim()) },
      { id: 'field-profile-postal', label: 'Kode Pos Domisili', isFilled: Boolean((config as any).postalCode?.trim()) },
      { id: 'field-profile-salary', label: 'Gaji Bulanan yang Diharapkan', isFilled: Boolean(config.expectedSalary && Number(config.expectedSalary) > 0) },
      { id: 'field-profile-experience', label: 'Pengalaman Kerja', isFilled: Boolean(config.yearsOfExperience !== undefined && config.yearsOfExperience !== null && Number(config.yearsOfExperience) >= 0) },
      { id: 'field-profile-education', label: 'Pendidikan Terakhir', isFilled: Boolean(config.educationLevel?.trim()) },
      { id: 'field-profile-domicile', label: 'Domisili / Kota', isFilled: Boolean(config.domicile?.trim()) },
      { id: 'field-profile-portfolio', label: 'Link Portofolio', isFilled: Boolean(config.portfolioUrl?.trim()) },
      { id: 'field-profile-linkedin', label: 'Link LinkedIn', isFilled: Boolean(config.linkedinUrl?.trim()) },
      { id: 'field-profile-skills', label: 'Daftar Keahlian & Skills', isFilled: Boolean(config.skills?.trim()) },
      { id: 'tour-cv-upload', label: 'Dokumen CV Pelamar', isFilled: Boolean(config.cvFileName?.trim()) },
    ];
    const step1Filled = step1Fields.filter(f => f.isFilled).length;
    const step1Total = step1Fields.length;
    const step1Percent = Math.round((step1Filled / step1Total) * 100);

    // Step 2: Kriteria Target (Kata Kunci + Minimal 1 Platform)
    const hasPlatform = Boolean(config.enableGlints || config.enableJobstreet || config.enableLinkedin || config.enableIndeed);
    const hasKeywords = Boolean(config.searchKeywords?.trim() || config.indeedNoJobTitleFilter);
    const step2Complete = hasKeywords && hasPlatform;

    // Step 2 Detailed Criteria Progress (8 items total)
    const step2Fields = [
      { id: 'tour-criteria-platform', label: 'Platform Loker Aktif', isFilled: hasPlatform },
      { id: 'field-criteria-keywords', label: 'Kata Kunci Lowongan', isFilled: hasKeywords },
      { id: 'field-criteria-location', label: 'Lokasi Kerja', isFilled: Boolean(config.location?.trim()) },
      { id: 'field-criteria-salary', label: 'Filter Gaji Minimal', isFilled: Boolean(config.minSalary?.trim()) },
      { id: 'field-criteria-limit', label: 'Batasan Kuota Harian', isFilled: Boolean(config.limitPerDay && config.limitPerDay > 0) },
      { id: 'field-criteria-autoapplymode', label: 'Mode Eksekusi Lamaran', isFilled: Boolean(config.autoApplyMode) },
      { id: 'tour-smart-features', label: 'Surat Motivasi & Ketik Alami', isFilled: Boolean(config.enableHumanStealth !== undefined || config.enableCoverLetterGen !== undefined) },
      { id: 'field-criteria-blacklist', label: 'Penyaringan & Blacklist Loker', isFilled: Boolean(config.blacklistedCompanies?.trim() || config.negativeKeywords?.trim()) },
    ];
    const step2Filled = step2Fields.filter(f => f.isFilled).length;
    const step2Total = step2Fields.length;
    const step2Percent = Math.round((step2Filled / step2Total) * 100);

    // Step 3: Mesin Siap (Storage Ready + AI Config Ready)
    const hasStorage = Boolean(
      config.storageType === 'sqlite' ||
      config.storageType === 'json' ||
      (config.storageType === 'sheets' && config.spreadsheetId?.trim())
    );
    const hasAiFromEndpoints = Array.isArray(config.aiEndpoints) && config.aiEndpoints.some(ep => ep.apiKey && ep.apiKey.trim());
    const hasAi = Boolean(
      hasAiFromEndpoints ||
      (config.geminiApiKey && config.geminiApiKey.trim()) ||
      (config.customAiApiKey && config.customAiApiKey.trim())
    );
    const step3Complete = hasStorage && hasAi;

    // Pengaturan Sistem Progress (AI, Storage & Browser)
    const step3Fields = [
      { id: 'settings-ai-section', label: 'Endpoint & Model AI', isFilled: hasAi },
      { id: 'settings-storage-section', label: 'Media Penyimpanan Riwayat', isFilled: hasStorage },
      { id: 'settings-browser-section', label: 'Preferensi Browser & Otomasi', isFilled: Boolean(config.concurrency !== undefined) },
    ];
    const step3Filled = step3Fields.filter(f => f.isFilled).length;
    const step3Total = step3Fields.length;
    const step3Percent = Math.round((step3Filled / step3Total) * 100);

    if (step1Complete) completedSteps++;
    if (step2Complete) completedSteps++;
    if (step3Complete) completedSteps++;

    const percent = Math.round((completedSteps / 3) * 100);
    const isReady100 = completedSteps === 3;

    return {
      step1Complete,
      step1Filled,
      step1Total,
      step1Percent,
      step1Fields,
      step2Complete,
      step2Filled,
      step2Total,
      step2Percent,
      step2Fields,
      step3Complete,
      step3Filled,
      step3Total,
      step3Percent,
      step3Fields,
      completedSteps,
      percent,
      isReady100,
      hasStorage,
      hasAi,
      hasPlatform,
      hasKeywords,
    };
  }, [config]);

  // Lompat dan highlight border otomatis ke input yang belum terisi pada langkah tertentu
  const handleJumpToUnfilledField = useCallback((stepNum: 1 | 2 | 3) => {
    if (stepNum === 3) {
      setActiveTab('settings');
    } else {
      setActiveTab('wizard');
      setWizardStep(stepNum);
    }

    const fields = stepNum === 1
      ? readinessMetrics.step1Fields
      : stepNum === 2
      ? readinessMetrics.step2Fields
      : readinessMetrics.step3Fields;

    const firstUnfilled = fields.find(f => !f.isFilled);

    if (!firstUnfilled) {
      toast.success(`Semua input pada Langkah ${stepNum} sudah lengkap! 🎉`, {
        description: 'Semua kolom yang dibutuhkan telah terisi.',
      });
      return;
    }

    toast.info(`Mengarahkan ke: ${firstUnfilled.label}`, {
      description: 'Kolom ini belum terisi. Lengkapi untuk menyempurnakan kesiapan.',
      icon: '🎯',
    });

    setTimeout(() => {
      const el = document.getElementById(firstUnfilled.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const highlightClasses = [
          'ring-4',
          'ring-orange-500',
          'border-orange-500',
          'bg-orange-500/10',
          'shadow-xl',
          'shadow-orange-500/25',
          'transition-all',
          'duration-500',
          'rounded-2xl',
        ];
        el.classList.add(...highlightClasses);

        const inputEl = el.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          'input:not([type="hidden"]), select, textarea'
        );
        if (inputEl) {
          inputEl.focus({ preventScroll: true });
        }

        setTimeout(() => {
          el.classList.remove(...highlightClasses);
        }, 2800);
      }
    }, 120);
  }, [readinessMetrics]);

  // Auto scroll logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) return;
      const data = await res.json();
      const loaded = data.config || data;
      if (loaded && typeof loaded === 'object') {
        setConfig((prev) => ({ ...prev, ...loaded }));
      }
    } catch {}
  };

  const [activeStorageInfo, setActiveStorageInfo] = useState<string>('');

  const fetchAppliedHistory = async () => {
    try {
      const res = await fetch('/api/applied?refresh=true');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setAppliedJobs(data.data || []);
        if (data.storageInfo) {
          setActiveStorageInfo(data.storageInfo);
        }
      }
    } catch {}
  };

  const handleExportCsv = () => {
    window.open('/api/applied?export=csv', '_blank');
    toast.success('Mengunduh file CSV riwayat lamaran...');
  };

  const handleExportJson = () => {
    if (!appliedJobs.length) {
      toast.error('Belum ada data untuk diekspor');
      return;
    }
    const blob = new Blob([JSON.stringify(appliedJobs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoapply-applied-jobs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File JSON berhasil diunduh!');
  };

  const checkSetupBrowserStatus = async () => {
    try {
      const res = await fetch('/api/setup-login');
      if (!res.ok) return;
      const data = await res.json();
      setIsSetupBrowserRunning(Boolean(data.isRunning));
    } catch {}
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
        setRawCsvText(data.rawCsv || '');
      }
    } catch {
      toast.error('Gagal memuat database pertanyaan');
    }
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if (!isMounted) return;
      await fetchConfig();
      await fetchAppliedHistory();
      await fetchQuestions();
      await checkSetupBrowserStatus();
    };
    loadInitialData();

    // Re-check browser status only when user returns to window tab
    const handleFocus = () => {
      checkSetupBrowserStatus();
    };
    window.addEventListener('focus', handleFocus);

    // Light background poll every 15s (only if browser is active or page is visible)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkSetupBrowserStatus();
      }
    }, 15000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleSaveConfig = async (e?: React.FormEvent, silent = false, validateUpToStep: number = 3): Promise<boolean> => {
    if (e) e.preventDefault();

    // Frontend Validations: Step 1 (Profil Pelamar)
    if (validateUpToStep >= 1) {
      if (!config.fullName?.trim()) {
        toast.error('Validasi Gagal: Nama Lengkap wajib diisi!');
        setWizardStep(1);
        return false;
      }

      if (!config.phoneNumber?.trim()) {
        toast.error('Validasi Gagal: Nomor Telepon wajib diisi!');
        setWizardStep(1);
        return false;
      }

      if (!config.skills?.trim()) {
        toast.error('Validasi Gagal: Daftar Keahlian & Alat Kerja wajib diisi!');
        setWizardStep(1);
        return false;
      }
    }

    // Frontend Validations: Step 2 (Target & Kriteria)
    if (validateUpToStep >= 2) {
      if (config.concurrency < 1 || config.concurrency > 8) {
        toast.error('Validasi Gagal: Worker Konkuren harus antara 1 dan 8 tab!');
        setWizardStep(2);
        return false;
      }

      if (!config.searchKeywords?.trim() && !config.indeedNoJobTitleFilter) {
        toast.error('Validasi Gagal: Kata Kunci Lowongan wajib diisi di Langkah 2!');
        setWizardStep(2);
        return false;
      }
    }

    // Frontend Validations: Step 3 (Kredensial / Engine)
    if (validateUpToStep >= 3) {
      if (config.googleCredentialsJson?.trim()) {
        try {
          JSON.parse(config.googleCredentialsJson);
        } catch {
          toast.error('Format Tidak Valid: Google Credentials JSON harus berupa JSON valid!');
          setActiveTab('settings');
          return false;
        }
      }
    }

    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        if (!silent) toast.success('Konfigurasi berhasil disimpan');
        fetchAppliedHistory();
        return true;
      } else {
        toast.error(data.error || 'Gagal menyimpan konfigurasi');
        return false;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan';
      toast.error(errorMsg);
      return false;
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleToggleSetupBrowser = async (profileFolder?: string) => {
    if (isSetupBrowserLoading) return;
    setIsSetupBrowserLoading(true);
    try {
      const action = isSetupBrowserRunning ? 'stop' : 'start';
      if (action === 'start') {
        toast.info('Sedang meluncurkan browser setup...', { duration: 3000 });
      }
      const res = await fetch('/api/setup-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          profileFolderOverride: profileFolder || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSetupBrowserRunning(action === 'start');
        if (action === 'start') {
          toast.success('Jendela browser dibuka. Silakan masuk ke akun Anda lalu tutup browser jika selesai.');
        } else {
          toast.info('Jendela browser setup telah ditutup');
        }
      } else {
        toast.error(data.error || 'Gagal memproses jendela browser setup');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Kesalahan jaringan';
      toast.error(msg);
    } finally {
      setIsSetupBrowserLoading(false);
    }
  };

  // Check login sessions for a specific account or the active one
  const handleCheckAccountSessions = async (accountId?: string) => {
    const targetAccId = accountId || config.activeBrowserAccountId || 'account-1';
    const acc = config.browserAccounts?.find(a => a.id === targetAccId) || config.browserAccounts?.[0];
    const folder = acc?.profileFolder || 'automation-profile';

    setIsCheckingSessions(true);
    toast.info(`Memeriksa sesi login untuk "${acc?.name || 'Akun'}"...`);

    try {
      const res = await fetch('/api/check-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileFolder: folder }),
      });
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessionStatuses(prev => ({
          ...prev,
          [targetAccId]: data.sessions,
        }));
        toast.success(`Pengecekan sesi selesai untuk "${acc?.name || 'Akun'}"`);
      } else {
        toast.error(data.error || 'Gagal memeriksa sesi portal');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server';
      toast.error(msg);
    } finally {
      setIsCheckingSessions(false);
    }
  };

  // Add new browser profile account
  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) {
      toast.error('Nama akun tidak boleh kosong');
      return;
    }

    const currentAccounts = config.browserAccounts || [
      { id: 'account-1', name: 'Akun Utama', profileFolder: 'automation-profile', createdAt: '2026-09-19' }
    ];

    const newId = `account-${Date.now()}`;
    const safeFolderName = `automation-profile-${newAccountName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;

    const newAccount: BrowserProfileAccount = {
      id: newId,
      name: newAccountName.trim(),
      profileFolder: safeFolderName,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updatedAccounts = [...currentAccounts, newAccount];
    const updatedConfig: AppConfig = {
      ...config,
      browserAccounts: updatedAccounts,
      activeBrowserAccountId: newId, // otomatis aktifkan akun baru
    };

    setConfig(updatedConfig);
    setNewAccountName('');
    setIsAddAccountModalOpen(false);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Akun "${newAccount.name}" berhasil dibuat & diaktifkan!`);
      }
    } catch {
      toast.error('Gagal menyimpan profil akun baru');
    }
  };

  // Switch active browser account
  const handleSelectActiveAccount = async (accountId: string) => {
    if (config.activeBrowserAccountId === accountId) return;

    const targetAccount = config.browserAccounts?.find(a => a.id === accountId);
    const updatedConfig: AppConfig = {
      ...config,
      activeBrowserAccountId: accountId,
    };

    setConfig(updatedConfig);
    toast.info(`Beralih ke akun "${targetAccount?.name || accountId}"`);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });
    } catch {}
  };

  // Delete an account profile
  const handleDeleteAccount = async (accountId: string) => {
    const currentAccounts = config.browserAccounts || [];
    if (currentAccounts.length <= 1) {
      toast.error('Minimal harus ada satu profil akun');
      return;
    }

    const target = currentAccounts.find(a => a.id === accountId);
    if (!window.confirm(`Hapus akun "${target?.name || accountId}"? Folder sesi tidak akan dihapus dari disk.`)) {
      return;
    }

    const remaining = currentAccounts.filter(a => a.id !== accountId);
    const nextActiveId = config.activeBrowserAccountId === accountId ? remaining[0].id : config.activeBrowserAccountId;

    const updatedConfig: AppConfig = {
      ...config,
      browserAccounts: remaining,
      activeBrowserAccountId: nextActiveId,
    };

    setConfig(updatedConfig);
    toast.success(`Akun "${target?.name}" dihapus`);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });
    } catch {}
  };

  const executeStartBot = (
    mode: 'headless' | 'headful' = 'headless',
    platform: 'all' | 'glints' | 'linkedin' | 'jobstreet' | 'indeed' = 'all',
    customLimit?: number
  ) => {
    if (isBotRunning) return;

    const platText = platform !== 'all' ? platform.toUpperCase() : 'SEMUA PLATFORM';
    setLogs([`[${new Date().toLocaleTimeString()}] Menghubungkan ke Automation Engine (${mode.toUpperCase()} - Target: ${platText})...`]);
    setIsBotRunning(true);
    setActiveTab('logs');
    toast.info(`Memulai bot untuk ${platText} (${mode.toUpperCase()})`);

    let url = `/api/run-bot?mode=${mode}&platform=${platform}`;
    if (customLimit) url += `&limit=${customLimit}`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [...prev, `[${new Date(data.timestamp).toLocaleTimeString()}] ${data.message}`]);
      } catch (e) {
        console.error(e);
      }
    };

    eventSource.onerror = () => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Sesi eksekusi selesai.`]);
      setIsBotRunning(false);
      eventSource.close();
      fetchAppliedHistory();
      toast.info('Sesi bot selesai dijalankan');
    };
  };

  const handleStopBot = async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsBotRunning(false);
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Menghentikan bot...`]);
    try {
      await fetch('/api/run-bot', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Bot berhasil dihentikan.`]);
    fetchAppliedHistory();
    toast.warning('Bot telah dihentikan secara manual');
  };

  const handleSyncProfile = (platform: 'glints' | 'indeed' | 'linkedin' | 'jobstreet' = 'glints') => {
    if (isSyncingProfile || isBotRunning) return;

    const portalNames: Record<string, string> = {
      glints: 'Glints',
      indeed: 'Indeed',
      linkedin: 'LinkedIn',
      jobstreet: 'JobStreet',
    };
    const pName = portalNames[platform] || 'Portal';

    setLogs([`[${new Date().toLocaleTimeString()}] 🚀 Memulai pemeriksaan & sinkronisasi profil akun ${pName}...`]);
    setIsSyncingProfile(true);
    setActiveTab('logs');
    toast.info(`Memulai sinkronisasi profil ${pName} secara otomatis...`);

    const eventSource = new EventSource(`/api/sync-profile?platform=${platform}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'profile_detected' && data.data) {
          setDetectedWebProfile(data.data);
          setIsProfileImportModalOpen(true);
        } else if (data.message) {
          setLogs((prev) => [...prev, `[${new Date(data.timestamp).toLocaleTimeString()}] ${data.message}`]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    eventSource.onerror = () => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Selesai sinkronisasi profil ${pName}.`]);
      setIsSyncingProfile(false);
      eventSource.close();
      toast.success(`Pemeriksaan profil ${pName} selesai!`);
    };
  };

  const handleApplyWebProfileImport = async () => {
    if (!detectedWebProfile) return;

    const updated = { ...config };
    let importCount = 0;

    if (selectedWebProfileFields.has('fullName') && detectedWebProfile.name) {
      updated.fullName = detectedWebProfile.name;
      importCount++;
    }
    if (selectedWebProfileFields.has('phoneNumber') && detectedWebProfile.phone) {
      updated.phoneNumber = detectedWebProfile.phone;
      importCount++;
    }
    if (selectedWebProfileFields.has('email') && detectedWebProfile.email) {
      updated.email = detectedWebProfile.email;
      importCount++;
    }
    if (selectedWebProfileFields.has('domicile') && detectedWebProfile.location) {
      updated.domicile = detectedWebProfile.location;
      importCount++;
    }
    if (selectedWebProfileFields.has('educationLevel') && detectedWebProfile.education) {
      updated.educationLevel = detectedWebProfile.education;
      importCount++;
    }
    if (selectedWebProfileFields.has('skills') && detectedWebProfile.skills) {
      updated.skills = detectedWebProfile.skills;
      importCount++;
    }

    const portalLabels: Record<string, string> = {
      glints: 'Glints',
      indeed: 'Indeed',
      linkedin: 'LinkedIn',
      jobstreet: 'JobStreet',
    };
    const pLabel = portalLabels[detectedWebProfile.sourcePortal || 'glints'] || 'Portal';

    setConfig(updated);
    setIsProfileImportModalOpen(false);
    toast.success(`Berhasil mengimpor ${importCount} data profil dari akun ${pLabel} ke AutoApply!`);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {}
  };

  const handleSaveQuestionsList = async (updatedList: QuestionItem[]) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_all', questions: updatedList }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(updatedList);
        toast.success('Database pertanyaan diperbarui');
        fetchQuestions();
      } else {
        toast.error(data.error || 'Gagal menyimpan pertanyaan');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menyimpan';
      toast.error(msg);
    }
  };

  const handleSaveRawCsv = async () => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_raw', rawCsv: rawCsvText }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('File CSV berhasil diperbarui');
        fetchQuestions();
      } else {
        toast.error(data.error || 'Gagal memperbarui CSV');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal memperbarui';
      toast.error(msg);
    }
  };

  const handleAddNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionData.question.trim()) return;

    const newItem: QuestionItem = {
      id: `q-${Date.now()}`,
      question: newQuestionData.question.trim(),
      type: newQuestionData.type,
      options: newQuestionData.options.trim(),
      answer: newQuestionData.answer.trim(),
    };

    const updated = [newItem, ...questions];
    await handleSaveQuestionsList(updated);
    setIsNewQuestionModalOpen(false);
    setNewQuestionData({ question: '', type: 'radiobutton', options: '', answer: '' });
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    const updated = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    await handleSaveQuestionsList(updated);
    setEditingQuestion(null);
  };

  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-uploaded if needed
    e.target.value = '';

    // Validasi Frontend: Ekstensi
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Format salah: Hanya file berekstensi .csv yang diizinkan!');
      return;
    }

    // Validasi Frontend: Ukuran Maksimal 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`Ukuran file terlalu besar! Maksimal 5 MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
      return;
    }

    setIsUploadingCsv(true);
    const toastId = toast.loading(`Mengunggah ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/questions', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'File CSV berhasil diunggah!', { id: toastId });
        fetchQuestions();
      } else {
        toast.error(data.error || 'Gagal mengunggah file CSV', { id: toastId });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi gangguan jaringan saat mengunggah';
      toast.error(msg, { id: toastId });
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx') && !ext.endsWith('.doc')) {
      toast.error('Format tidak didukung: Harap pilih file .pdf atau .docx!');
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`Ukuran file terlalu besar! Maksimal 10 MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
      return;
    }

    setIsUploadingCv(true);
    const toastId = toast.loading(`Menganalisis dokumen CV "${file.name}" dengan AI...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('updateProfile', shouldUpdateProfileWithCv ? 'true' : 'false');

      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'File CV berhasil dibaca & dianalisis!', { id: toastId });
        if (data.config) {
          setConfig((prev) => ({ ...prev, ...data.config }));
        }
        if (data.updatedFields) {
          setUpdatedCvFields(data.updatedFields);
        }
        if (data.unchangedFields) {
          setUnchangedCvFields(data.unchangedFields);
        }

        if (data.aiParsed) {
          setPendingParsedCv(data.aiParsed);
          setCvAnalysisSummary(`AI mendeteksi profil: ${data.aiParsed.fullName || ''} (${data.aiParsed.educationLevel || ''}, ${data.aiParsed.yearsOfExperience || 0} thn exp)`);

          // Siapkan perbandingan sebelum vs sesudah
          const diffs = [
            { field: 'fullName', label: 'Nama Lengkap', oldVal: config.fullName || '', newVal: data.aiParsed.fullName || '', willChange: Boolean(data.aiParsed.fullName && data.aiParsed.fullName !== config.fullName) },
            { field: 'email', label: 'Email Pelamar', oldVal: config.email || '', newVal: data.aiParsed.email || '', willChange: Boolean(data.aiParsed.email && data.aiParsed.email !== config.email) },
            { field: 'phoneNumber', label: 'Nomor HP / WhatsApp', oldVal: config.phoneNumber || '', newVal: data.aiParsed.phoneNumber || '', willChange: Boolean(data.aiParsed.phoneNumber && data.aiParsed.phoneNumber !== config.phoneNumber) },
            { field: 'gender', label: 'Jenis Kelamin', oldVal: config.gender || '', newVal: data.aiParsed.gender || '', willChange: Boolean(data.aiParsed.gender && data.aiParsed.gender !== config.gender) },
            { field: 'maritalStatus', label: 'Status Pernikahan', oldVal: config.maritalStatus || '', newVal: data.aiParsed.maritalStatus || '', willChange: Boolean(data.aiParsed.maritalStatus && data.aiParsed.maritalStatus !== config.maritalStatus) },
            { field: 'dateOfBirth', label: 'Tanggal Lahir', oldVal: config.dateOfBirth || '', newVal: data.aiParsed.dateOfBirth || '', willChange: Boolean(data.aiParsed.dateOfBirth && data.aiParsed.dateOfBirth !== config.dateOfBirth) },
            { field: 'domicile', label: 'Domisili', oldVal: config.domicile || '', newVal: data.aiParsed.domicile || '', willChange: Boolean(data.aiParsed.domicile && data.aiParsed.domicile !== config.domicile) },
            { field: 'address', label: 'Alamat Lengkap', oldVal: config.address || '', newVal: data.aiParsed.address || '', willChange: Boolean(data.aiParsed.address && data.aiParsed.address !== config.address) },
            { field: 'educationLevel', label: 'Pendidikan Terakhir', oldVal: config.educationLevel || '', newVal: data.aiParsed.educationLevel || '', willChange: Boolean(data.aiParsed.educationLevel && data.aiParsed.educationLevel !== config.educationLevel) },
            { field: 'gpa', label: 'IPK Terakhir', oldVal: config.gpa || '', newVal: String(data.aiParsed.gpa || ''), willChange: Boolean(data.aiParsed.gpa && String(data.aiParsed.gpa) !== config.gpa) },
            { field: 'yearsOfExperience', label: 'Pengalaman (Tahun)', oldVal: String(config.yearsOfExperience || 0), newVal: String(data.aiParsed.yearsOfExperience ?? ''), willChange: Boolean(data.aiParsed.yearsOfExperience !== undefined && Number(data.aiParsed.yearsOfExperience) !== config.yearsOfExperience) },
            { field: 'skills', label: 'Keahlian / Skills', oldVal: config.skills || '', newVal: data.aiParsed.skills || '', willChange: Boolean(data.aiParsed.skills && data.aiParsed.skills !== config.skills) },
            { field: 'linkedinUrl', label: 'Link LinkedIn', oldVal: config.linkedinUrl || '', newVal: data.aiParsed.linkedinUrl || '', willChange: Boolean(data.aiParsed.linkedinUrl && data.aiParsed.linkedinUrl !== config.linkedinUrl) },
            { field: 'githubUrl', label: 'Link GitHub', oldVal: config.githubUrl || '', newVal: data.aiParsed.githubUrl || '', willChange: Boolean(data.aiParsed.githubUrl && data.aiParsed.githubUrl !== config.githubUrl) },
            { field: 'portfolioUrl', label: 'Link Portofolio', oldVal: config.portfolioUrl || '', newVal: data.aiParsed.portfolioUrl || '', willChange: Boolean(data.aiParsed.portfolioUrl && data.aiParsed.portfolioUrl !== config.portfolioUrl) },
          ];

          setPendingDiffList(diffs);
          // Auto-select fields that will change
          setSelectedDiffFields(new Set(diffs.filter(d => d.willChange).map(d => d.field)));
          setIsCvPreviewOpen(true);
        } else if (!data.aiParsed && data.aiError) {
          toast.warning(`CV terunggah, namun ${data.aiError}. Pastikan API Key di Langkah 3 sudah aktif.`);
        }
      } else {
        toast.error(data.error || 'Gagal mengunggah file CV', { id: toastId });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi gangguan jaringan saat mengunggah CV';
      toast.error(msg, { id: toastId });
    } finally {
      setIsUploadingCv(false);
    }
  };

  // Open existing CV preview modal
  const handleOpenCvPreview = async () => {
    if (!config.cvFileName && !config.cvExtractedText) {
      toast.info('Belum ada file CV yang diunggah.');
      return;
    }

    // Refresh cv info if text is not in state
    if (!config.cvExtractedText) {
      try {
        const res = await fetch('/api/upload-cv');
        const data = await res.json();
        if (data.success && data.cvExtractedText) {
          setConfig(prev => ({ ...prev, cvExtractedText: data.cvExtractedText }));
        }
      } catch {}
    }

    // Siapkan diff jika ada pendingParsedCv atau fallback dari extracted text
    if (pendingParsedCv) {
      const diffs = [
        { field: 'fullName', label: 'Nama Lengkap', oldVal: config.fullName || '', newVal: pendingParsedCv.fullName || '', willChange: Boolean(pendingParsedCv.fullName && pendingParsedCv.fullName !== config.fullName) },
        { field: 'email', label: 'Email Pelamar', oldVal: config.email || '', newVal: pendingParsedCv.email || '', willChange: Boolean(pendingParsedCv.email && pendingParsedCv.email !== config.email) },
        { field: 'phoneNumber', label: 'Nomor HP / WhatsApp', oldVal: config.phoneNumber || '', newVal: pendingParsedCv.phoneNumber || '', willChange: Boolean(pendingParsedCv.phoneNumber && pendingParsedCv.phoneNumber !== config.phoneNumber) },
        { field: 'gender', label: 'Jenis Kelamin', oldVal: config.gender || '', newVal: pendingParsedCv.gender || '', willChange: Boolean(pendingParsedCv.gender && pendingParsedCv.gender !== config.gender) },
        { field: 'maritalStatus', label: 'Status Pernikahan', oldVal: config.maritalStatus || '', newVal: pendingParsedCv.maritalStatus || '', willChange: Boolean(pendingParsedCv.maritalStatus && pendingParsedCv.maritalStatus !== config.maritalStatus) },
        { field: 'dateOfBirth', label: 'Tanggal Lahir', oldVal: config.dateOfBirth || '', newVal: pendingParsedCv.dateOfBirth || '', willChange: Boolean(pendingParsedCv.dateOfBirth && pendingParsedCv.dateOfBirth !== config.dateOfBirth) },
        { field: 'domicile', label: 'Domisili', oldVal: config.domicile || '', newVal: pendingParsedCv.domicile || '', willChange: Boolean(pendingParsedCv.domicile && pendingParsedCv.domicile !== config.domicile) },
        { field: 'address', label: 'Alamat Lengkap', oldVal: config.address || '', newVal: pendingParsedCv.address || '', willChange: Boolean(pendingParsedCv.address && pendingParsedCv.address !== config.address) },
        { field: 'educationLevel', label: 'Pendidikan Terakhir', oldVal: config.educationLevel || '', newVal: pendingParsedCv.educationLevel || '', willChange: Boolean(pendingParsedCv.educationLevel && pendingParsedCv.educationLevel !== config.educationLevel) },
        { field: 'gpa', label: 'IPK Terakhir', oldVal: config.gpa || '', newVal: String(pendingParsedCv.gpa || ''), willChange: Boolean(pendingParsedCv.gpa && String(pendingParsedCv.gpa) !== config.gpa) },
        { field: 'yearsOfExperience', label: 'Pengalaman (Tahun)', oldVal: String(config.yearsOfExperience || 0), newVal: String(pendingParsedCv.yearsOfExperience ?? ''), willChange: Boolean(pendingParsedCv.yearsOfExperience !== undefined && Number(pendingParsedCv.yearsOfExperience) !== config.yearsOfExperience) },
        { field: 'skills', label: 'Keahlian / Skills', oldVal: config.skills || '', newVal: pendingParsedCv.skills || '', willChange: Boolean(pendingParsedCv.skills && pendingParsedCv.skills !== config.skills) },
        { field: 'linkedinUrl', label: 'Link LinkedIn', oldVal: config.linkedinUrl || '', newVal: pendingParsedCv.linkedinUrl || '', willChange: Boolean(pendingParsedCv.linkedinUrl && pendingParsedCv.linkedinUrl !== config.linkedinUrl) },
        { field: 'githubUrl', label: 'Link GitHub', oldVal: config.githubUrl || '', newVal: pendingParsedCv.githubUrl || '', willChange: Boolean(pendingParsedCv.githubUrl && pendingParsedCv.githubUrl !== config.githubUrl) },
        { field: 'portfolioUrl', label: 'Link Portofolio', oldVal: config.portfolioUrl || '', newVal: pendingParsedCv.portfolioUrl || '', willChange: Boolean(pendingParsedCv.portfolioUrl && pendingParsedCv.portfolioUrl !== config.portfolioUrl) },
      ];
      setPendingDiffList(diffs);
      // Auto-select fields that will change
      setSelectedDiffFields(new Set(diffs.filter(d => d.willChange).map(d => d.field)));
    }

    setIsCvPreviewOpen(true);
  };

  // Apply only user-selected fields from CV diff into config state & backend
  const handleApplyPendingCvDiff = async () => {
    if (!pendingParsedCv) {
      toast.info('Tidak ada data baru yang siap diterapkan');
      return;
    }
    if (selectedDiffFields.size === 0) {
      toast.warning('Pilih minimal 1 kolom untuk diterapkan');
      return;
    }

    const appliedUpdates: Partial<AppConfig> = {};
    const newlyUpdated: string[] = [];

    const applyIf = (field: string, value: any, transform?: (v: any) => any) => {
      if (selectedDiffFields.has(field) && value !== undefined && value !== null && value !== '') {
        (appliedUpdates as any)[field] = transform ? transform(value) : value;
        newlyUpdated.push(field);
      }
    };

    applyIf('fullName', pendingParsedCv.fullName);
    applyIf('email', pendingParsedCv.email);
    applyIf('phoneNumber', pendingParsedCv.phoneNumber);
    applyIf('gender', pendingParsedCv.gender);
    applyIf('maritalStatus', pendingParsedCv.maritalStatus);
    applyIf('dateOfBirth', pendingParsedCv.dateOfBirth);
    applyIf('postalCode', pendingParsedCv.postalCode);
    applyIf('domicile', pendingParsedCv.domicile);
    applyIf('address', pendingParsedCv.address);
    applyIf('educationLevel', pendingParsedCv.educationLevel);
    applyIf('gpa', pendingParsedCv.gpa, String);
    applyIf('yearsOfExperience', pendingParsedCv.yearsOfExperience, Number);
    applyIf('skills', pendingParsedCv.skills);
    applyIf('linkedinUrl', pendingParsedCv.linkedinUrl);
    applyIf('githubUrl', pendingParsedCv.githubUrl);
    applyIf('portfolioUrl', pendingParsedCv.portfolioUrl);

    const merged = { ...config, ...appliedUpdates };
    setConfig(merged);
    setUpdatedCvFields(newlyUpdated);
    setIsCvPreviewOpen(false);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil menerapkan ${newlyUpdated.length} kolom dari CV ke Formulir!`);
      }
    } catch {
      toast.error('Gagal menyimpan perubahan ke server');
    }
  };

  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});


  const handleTestAi = async () => {
    setIsTestingAi(true);
    const toastId = toast.loading('Menguji koneksi ke AI...');
    try {
      // Pastikan config tersimpan dulu
      await handleSaveConfig(undefined, true);
      const res = await fetch('/api/test-ai', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil terhubung ke AI! Respon: "${data.reply || data.message}"`, { id: toastId, duration: 4000 });
      } else {
        toast.error(`Gagal: ${data.error || 'AI tidak merespon'}`, { id: toastId, duration: 5000 });
      }
    } catch (err: any) {
      toast.error(`Koneksi error: ${err?.message || err}`, { id: toastId });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Hapus pertanyaan ini dari database CSV?')) return;
    const updated = questions.filter((q) => q.id !== id);
    await handleSaveQuestionsList(updated);
  };

  const handleCleanCsv = async () => {
    try {
      const res = await fetch('/api/clean-csv', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.message} (${data.count} pertanyaan unik)`);
        fetchQuestions();
      } else {
        toast.error(data.error || data.message);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal membersihkan duplikat';
      toast.error(msg);
    }
  };

  // Helper to check if AI API key or endpoints are actively configured
  const isAiConfigured = () => {
    if (config.geminiApiKey?.trim() && config.geminiApiKey.trim() !== 'your_gemini_api_key_here') return true;
    if (config.customAiApiKey?.trim()) return true;
    if (Array.isArray(config.aiEndpoints) && config.aiEndpoints.some(e => e.apiKey?.trim() && e.apiKey.trim() !== 'your_gemini_api_key_here')) return true;
    return false;
  };

  // Auto-update answers in the CSV database that can be derived from the user's profile
  const handleUpdateQuestionsFromProfile = async (silent = false): Promise<number> => {
    if (questions.length === 0) {
      if (!silent) toast.info('Database kosong');
      return 0;
    }
    const salary = config.expectedSalary || 0;
    const exp = config.yearsOfExperience || 1;
    const name = config.fullName || '';
    const firstName = name.split(' ')[0] || '';
    const cvFile = config.cvFileName || '';

    let updatedCount = 0;
    const updated = questions.map((q) => {
      const qLower = q.question.toLowerCase();
      const opts = q.options ? q.options.split('|').map((o: string) => o.trim()) : [];
      let newAnswer = q.answer;

      // Salary questions
      if (/salary|gaji|expected|diharapkan/i.test(qLower) && opts.length > 0) {
        // Pick closest salary option to user's expected salary
        let closest = opts[0];
        let minDiff = Infinity;
        for (const opt of opts) {
          const nums = opt.match(/[\d.]+/);
          if (nums) {
            const val = parseFloat(nums[0].replace(/\./g, '')) * (/juta|million/i.test(opt) ? 1_000_000 : 1);
            const diff = Math.abs(val - salary);
            if (diff < minDiff) { minDiff = diff; closest = opt; }
          }
        }
        newAnswer = closest;
      }

      // Years of experience questions
      else if (/how many years|berapa tahun|years.*experience|tahun pengalaman/i.test(qLower) && opts.length > 0) {
        let closest = opts[0];
        let minDiff = Infinity;
        for (const opt of opts) {
          const nums = opt.match(/\d+/);
          if (nums) {
            const val = parseInt(nums[0]);
            const diff = Math.abs(val - exp);
            if (diff < minDiff) { minDiff = diff; closest = opt; }
          }
        }
        newAnswer = closest;
      }

      // Resume/CV filename questions — match by user's name
      else if (opts.some((o: string) => /\.pdf|resume|cv/i.test(o))) {
        // Skip "Indeed resume" type
        const indeedOpt = opts.find((o: string) => /use your indeed resume/i.test(o));
        if (indeedOpt) { /* keep as is */ }
        else if (cvFile) {
          const cvMatch = opts.find((o: string) => o.toLowerCase().includes(cvFile.toLowerCase().slice(0, 8)));
          if (cvMatch && !/don't include/i.test(cvMatch)) newAnswer = cvMatch;
        } else if (firstName.length > 2) {
          const nameMatch = opts.find((o: string) => o.toLowerCase().includes(firstName.toLowerCase()) && !/don't include/i.test(o));
          if (nameMatch) newAnswer = nameMatch;
        }
      }

      // Name questions
      else if (/^(your name|nama anda|full name|nama lengkap)/i.test(qLower) && !opts.length && name) {
        newAnswer = name;
      }

      // Domicile / Living questions
      else if (/(?:mana kamu tinggal|tempat tinggal|domisili|dimana kamu tinggal|where do you live|current location)/i.test(qLower) && !opts.length && config.domicile) {
        newAnswer = `Saat ini saya berdomisili di ${config.domicile} (${config.address || config.domicile}) dan siap untuk bekerja baik secara on-site, hybrid, maupun remote.`;
      }

      if (newAnswer !== q.answer) {
        updatedCount++;
        return { ...q, answer: newAnswer };
      }
      return q;
    });

    if (updatedCount === 0) {
      if (!silent) toast.info('Tidak ada jawaban yang perlu diperbarui dari profil saat ini');
      return 0;
    }
    await handleSaveQuestionsList(updated);
    if (!silent) toast.success(`${updatedCount} jawaban berhasil diperbarui dari profil kamu!`);
    return updatedCount;
  };

  // Smart Unified Personalization: Syncs profile data and optionally initiates AI batch answering
  const handleSmartPersonalize = async () => {
    if (questions.length === 0) {
      toast.info('Database soal masih kosong. Silakan upload CSV atau klik Reset Soal Default.');
      return;
    }

    const hasAi = isAiConfigured();

    // 1. Instant regex sync from candidate profile (0 tokens, fast)
    const updatedCount = await handleUpdateQuestionsFromProfile(true);

    if (hasAi) {
      if (updatedCount > 0) {
        toast.success(`${updatedCount} jawaban dasar disinkronkan dari profil. Melanjutkan ke personalisasi esai & AI...`);
      }
      setIsBatchAiModalOpen(true);
    } else {
      if (updatedCount > 0) {
        toast.success(`${updatedCount} jawaban berhasil diperbarui otomatis dari profil!`);
      } else {
        toast.info('Jawaban dasar sudah sesuai profil. Tambahkan API Key AI di Pengaturan jika ingin melengkapi jawaban esai otomatis.');
      }
    }
  };

  // Hapus semua pertanyaan
  const handleClearAllQuestions = async () => {
    if (!confirm(`Hapus SEMUA ${questions.length} pertanyaan dari database? Tindakan ini tidak bisa dibatalkan.`)) return;
    await handleSaveQuestionsList([]);
    toast.success('Database soal dikosongkan');
  };

  return (
    <div className="h-screen overflow-hidden content-bg-theme text-main-theme flex flex-col md:flex-row">
      {/* SIDEBAR (Desktop sticky + Mobile responsive drawer) */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        appliedJobsCount={appliedJobs.length}
        questionsCount={questions.length}
        configPresetsCount={configPresets.length}
        isBotRunning={isBotRunning}
        isSetupBrowserRunning={isSetupBrowserRunning}
        isSetupBrowserLoading={isSetupBrowserLoading}
        handleToggleSetupBrowser={() => handleToggleSetupBrowser()}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        fetchQuestions={fetchQuestions}
        fetchAppliedHistory={fetchAppliedHistory}
        resolvedTheme={resolvedTheme}
      />

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto content-bg-theme">
        <AppHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          wizardStep={wizardStep}
          setWizardStep={setWizardStep}
          config={config}
          setConfig={setConfig}
          isBotRunning={isBotRunning}
          isSetupBrowserRunning={isSetupBrowserRunning}
          handleStopBot={handleStopBot}
          executeStartBot={(mode, platform, customLimit) => executeStartBot(mode, platform as any, customLimit)}
          handleToggleTheme={handleToggleTheme}
          isMounted={isMounted}
          themeMode={themeMode}
          resolvedTheme={resolvedTheme}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Body Container */}
        <main className="py-5 sm:py-8 md:py-10 px-3.5 sm:px-6 md:px-8 max-w-6xl w-full mx-auto space-y-6 sm:space-y-8 flex-1">
          {/* TAB 1: STEP-BY-STEP SETUP WIZARD */}
          {activeTab === 'wizard' && (
            <div className="space-y-6">
              <WizardProgress
                metrics={readinessMetrics}
                wizardStep={wizardStep}
                onStepChange={(step) => setWizardStep(step)}
                onOpenSettings={() => setActiveTab('settings')}
                onJumpToUnfilledField={handleJumpToUnfilledField}
              />

              <PortalStatusGrid
                config={config}
                isBotRunning={isBotRunning}
                isSetupBrowserRunning={isSetupBrowserRunning}
                isSyncingProfile={isSyncingProfile}
                onSyncProfile={(platform) => handleSyncProfile(platform as any)}
                onStartBot={(mode, platform, customLimit) => executeStartBot(mode, platform as any, customLimit)}
              />

              {/* Wizard Content Step 1 / 2 */}
              <div className="card-theme border rounded-3xl p-6 sm:p-8 shadow-sm">
                {wizardStep === 1 ? (
                  <ProfileStep
                    config={config}
                    onChangeConfig={setConfig}
                    updatedCvFields={updatedCvFields}
                    unchangedCvFields={unchangedCvFields}
                    onClearCvVisualMarks={() => {
                      setUpdatedCvFields([]);
                      setUnchangedCvFields([]);
                    }}
                    isSyncingProfile={isSyncingProfile}
                    isBotRunning={isBotRunning}
                    onSyncProfile={(platform) => handleSyncProfile(platform as any)}
                    isUploadingCv={isUploadingCv}
                    onCvUpload={handleCvUpload}
                    onOpenCvPreview={handleOpenCvPreview}
                    cvAnalysisSummary={cvAnalysisSummary}
                    shouldUpdateProfileWithCv={shouldUpdateProfileWithCv}
                    onToggleShouldUpdateProfileWithCv={setShouldUpdateProfileWithCv}
                  />
                ) : (
                  <TargetCriteriaStep
                    config={config}
                    onChangeConfig={setConfig}
                    sessionStatuses={sessionStatuses}
                    isCheckingSessions={isCheckingSessions}
                    isSetupBrowserLoading={isSetupBrowserLoading}
                    isSetupBrowserRunning={isSetupBrowserRunning}
                    isBotRunning={isBotRunning}
                    onOpenCookieModal={(platform) => {
                      setCookieTargetPlatform(platform as any);
                      setIsCookieModalOpen(true);
                    }}
                    onCheckAccountSessions={handleCheckAccountSessions}
                    onToggleSetupBrowser={handleToggleSetupBrowser}
                    onOpenAddAccount={() => setIsAddAccountModalOpen(true)}
                    onSelectActiveAccount={handleSelectActiveAccount}
                    onDeleteAccount={handleDeleteAccount}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TERMINAL LOGS & LIVE MONITOR */}
          {activeTab === 'logs' && (
            <TerminalLogViewer
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          )}

          {/* TAB 3: QUESTIONS BANK */}
          {activeTab === 'questions' && (
            <QuestionsBank
              questions={questions}
              csvViewMode={csvViewMode}
              onChangeCsvViewMode={setCsvViewMode}
              questionSearch={questionSearch}
              onChangeQuestionSearch={setQuestionSearch}
              filteredQuestions={filteredQuestions}
              rawCsvText={rawCsvText}
              onChangeRawCsvText={setRawCsvText}
              isUploadingCsv={isUploadingCsv}
              onCsvFileUpload={handleCsvFileUpload}
              onOpenNewQuestionModal={() => setIsNewQuestionModalOpen(true)}
              onCleanCsv={handleCleanCsv}
              onSmartPersonalize={handleSmartPersonalize}
              onClearAllQuestions={handleClearAllQuestions}
              onEditQuestion={(q) => setEditingQuestion(q)}
              onDeleteQuestion={handleDeleteQuestion}
              onSaveRawCsv={handleSaveRawCsv}
              isAiConfigured={isAiConfigured()}
            />
          )}

          {/* TAB 4 & 5: APPLIED JOBS & HISTORY */}
          {(activeTab === 'history' || activeTab === 'jobs') && (
            <AppliedJobsView
              jobs={appliedJobs as any}
              storageType={config.storageType}
              activeStorageInfo={activeStorageInfo}
              initialViewMode={activeTab === 'jobs' ? 'grid' : 'table'}
              onRefresh={fetchAppliedHistory}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
              onSelectJob={(job) => setSelectedJobDetail(job as any)}
            />
          )}

          {/* TAB 6: TALENT SCOUT & SOURCING ENGINE */}
          {activeTab === 'talent' && <TalentScoutTab />}

          {/* TAB 7: SETTINGS & SYSTEM INTEGRATIONS */}
          {activeTab === 'settings' && (
            <SettingsTab
              config={config}
              setConfig={setConfig}
              isSavingConfig={isSavingConfig}
              handleSaveConfig={async () => {
                await handleSaveConfig();
              }}
              isTestingAi={isTestingAi}
              handleTestAi={handleTestAi}
              readinessMetrics={readinessMetrics}
              visibleKeyIds={visibleKeyIds}
              setVisibleKeyIds={setVisibleKeyIds}
            />
          )}
        </main>
      </div>

      {/* STANDARDIZED RADIX DIALOG MODALS */}
      <JobDetailDialog
        job={selectedJobDetail}
        onClose={() => setSelectedJobDetail(null)}
      />

      <BatchQuestionModal
        isOpen={isBatchAiModalOpen}
        onClose={() => setIsBatchAiModalOpen(false)}
        onFinished={() => fetchQuestions()}
      />

      <QuestionFormDialog
        isOpen={isNewQuestionModalOpen || Boolean(editingQuestion)}
        isEditMode={Boolean(editingQuestion)}
        data={
          editingQuestion
            ? {
                question: editingQuestion.question,
                type: editingQuestion.type,
                options: editingQuestion.options || '',
                answer: editingQuestion.answer,
              }
            : newQuestionData
        }
        onChange={(data) => {
          if (editingQuestion) {
            setEditingQuestion({ ...editingQuestion, ...data });
          } else {
            setNewQuestionData(data);
          }
        }}
        onClose={() => {
          setIsNewQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={(e) => {
          if (editingQuestion) {
            handleUpdateQuestion(e);
          } else {
            handleAddNewQuestion(e);
          }
        }}
      />

      <AddAccountDialog
        isOpen={isAddAccountModalOpen}
        onClose={() => {
          setIsAddAccountModalOpen(false);
          setNewAccountName('');
        }}
        newAccountName={newAccountName}
        setNewAccountName={setNewAccountName}
        onSubmit={handleAddNewAccount}
      />

      <PresetsDialog
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        configPresets={configPresets}
        newPresetName={newPresetName}
        setNewPresetName={setNewPresetName}
        isSavingPreset={isSavingPreset}
        onSavePreset={handleSavePreset}
        onLoadPreset={(p) => handleLoadPreset(p as any)}
        onOverwritePreset={(p) => handleOverwritePreset(p as any)}
        onDeletePreset={(p) => handleDeletePreset(p as any)}
        onRestoreDraft={handleRestoreDraft}
      />

      <CvDiffDialog
        isOpen={isCvPreviewOpen}
        onClose={() => setIsCvPreviewOpen(false)}
        cvFileName={config.cvFileName}
        cvExtractedText={config.cvExtractedText}
        cvAnalyzedAt={config.cvAnalyzedAt}
        pendingParsedCv={pendingParsedCv}
        pendingDiffList={pendingDiffList}
        selectedDiffFields={selectedDiffFields}
        setSelectedDiffFields={setSelectedDiffFields}
        onApplyPendingCvDiff={handleApplyPendingCvDiff}
      />

      <CookieImportDialog
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
        targetPlatform={cookieTargetPlatform}
        setTargetPlatform={setCookieTargetPlatform}
        rawCookieInput={rawCookieInput}
        setRawCookieInput={setRawCookieInput}
        onSaveCookie={async () => {
          const updatedCookies = {
            ...(config.portalCookies || {}),
            [cookieTargetPlatform]: rawCookieInput.trim(),
          };
          const nextConfig = { ...config, portalCookies: updatedCookies };
          setConfig(nextConfig);
          try {
            await fetch('/api/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(nextConfig),
            });
            toast.success(`Cookie ${cookieTargetPlatform.toUpperCase()} berhasil disimpan!`);
            setIsCookieModalOpen(false);
          } catch {
            toast.error('Gagal menyimpan cookie ke server');
          }
        }}
        initialCookies={config.portalCookies as any}
      />

      <ProfileSyncDialog
        isOpen={isProfileImportModalOpen}
        onOpenChange={setIsProfileImportModalOpen}
        detectedWebProfile={detectedWebProfile}
        config={config}
        selectedFields={selectedWebProfileFields}
        onToggleField={(field, checked) => {
          const next = new Set(selectedWebProfileFields);
          if (checked) next.add(field);
          else next.delete(field);
          setSelectedWebProfileFields(next);
        }}
        onApply={handleApplyWebProfileImport}
      />
    </div>
  );
}
