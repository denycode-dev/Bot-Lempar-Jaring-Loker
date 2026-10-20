'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sliders, Sparkles, Play, KeyRound } from 'lucide-react';
import { AppConfig } from '@/types';

interface PortalStatusGridProps {
  config: AppConfig;
  isBotRunning: boolean;
  isSetupBrowserRunning: boolean;
  isSyncingProfile: boolean;
  onSyncProfile: (platform: string) => void;
  onStartBot: (mode: 'headless' | 'headful', platform?: string, customLimit?: number) => void;
}

export const PortalStatusGrid: React.FC<PortalStatusGridProps> = ({
  config,
  isBotRunning,
  isSetupBrowserRunning,
  isSyncingProfile,
  onSyncProfile,
  onStartBot,
}) => {
  const isBusy = isBotRunning || isSetupBrowserRunning;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-1">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand" />
          <span className="text-xs font-semibold text-foreground">
            Portal Status &amp; Pengujian Mandiri
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Klik tombol untuk menguji portal secara terpisah
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. GLINTS */}
        <Card className="p-4 shadow-xs border-border flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-semibold text-xs">
                GL
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Glints</h3>
                <p className="text-[10px] text-muted-foreground">In-site Easy Apply</p>
              </div>
            </div>
            <Badge
              variant={config.enableGlints ? 'default' : 'secondary'}
              className="text-[10px] gap-1.5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  config.enableGlints ? 'bg-emerald-400' : 'bg-muted-foreground/40'
                }`}
              />
              <span>{config.enableGlints ? 'Aktif' : 'Nonaktif'}</span>
            </Badge>
          </div>

          <div className="space-y-1 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Batas Kuota:</span>
              <span className="font-medium text-foreground tabular-nums">{config.limitGlints || 80} loker</span>
            </div>
            <div className="flex justify-between">
              <span>Status Profil:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {config.domicile ? 'Lengkap' : 'Perlu Setup'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSyncProfile('glints')}
              disabled={isSyncingProfile || isBotRunning}
              className="w-full text-[11px] h-8 gap-1.5 rounded-md"
              title="Otomatis isi form domisili, skill, dan upload CV ke akun Glints"
            >
              <Sparkles className="w-3 h-3 text-muted-foreground" />
              <span>Auto-Fill Profil</span>
            </Button>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStartBot('headful', 'glints', 5)}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 rounded-md"
                title="Uji coba Glints 5 loker (Headful)"
              >
                <Play className="w-2.5 h-2.5 fill-current text-muted-foreground" />
                <span>Tes 5 Loker</span>
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => onStartBot('headless', 'glints')}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 shadow-xs rounded-md"
              >
                <span>Jalankan</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. LINKEDIN */}
        <Card className="p-4 shadow-xs border-border flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-semibold text-xs">
                IN
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">LinkedIn</h3>
                <p className="text-[10px] text-muted-foreground">Easy Apply &amp; ATS</p>
              </div>
            </div>
            <Badge
              variant={config.enableLinkedin ? 'default' : 'secondary'}
              className="text-[10px] gap-1.5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  config.enableLinkedin ? 'bg-emerald-400' : 'bg-muted-foreground/40'
                }`}
              />
              <span>{config.enableLinkedin ? 'Aktif' : 'Nonaktif'}</span>
            </Badge>
          </div>

          <div className="space-y-1 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Batas Kuota:</span>
              <span className="font-medium text-foreground tabular-nums">{config.limitLinkedin || 50} loker</span>
            </div>
            <div className="flex justify-between">
              <span>Stealth:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Aktif</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStartBot('headful', 'linkedin', 1)}
              disabled={isBusy}
              className="w-full text-[11px] h-8 gap-1.5 rounded-md"
              title="Buka browser untuk verifikasi / login LinkedIn"
            >
              <KeyRound className="w-3 h-3 text-muted-foreground" />
              <span>Cek / Login</span>
            </Button>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStartBot('headful', 'linkedin', 5)}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 rounded-md"
                title="Uji coba LinkedIn 5 loker (Headful)"
              >
                <Play className="w-2.5 h-2.5 fill-current text-muted-foreground" />
                <span>Tes 5 Loker</span>
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => onStartBot('headless', 'linkedin')}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 shadow-xs rounded-md"
              >
                <span>Jalankan</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* 3. JOBSTREET */}
        <Card className="p-4 shadow-xs border-border flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-semibold text-xs">
                JS
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">JobStreet</h3>
                <p className="text-[10px] text-muted-foreground">Seek Platform</p>
              </div>
            </div>
            <Badge
              variant={config.enableJobstreet ? 'default' : 'secondary'}
              className="text-[10px] gap-1.5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  config.enableJobstreet ? 'bg-emerald-400' : 'bg-muted-foreground/40'
                }`}
              />
              <span>{config.enableJobstreet ? 'Aktif' : 'Nonaktif'}</span>
            </Badge>
          </div>

          <div className="space-y-1 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Batas Kuota:</span>
              <span className="font-medium text-foreground tabular-nums">{config.limitJobstreet || 75} loker</span>
            </div>
            <div className="flex justify-between">
              <span>Domain:</span>
              <span className="font-medium text-foreground">id.jobstreet.com</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStartBot('headful', 'jobstreet', 1)}
              disabled={isBusy}
              className="w-full text-[11px] h-8 gap-1.5 rounded-md"
              title="Buka browser untuk verifikasi / login JobStreet"
            >
              <KeyRound className="w-3 h-3 text-muted-foreground" />
              <span>Cek / Login</span>
            </Button>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStartBot('headful', 'jobstreet', 5)}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 rounded-md"
                title="Uji coba JobStreet 5 loker (Headful)"
              >
                <Play className="w-2.5 h-2.5 fill-current text-muted-foreground" />
                <span>Tes 5 Loker</span>
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => onStartBot('headless', 'jobstreet')}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 shadow-xs rounded-md"
              >
                <span>Jalankan</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* 4. INDEED */}
        <Card className="p-4 shadow-xs border-border flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-semibold text-xs">
                ID
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Indeed</h3>
                <p className="text-[10px] text-muted-foreground">Smart Apply &amp; Web</p>
              </div>
            </div>
            <Badge
              variant={config.enableIndeed ? 'default' : 'secondary'}
              className="text-[10px] gap-1.5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  config.enableIndeed ? 'bg-emerald-400' : 'bg-muted-foreground/40'
                }`}
              />
              <span>{config.enableIndeed ? 'Aktif' : 'Nonaktif'}</span>
            </Badge>
          </div>

          <div className="space-y-1 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Batas Kuota:</span>
              <span className="font-medium text-foreground tabular-nums">{config.limitIndeed || 50} loker</span>
            </div>
            <div className="flex justify-between">
              <span>Anti-CF Shield:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Auto Resolve</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStartBot('headful', 'indeed', 1)}
              disabled={isBusy}
              className="w-full text-[11px] h-8 gap-1.5 rounded-md"
              title="Buka browser untuk verifikasi / login Indeed"
            >
              <KeyRound className="w-3 h-3 text-muted-foreground" />
              <span>Cek / Login</span>
            </Button>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStartBot('headful', 'indeed', 5)}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 rounded-md"
                title="Uji coba Indeed 5 loker (Headful)"
              >
                <Play className="w-2.5 h-2.5 fill-current text-muted-foreground" />
                <span>Tes 5 Loker</span>
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => onStartBot('headless', 'indeed')}
                disabled={isBusy}
                className="text-[10px] h-7 px-1.5 gap-1 shadow-xs rounded-md"
              >
                <span>Jalankan</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
