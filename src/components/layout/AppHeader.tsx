'use client';

import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Square,
  Play,
  Globe,
} from 'lucide-react';
import { NavTab, WizardStep, AppConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { OnboardingTour } from '@/components/OnboardingTour';

interface AppHeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  wizardStep: WizardStep;
  setWizardStep: (step: WizardStep) => void;
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  isBotRunning: boolean;
  isSetupBrowserRunning: boolean;
  handleStopBot: () => void;
  executeStartBot: (mode: 'headless' | 'headful', platform?: string, customLimit?: number) => void;
  handleToggleTheme: () => void;
  isMounted: boolean;
  themeMode: string;
  resolvedTheme: string;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  setActiveTab,
  wizardStep,
  setWizardStep,
  config,
  setConfig,
  isBotRunning,
  isSetupBrowserRunning,
  handleStopBot,
  executeStartBot,
  handleToggleTheme,
  isMounted,
  themeMode,
  resolvedTheme,
  setIsMobileMenuOpen,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'wizard':
        return 'Setup Target Loker & Profil';
      case 'logs':
        return 'Terminal Pemantau Eksekusi Bot';
      case 'questions':
        return 'Koleksi Jawaban Kuesioner Loker';
      case 'history':
        return 'Rekap Loker yang Sudah Dilamar';
      case 'jobs':
        return 'Daftar Lowongan Kerja';
      case 'talent':
        return 'Talent Scout & Sourcing Engine (Outsourcing & HRIS)';
      case 'settings':
        return 'Pengaturan Sistem & Integrasi';
      default:
        return 'AutoApply';
    }
  };

  return (
    <header className="min-h-[3.5rem] sm:min-h-[4.5rem] py-2 sm:py-3.5 px-2.5 sm:px-6 md:px-8 border-b header-theme flex items-center justify-between transition-colors shrink-0 shadow-xs sticky top-0 z-20 backdrop-blur-md gap-2">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden rounded-md h-9 w-9 shrink-0"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </Button>

        {/* Mobile Brand Logo */}
        <div className="flex items-center md:hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/header-light.svg"
            alt="AutoApply"
            className="logo-theme-light dark:hidden h-6 w-auto object-contain select-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/header-dark.svg"
            alt="AutoApply"
            className="logo-theme-dark hidden dark:block h-6 w-auto object-contain select-none"
          />
        </div>

        {/* Desktop Section Title */}
        <span className="hidden md:block text-sm font-semibold text-foreground truncate">
          {getTabTitle()}
        </span>
      </div>

      {/* Main Action Buttons + Theme Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Toggle: Mode Simulasi / Live Submit */}
        <div
          id="tour-mode-toggle"
          onClick={() => {
            const nextVal = !config.debugTest;
            setConfig({ ...config, debugTest: nextVal });
            fetch('/api/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...config, debugTest: nextVal }),
            }).catch(() => {});
          }}
          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border text-xs font-medium cursor-pointer select-none transition flex items-center gap-1.5 shadow-xs shrink-0 ${
            config.debugTest
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
          }`}
          title="Klik untuk mengganti mode Simulasi (Dry-run) atau Live Kirim Lamaran Langsung"
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              config.debugTest ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
            }`}
          />
          <span className="leading-tight font-semibold text-[11px] sm:text-xs">
            {config.debugTest ? 'Simulasi' : 'LIVE'}
          </span>
        </div>

        {/* Interactive Onboarding Tour Button */}
        <div className="hidden md:flex items-center">
          <OnboardingTour
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            wizardStep={wizardStep}
            setWizardStep={setWizardStep}
          />
        </div>

        {/* Theme Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleTheme}
          className="rounded-md px-2 sm:px-2.5 h-8 sm:h-9 text-muted-foreground hover:text-foreground gap-1 text-xs shadow-xs shrink-0"
          title={
            isMounted
              ? `Tema saat ini: ${
                  themeMode === 'system' ? 'Sistem' : themeMode === 'dark' ? 'Gelap' : 'Terang'
                }`
              : 'Ganti Tema'
          }
        >
          {isMounted && resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
          ) : (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          )}
          <span className="hidden lg:inline capitalize">
            {isMounted ? (themeMode === 'system' ? 'Auto' : themeMode) : 'Auto'}
          </span>
        </Button>

        {isBotRunning ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleStopBot}
            className="rounded-md text-xs font-medium gap-1.5 shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Hentikan</span>
          </Button>
        ) : (
          <div id="tour-start-bot" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={() => executeStartBot('headless')}
              disabled={isSetupBrowserRunning}
              className="rounded-md text-xs font-medium gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
              title="Jalankan bot di latar belakang (tanpa jendela browser)"
            >
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span>Run</span>
              <span className="hidden sm:inline">(Headless)</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => executeStartBot('headful')}
              disabled={isSetupBrowserRunning}
              className="hidden sm:flex rounded-md text-xs font-medium gap-1.5 disabled:opacity-50 shadow-xs shrink-0"
              title="Jalankan dengan jendela browser terbuka"
            >
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Run (Headful)</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
