'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, Check, Target, Settings2, ExternalLink } from 'lucide-react';
import { WizardStep } from '@/types';

export interface ReadinessMetrics {
  completedSteps: number;
  percent: number;
  step1Complete: boolean;
  step1Filled: number;
  step1Total: number;
  step1Percent: number;
  step2Complete: boolean;
  step2Filled: number;
  step2Total: number;
  step2Percent: number;
  step3Complete: boolean;
  step3Filled: number;
  step3Total: number;
  step3Percent: number;
}

interface WizardProgressProps {
  metrics: ReadinessMetrics;
  wizardStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
  onOpenSettings: () => void;
  onJumpToUnfilledField: (step: 1 | 2 | 3) => void;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  metrics,
  wizardStep,
  onStepChange,
  onOpenSettings,
  onJumpToUnfilledField,
}) => {
  return (
    <div className="space-y-4">
      {/* Progress Summary Card */}
      <Card className="p-4 sm:p-6 shadow-xs border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
              Persiapan Automasi
            </h1>
            <p className="text-xs text-muted-foreground">
              Selesaikan form bertahap di bawah agar bot dapat bekerja optimal.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-muted/40 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-border self-stretch sm:self-auto">
            <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tingkat Kesiapan</div>
              <div className="text-sm font-semibold text-foreground tabular-nums">
                {metrics.completedSteps} dari 3 Bagian Lengkap ({metrics.percent}%)
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Wizard Steps Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Step 1 Card */}
        <button
          type="button"
          onClick={() => onStepChange(1)}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
            wizardStep === 1
              ? 'bg-brand/5 border-brand shadow-xs ring-1 ring-brand/20'
              : 'card-theme border-border hover:border-brand/40'
          }`}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center shrink-0 ${
                  metrics.step1Complete
                    ? 'bg-brand text-white dark:text-zinc-950'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {metrics.step1Complete ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">Langkah 1</div>
                <div className="text-[11px] text-muted-foreground truncate">Profil Pelamar &amp; Skills</div>
              </div>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onJumpToUnfilledField(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onJumpToUnfilledField(1);
                }
              }}
              title="Klik untuk loncat dan tandai input yang belum terisi di Langkah 1"
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 font-mono tabular-nums flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                metrics.step1Percent === 100
                  ? 'bg-brand/10 text-brand border-brand/30'
                  : metrics.step1Complete
                  ? 'bg-brand/5 text-brand border-brand/20'
                  : 'bg-muted text-muted-foreground border-border hover:border-brand/50 hover:text-brand'
              }`}
            >
              <span>{metrics.step1Filled}/{metrics.step1Total} ({metrics.step1Percent}%)</span>
              <Target className="w-3 h-3 opacity-70 hover:opacity-100" />
            </span>
          </div>

          <Progress value={metrics.step1Percent} className="h-1.5" />
        </button>

        {/* Step 2 Card */}
        <button
          type="button"
          onClick={() => onStepChange(2)}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
            wizardStep === 2
              ? 'bg-brand/5 border-brand shadow-xs ring-1 ring-brand/20'
              : 'card-theme border-border hover:border-brand/40'
          }`}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center shrink-0 ${
                  metrics.step2Complete
                    ? 'bg-brand text-white dark:text-zinc-950'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {metrics.step2Complete ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">Langkah 2</div>
                <div className="text-[11px] text-muted-foreground truncate">Kriteria &amp; Platform</div>
              </div>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onJumpToUnfilledField(2);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onJumpToUnfilledField(2);
                }
              }}
              title="Klik untuk loncat dan tandai input yang belum terisi di Langkah 2"
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 font-mono tabular-nums flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                metrics.step2Percent === 100
                  ? 'bg-brand/10 text-brand border-brand/30'
                  : metrics.step2Complete
                  ? 'bg-brand/5 text-brand border-brand/20'
                  : 'bg-muted text-muted-foreground border-border hover:border-brand/50 hover:text-brand'
              }`}
            >
              <span>{metrics.step2Filled}/{metrics.step2Total} ({metrics.step2Percent}%)</span>
              <Target className="w-3 h-3 opacity-70 hover:opacity-100" />
            </span>
          </div>

          <Progress value={metrics.step2Percent} className="h-1.5" />
        </button>

        {/* Step 3 (Settings shortcut) Card */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-3.5 sm:p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 card-theme border-border hover:border-brand/50"
          title="Klik untuk membuka Pengaturan Sistem (AI, Browser & Storage)"
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center shrink-0 ${
                  metrics.step3Complete
                    ? 'bg-brand text-white dark:text-zinc-950'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {metrics.step3Complete ? <Check className="w-3.5 h-3.5" /> : <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                  <span>Pengaturan Sistem</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="text-[11px] text-muted-foreground truncate">AI &amp; Spreadsheet</div>
              </div>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              title="Buka Pengaturan"
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 font-mono tabular-nums flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                metrics.step3Percent === 100
                  ? 'bg-brand/10 text-brand border-brand/30'
                  : metrics.step3Complete
                  ? 'bg-brand/5 text-brand border-brand/20'
                  : 'bg-muted text-muted-foreground border-border hover:border-brand/50 hover:text-brand'
              }`}
            >
              <span>{metrics.step3Filled}/{metrics.step3Total} ({metrics.step3Percent}%)</span>
              <Settings2 className="w-3 h-3 opacity-70 hover:opacity-100" />
            </span>
          </div>

          <Progress value={metrics.step3Percent} className="h-1.5" />
        </button>
      </div>
    </div>
  );
};
