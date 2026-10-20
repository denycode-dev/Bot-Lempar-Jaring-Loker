'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  FileText,
  Filter,
  Sliders,
  ShieldCheck,
  Play,
  Bot,
  Database,
  Briefcase,
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Minimize2,
  Maximize2,
  Settings2,
} from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: 'wizard' | 'logs' | 'questions' | 'history' | 'jobs' | 'talent' | 'settings';
  wizardStep?: 1 | 2;
  preferredPlacement?: 'bottom' | 'top' | 'center';
}

export interface TourModule {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  steps: TourStep[];
}

// 1. FULL SYSTEM TOUR (10 STEPS)
const FULL_SYSTEM_STEPS: TourStep[] = [
  {
    targetId: 'tour-welcome',
    title: 'Selamat Datang di AutoApply',
    content: 'Platform otomatisasi lamaran kerja & talent scout cerdas ke LinkedIn, Glints, JobStreet, dan Indeed dengan integrasi AI, anti-bot stealth, dan database lokal.',
    icon: Compass,
    preferredPlacement: 'center',
  },
  {
    targetId: 'tour-cv-upload',
    title: '1. Unggah & Ekstraksi Cerdas CV',
    content: 'Unggah file PDF atau DOCX Anda. AI akan mengekstrak nama, kontak, keahlian, dan riwayat kerja secara non-destruktif dengan inspektor perbandingan data.',
    icon: FileText,
    tab: 'wizard',
    wizardStep: 1,
    preferredPlacement: 'bottom',
  },
  {
    targetId: 'tour-profile-fields',
    title: '2. Profil Pelamar & Portofolio',
    content: 'Lengkapi data diri, nomor WhatsApp, keahlian, dan URL portofolio/GitHub. Data ini dipakai untuk mengisi formulir loker secara otomatis.',
    icon: Sparkles,
    tab: 'wizard',
    wizardStep: 1,
    preferredPlacement: 'top',
  },
  {
    targetId: 'tour-criteria-platform',
    title: '3. Kriteria Loker & Pilihan Platform',
    content: 'Tentukan kata kunci posisi target, lokasi domisili, batas kuota harian, serta aktifkan portal loker yang ingin Anda lamar.',
    icon: Filter,
    tab: 'wizard',
    wizardStep: 2,
    preferredPlacement: 'bottom',
  },
  {
    targetId: 'tour-smart-features',
    title: '4. Filter Cerdas & Generator Cover Letter',
    content: 'Aktifkan filter blacklist industri non-relevan, generator surat lamaran AI yang dipersonalisasi per lowongan, dan jeda ketik natural.',
    icon: Sliders,
    tab: 'wizard',
    wizardStep: 2,
    preferredPlacement: 'top',
  },
  {
    targetId: 'tour-cookie-sync',
    title: '5. Multi-Akun & Verifikasi Sesi Portal',
    content: 'Kelola multi-profil browser, periksa status login portal secara headless, atau impor cookies untuk melewati proteksi Cloudflare Turnstile.',
    icon: ShieldCheck,
    tab: 'wizard',
    wizardStep: 2,
    preferredPlacement: 'top',
  },
  {
    targetId: 'settings-ai-section',
    title: '6. Pengaturan AI (OpenAI API) & Integrasi',
    content: 'Halaman terpusat untuk konfigurasi model AI (standar OpenAI API, 9Router, DeepSeek, Groq), media penyimpanan riwayat SQLite / Google Sheets, dan otomasi browser.',
    icon: Settings2,
    tab: 'settings',
    preferredPlacement: 'bottom',
  },
  {
    targetId: 'tour-batch-questions',
    title: '7. Bank 1.000+ Pertanyaan HRD & AI',
    content: 'Database soal kuesioner pelamar otomatis. Gunakan fitur "Personalisasi AI" untuk menjawab 1.000 soal massal sesuai riwayat CV Anda.',
    icon: Bot,
    tab: 'questions',
    preferredPlacement: 'bottom',
  },
  {
    targetId: 'tour-job-history',
    title: '8. Kartu Lowongan & Inspeksi Jawaban Form',
    content: 'Lihat daftar seluruh lowongan yang berhasil dilamar, status pengiriman, tautan loker, serta riwayat pertanyaan dan jawaban yang diisikan bot.',
    icon: Briefcase,
    tab: 'jobs',
    preferredPlacement: 'bottom',
  },
  {
    targetId: 'tour-mode-toggle',
    title: '9. Pemilihan Mode: Simulasi vs LIVE',
    content: 'Gunakan Mode Simulasi (Dry-Run) untuk uji coba alur tanpa mengirim lamaran asli ke HRD, atau alihkan ke Mode LIVE untuk pengiriman resmi.',
    icon: Layers,
    tab: 'wizard',
    preferredPlacement: 'bottom',
  },
  {
    targetId: 'tour-start-bot',
    title: '10. Jalankan Bot & Pantau Monitor Log',
    content: 'Jalankan bot di latar belakang (Headless) atau dengan browser terbuka (Headful), lalu pantau aktivitas pelamaran secara langsung di Terminal.',
    icon: Play,
    preferredPlacement: 'bottom',
  },
];

// 2. MODULAR TOPIC-BASED TOURS
export const TOUR_MODULES: TourModule[] = [
  {
    id: 'full',
    title: 'Tur Kilat Seluruh Sistem',
    description: 'Panduan lengkap mencakup seluruh alur kerja dari persiapan dokumen CV hingga eksekusi bot (10 langkah).',
    badge: 'Rekomendasi Awal',
    icon: Compass,
    color: 'from-brand/20 to-sky-500/10 border-brand/30 text-brand',
    steps: FULL_SYSTEM_STEPS,
  },
  {
    id: 'profile',
    title: 'Modul 1: Profil & Ekstraksi Cerdas CV',
    description: 'Cara mengunggah berkas CV, memeriksa diff ekstraksi AI, dan melengkapi data pelamar.',
    badge: 'Langkah 1',
    icon: FileText,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-500',
    steps: [
      FULL_SYSTEM_STEPS[1], // tour-cv-upload
      FULL_SYSTEM_STEPS[2], // tour-profile-fields
    ],
  },
  {
    id: 'criteria',
    title: 'Modul 2: Kriteria Loker & Sesi Portal',
    description: 'Pengaturan kata kunci lowongan, filter blacklist, rotasi multi-akun, dan impor cookie sesi.',
    badge: 'Langkah 2',
    icon: Filter,
    color: 'from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-500',
    steps: [
      FULL_SYSTEM_STEPS[3], // tour-criteria-platform
      FULL_SYSTEM_STEPS[4], // tour-smart-features
      FULL_SYSTEM_STEPS[5], // tour-cookie-sync
    ],
  },
  {
    id: 'settings',
    title: 'Modul 3: Pengaturan AI, Storage & Browser',
    description: 'Konfigurasi provider AI (OpenAI API, 9Router, DeepSeek, Groq), penyimpanan SQLite / Sheets, dan mesin browser.',
    badge: 'Menu Pengaturan',
    icon: Settings2,
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-500',
    steps: [
      {
        targetId: 'settings-ai-section',
        title: 'Pengaturan AI (OpenAI API Standard)',
        content: 'Pilih provider AI resmi atau gateway (OpenAI Official, 9Router, Groq, DeepSeek, Gemini). Lengkap dengan uji koneksi langsung dan failover endpoint cadangan.',
        icon: Bot,
        tab: 'settings',
        preferredPlacement: 'bottom',
      },
      {
        targetId: 'settings-storage-section',
        title: 'Media Penyimpanan Riwayat Lamaran',
        content: 'Pilih Database SQLite lokal (default kilat 0.1ms tanpa batasan kuota), Local JSON, atau sinkronisasi cloud real-time ke Google Sheets API.',
        icon: Database,
        tab: 'settings',
        preferredPlacement: 'bottom',
      },
      {
        targetId: 'settings-browser-section',
        title: 'Pengaturan Browser & Otomatisasi',
        content: 'Atur simulasi human stealth (kecepatan ketik alami & gerak mouse acak), mode uji coba debug dry-run, dan jumlah worker tab konkuren.',
        icon: Sliders,
        tab: 'settings',
        preferredPlacement: 'top',
      },
    ],
  },
  {
    id: 'questions',
    title: 'Modul 4: Bank 1.000 Pertanyaan HRD',
    description: 'Kustomisasi massal jawaban formulir lowongan kerja dengan personalisasi AI & sinkronisasi CSV.',
    badge: 'Tab Pertanyaan',
    icon: Bot,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-500',
    steps: [
      FULL_SYSTEM_STEPS[7], // tour-batch-questions
    ],
  },
  {
    id: 'jobs',
    title: 'Modul 5: Kartu Lowongan & Riwayat Q&A',
    description: 'Inspeksi hasil lamaran yang terkirim, tinjau jawaban form per perusahaan, serta ekspor CSV / JSON.',
    badge: 'Tab Lowongan',
    icon: Briefcase,
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-500',
    steps: [
      FULL_SYSTEM_STEPS[8], // tour-job-history
    ],
  },
  {
    id: 'logs',
    title: 'Modul 6: Pemantauan Log Terminal',
    description: 'Memantau aktivitas bot baris per baris secara live dengan indikator warna status otomatis.',
    badge: 'Tab Terminal',
    icon: Terminal,
    color: 'from-slate-500/20 to-zinc-500/10 border-slate-500/30 text-slate-400',
    steps: [
      {
        targetId: 'tour-terminal-logs',
        title: 'Pemantauan Log Terminal Real-time',
        content: 'Seluruh tahapan navigasi bot, pencocokan skor loker, pengisian form kuesioner, dan status submit ditampilkan di sini secara langsung.',
        icon: Terminal,
        tab: 'logs',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Modul 7: Mode Simulasi & Eksekusi Bot',
    description: 'Perbedaan Mode Simulasi (Dry-Run) vs Mode LIVE resmi, serta peluncuran bot Headless vs Headful.',
    badge: 'Keamanan & Start',
    icon: Play,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-500',
    steps: [
      FULL_SYSTEM_STEPS[9],  // tour-mode-toggle
      FULL_SYSTEM_STEPS[10], // tour-start-bot
    ],
  },
];

interface OnboardingTourProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  wizardStep: number;
  setWizardStep: (step: any) => void;
}

export function OnboardingTour({
  activeTab,
  setActiveTab,
  wizardStep,
  setWizardStep,
}: OnboardingTourProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [activeModule, setActiveModule] = useState<TourModule>(TOUR_MODULES[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  // Mount tracking for Next.js SSR portal safety & first-time visitor prompt
  useEffect(() => {
    setIsMounted(true);
    try {
      const hasSeen = localStorage.getItem('autoapply_onboarding_completed') || localStorage.getItem('cv_blaster_onboarding_completed');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsHubOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const [isMinimized, setIsMinimized] = useState(false);

  const activeSteps = activeModule?.steps || FULL_SYSTEM_STEPS;
  const currentStepData = activeSteps[currentStepIndex];
  const StepIcon = currentStepData?.icon || Compass;

  const updatePosition = useCallback(() => {
    if (!isTourActive || !currentStepData) return;

    if (currentStepData.targetId === 'tour-welcome') {
      setTargetRect(null);
      setPopoverPos(null);
      return;
    }

    const el = document.getElementById(currentStepData.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      const popoverWidth = 380;
      const popoverHeight = 240;
      const margin = 16;

      // Smart collision avoidance:
      // If the target element is large (covers > 45% of viewport), dock popover to safe corner
      const isLargeTarget = rect.height > window.innerHeight * 0.45 || rect.width > window.innerWidth * 0.75;

      let left = 0;
      let top = 0;

      if (isLargeTarget) {
        // Dock to bottom-right corner to never obscure form inputs
        left = window.innerWidth - popoverWidth - 24;
        top = window.innerHeight - popoverHeight - 24;
      } else {
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, left));

        const spaceBelow = window.innerHeight - (rect.bottom + margin);
        const spaceAbove = rect.top - margin;

        if (currentStepData.preferredPlacement === 'top' && spaceAbove >= popoverHeight) {
          top = rect.top - popoverHeight - margin;
        } else if (spaceBelow >= popoverHeight) {
          top = rect.bottom + margin;
        } else if (spaceAbove >= popoverHeight) {
          top = rect.top - popoverHeight - margin;
        } else {
          // If neither above nor below fits without overlap, dock to right side or bottom corner
          if (window.innerWidth - rect.right >= popoverWidth + margin) {
            left = rect.right + margin;
            top = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, rect.top));
          } else {
            top = Math.max(16, window.innerHeight - popoverHeight - 24);
            left = Math.max(16, window.innerWidth - popoverWidth - 24);
          }
        }
      }

      setPopoverPos({ top, left });
    } else {
      setTargetRect(null);
      setPopoverPos(null);
    }
  }, [isTourActive, currentStepData]);

  // Sync tab, step and smoothly scroll to target element
  useEffect(() => {
    if (!isTourActive || !currentStepData) return;

    if (currentStepData.tab && activeTab !== currentStepData.tab) {
      setActiveTab(currentStepData.tab);
    }
    if (currentStepData.wizardStep && wizardStep !== currentStepData.wizardStep) {
      setWizardStep(currentStepData.wizardStep);
    }

    // Allow DOM to switch tabs/steps first, then scroll into view and calculate bounds
    const scrollTimer = setTimeout(() => {
      if (currentStepData.targetId !== 'tour-welcome') {
        const el = document.getElementById(currentStepData.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
      }
      // Re-measure after smooth scroll completes
      const measureTimer = setTimeout(() => {
        updatePosition();
      }, 250);
      return () => clearTimeout(measureTimer);
    }, 180);

    const handleWindowEvents = () => updatePosition();
    window.addEventListener('resize', handleWindowEvents);
    window.addEventListener('scroll', handleWindowEvents, true);

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('resize', handleWindowEvents);
      window.removeEventListener('scroll', handleWindowEvents, true);
    };
  }, [isTourActive, currentStepIndex, currentStepData, activeTab, wizardStep, setActiveTab, setWizardStep, updatePosition]);

  const handleStartModuleTour = (module: TourModule) => {
    setActiveModule(module);
    setCurrentStepIndex(0);
    setIsHubOpen(false);
    setIsTourActive(true);
  };

  const handleNext = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('autoapply_onboarding_completed', 'true');
      localStorage.setItem('cv_blaster_onboarding_completed', 'true');
    } catch {}
    setIsTourActive(false);
  };

  const handleBackToHub = () => {
    setIsTourActive(false);
    setIsHubOpen(true);
  };

  const pad = 8;
  const rad = 16;

  return (
    <>
      {/* Trigger Button in Header / Navigation */}
      <button
        type="button"
        onClick={() => setIsHubOpen(true)}
        className="px-3 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-brand hover:border-brand/40 transition flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
        title="Pusat Panduan & Tutorial Modul"
      >
        <BookOpen className="w-3.5 h-3.5 text-brand" />
        <span className="font-medium">Panduan</span>
      </button>

      {/* Render Modals via Portal directly to document.body to escape header stacking context & backdrop-blur containment */}
      {isMounted && (isHubOpen || isTourActive) && typeof document !== 'undefined' && createPortal(
        <>
          {/* 1. MODULAR GUIDED HUB (TOPIC SELECTOR MODAL) */}
          {isHubOpen && (
            <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm overflow-y-auto p-3 sm:p-4 md:p-6 flex items-start sm:items-center justify-center">
              <div className="my-auto bg-card border border-border rounded-xl p-4 sm:p-6 md:p-7 max-w-3xl w-full shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-3.5 sm:pb-4 shrink-0">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-foreground">Pusat Panduan &amp; Tutorial AutoApply</h2>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">Pilih modul spesifik yang ingin dipelajari atau jalankan tur kilat interaktif.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHubOpen(false)}
                    className="p-1.5 sm:p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    aria-label="Tutup Panduan"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content List (Scrollable - with min-h-0 to prevent flex overflow clipping) */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 py-3">
                  {/* Featured: Full System Walkthrough */}
                  <div
                    onClick={() => handleStartModuleTour(TOUR_MODULES[0])}
                    className="p-5 rounded-xl bg-gradient-to-r from-brand/10 via-blue-500/5 to-transparent border border-brand/30 hover:border-brand cursor-pointer transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-brand transition">
                            Tur Kilat Seluruh Fitur (10 Langkah)
                          </h3>
                          <span className="text-[10px] font-medium bg-brand/15 text-brand px-2 py-0.5 rounded-full border border-brand/25">
                            Disarankan untuk Pemula
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Jelajahi seluruh alur mulai dari unggah CV, pengaturan kriteria, manajemen multi-akun, bank soal HRD, hingga peluncuran bot otomatis.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-md bg-brand hover:bg-brand/90 text-white text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition"
                    >
                      <span>Mulai Tur</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Grid of Modular Guides */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Panduan Berdasarkan Modul &amp; Halaman
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {TOUR_MODULES.slice(1).map((module) => {
                        const ModIcon = module.icon;
                        return (
                          <div
                            key={module.id}
                            onClick={() => handleStartModuleTour(module)}
                            className="p-4 rounded-xl border border-border bg-card hover:border-brand/40 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center border shrink-0`}>
                                  <ModIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-foreground group-hover:text-brand transition">
                                    {module.title}
                                  </h4>
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    {module.badge} ({module.steps.length} langkah)
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition shrink-0" />
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {module.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border shrink-0 text-xs text-muted-foreground">
                  <span className="text-[11px]">
                    Panduan dapat dibuka kembali kapan saja melalui tombol <strong>Panduan</strong> di bagian atas.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsHubOpen(false)}
                    className="px-4 py-2 rounded-md bg-muted/60 border border-border text-muted-foreground hover:text-foreground font-medium text-xs transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. INTERACTIVE SPOTLIGHT TOUR ENGINE */}
          {isTourActive && (
            <div className="fixed inset-0 z-[9999] pointer-events-auto">
              {/* SVG CUTOUT SPOTLIGHT (Zero blur on highlighted target, crisp view) */}
              <svg
                className="fixed inset-0 w-full h-full pointer-events-auto z-[9999] transition-all duration-200"
                onClick={handleComplete}
              >
                <defs>
                  <mask id="spotlight-cutout-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    {targetRect && (
                      <rect
                        x={targetRect.left - pad}
                        y={targetRect.top - pad}
                        width={targetRect.width + pad * 2}
                        height={targetRect.height + pad * 2}
                        rx={rad}
                        ry={rad}
                        fill="black"
                      />
                    )}
                  </mask>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.70)"
                  mask="url(#spotlight-cutout-mask)"
                />
              </svg>

              {/* Glowing Target Outline */}
              {targetRect && (
                <div
                  className="fixed pointer-events-none z-[10000] rounded-xl border-2 border-brand shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-200"
                  style={{
                    top: targetRect.top - pad,
                    left: targetRect.left - pad,
                    width: targetRect.width + pad * 2,
                    height: targetRect.height + pad * 2,
                  }}
                />
              )}

              {/* Interactive Popover Card or Compact Pill */}
              {isMinimized ? (
                <div className="fixed bottom-6 right-6 z-[10000] p-2.5 px-4 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-zinc-100 shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-brand/20 text-brand flex items-center justify-center shrink-0">
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-brand font-medium uppercase tracking-wider">
                        Langkah {currentStepIndex + 1}/{activeSteps.length}
                      </span>
                      <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                        {currentStepData.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsMinimized(false)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="Perbesar Kartu Panduan"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-2.5 py-1 rounded-md bg-brand hover:bg-brand/90 text-white text-xs font-medium transition"
                    >
                      {currentStepIndex === activeSteps.length - 1 ? 'Selesai' : 'Lanjut'}
                    </button>
                    <button
                      type="button"
                      onClick={handleComplete}
                      className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition"
                      title="Tutup Panduan"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`fixed z-[10000] w-full max-w-[calc(100vw-2rem)] sm:max-w-[380px] p-4 sm:p-5 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-zinc-100 shadow-2xl transition-all duration-200 ${
                    !popoverPos ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
                  }`}
                  style={popoverPos ? { top: `${popoverPos.top}px`, left: `${popoverPos.left}px` } : {}}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-brand/20 border border-brand/30 flex items-center justify-center text-brand shrink-0">
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-brand font-medium uppercase tracking-wider">
                          {activeModule.title}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          Langkah {currentStepIndex + 1} dari {activeSteps.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsMinimized(true)}
                        className="text-zinc-400 hover:text-white p-1 rounded-md text-[10px] border border-zinc-800 hover:bg-zinc-800 transition"
                        title="Kecilkan Panduan agar tidak menutupi layar"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleBackToHub}
                        className="text-zinc-400 hover:text-white p-1 rounded-md text-[10px] border border-zinc-800 hover:bg-zinc-800 transition"
                        title="Kembali ke Menu Pilihan Panduan"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleComplete}
                        className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition"
                        title="Tutup Panduan"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Popover Title & Content */}
                  <h3 className="text-sm font-semibold text-white mb-2 leading-snug">
                    {currentStepData.title}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-5">
                    {currentStepData.content}
                  </p>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    {/* Progress Dots */}
                    <div className="flex items-center gap-1.5">
                      {activeSteps.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentStepIndex(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === currentStepIndex
                              ? 'w-5 bg-brand'
                              : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2">
                      {currentStepIndex > 0 && (
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="px-3 py-1.5 rounded-md border border-zinc-800 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Sebelumnya</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-3.5 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        {currentStepIndex === activeSteps.length - 1 ? (
                          <>
                            <span>Selesai</span>
                            <Check className="w-3.5 h-3.5 text-white" />
                          </>
                        ) : (
                          <>
                            <span>Lanjut</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>,
        document.body
      )}
    </>
  );
}
