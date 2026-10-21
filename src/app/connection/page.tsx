'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  KeyRound,
  Save,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectionPage() {
  const [activeTab, setActiveTab] = useState<'portals' | 'eeo'>('portals');
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingUpBrowser, setIsSettingUpBrowser] = useState(false);

  // Portal toggles
  const [portals, setPortals] = useState({
    enableGlints: true,
    enableJobstreet: true,
    enableLinkedin: true,
    enableIndeed: true,
  });

  // EEO & Work Auth fields
  const [workAuth, setWorkAuth] = useState({
    citizenshipStatus: "I'm an Indonesian citizen",
    visaRequired: false,
    workRightsDetail: 'Warga Negara Indonesia (WNI), memiliki hak kerja penuh tanpa sponsor visa.',
    disabilityStatus: 'no',
    veteranStatus: 'no',
    gender: 'Laki-laki',
    maritalStatus: 'Single',
  });

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.config) {
        setPortals({
          enableGlints: data.config.enableGlints ?? true,
          enableJobstreet: data.config.enableJobstreet ?? true,
          enableLinkedin: data.config.enableLinkedin ?? true,
          enableIndeed: data.config.enableIndeed ?? true,
        });

        setWorkAuth((prev) => ({
          ...prev,
          citizenshipStatus: data.config.citizenshipStatus || prev.citizenshipStatus,
          visaRequired: data.config.visaRequired ?? false,
          disabilityStatus: data.config.disabilityStatus || 'no',
          veteranStatus: data.config.veteranStatus || 'no',
          gender: data.config.gender || 'Laki-laki',
          maritalStatus: data.config.maritalStatus || 'Single',
        }));
      }
    } catch (err: any) {
      toast.error('Gagal memuat status koneksi portal: ' + err.message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConfig();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchConfig]);

  const handleSaveEeo = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...portals,
          ...workAuth,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Pengaturan Portal & EEO berhasil disimpan ke PostgreSQL!');
      } else {
        toast.error(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetupBrowser = async (portalName: string) => {
    setIsSettingUpBrowser(true);
    toast.info(`Membuka browser untuk login ${portalName}... Selesaikan login di jendela browser.`);
    try {
      const res = await fetch('/api/setup-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: portalName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Sesi login untuk ${portalName} berhasil disimpan!`);
      } else {
        toast.error(data.error || 'Gagal menyimpan sesi login');
      }
    } catch (err: any) {
      toast.error('Gagal menjalankan sesi browser: ' + err.message);
    } finally {
      setIsSettingUpBrowser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subroute Tab Switcher */}
      <div className="flex border-b border-border gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('portals')}
          className={`pb-3 text-xs md:text-sm font-medium transition-all relative ${
            activeTab === 'portals'
              ? 'text-brand font-semibold border-b-2 border-brand'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Tab 1: Status Sesi Portal &amp; Self-Test
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('eeo')}
          className={`pb-3 text-xs md:text-sm font-medium transition-all relative ${
            activeTab === 'eeo'
              ? 'text-brand font-semibold border-b-2 border-brand'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Tab 2: Work Authorization &amp; EEO
        </button>
      </div>

      {activeTab === 'portals' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'glints',
                name: 'Glints',
                domain: 'glints.com',
                desc: 'In-site Easy Apply',
                enabled: portals.enableGlints,
                toggleKey: 'enableGlints',
                badgeText: 'Siap Apply',
              },
              {
                id: 'jobstreet',
                name: 'JobStreet',
                domain: 'jobstreet.co.id',
                desc: 'Quick Apply / Express',
                enabled: portals.enableJobstreet,
                toggleKey: 'enableJobstreet',
                badgeText: 'Siap Apply',
              },
              {
                id: 'linkedin',
                name: 'LinkedIn',
                domain: 'linkedin.com',
                desc: 'Easy Apply',
                enabled: portals.enableLinkedin,
                toggleKey: 'enableLinkedin',
                badgeText: 'Siap Apply',
              },
              {
                id: 'indeed',
                name: 'Indeed',
                domain: 'id.indeed.com',
                desc: 'Indeed Apply',
                enabled: portals.enableIndeed,
                toggleKey: 'enableIndeed',
                badgeText: 'Siap Apply',
              },
            ].map((p) => (
              <Card key={p.id} className="p-5 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                    </div>
                    <Badge variant={p.enabled ? 'default' : 'secondary'} className="text-[10px]">
                      {p.enabled ? p.badgeText : 'Nonaktif'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Aktifkan portal</span>
                    <Switch
                      checked={p.enabled}
                      onCheckedChange={(checked) => {
                        const updated = { ...portals, [p.toggleKey]: checked };
                        setPortals(updated);
                        fetch('/api/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updated),
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetupBrowser(p.id)}
                    disabled={isSettingUpBrowser}
                    className="w-full text-xs h-8 border-border hover:bg-secondary gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Login &amp; Simpan Cookie</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tentang Anti-Detection Stealth Engine (Camoufox)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AutoApply menggunakan mesin anti-deteksi C++ Firefox (Camoufox) yang mengisolasi profil cookie per portal
              di direktori local <code className="text-brand font-mono">automation-profile-camoufox</code>. Sesi login
              akan bertahan secara aman tanpa perlu verifikasi CAPTCHA berulang.
            </p>
          </Card>
        </div>
      ) : (
        <Card className="p-6 md:p-8 rounded-xl border border-border bg-card shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm md:text-base font-semibold text-foreground">
                  Work Authorization &amp; Equal Employment Opportunity (EEO)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Format jawaban standar untuk kuesioner izin kerja, kewarganegaraan, dan EEO internasional
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSaveEeo}
              disabled={isSaving}
              className="text-xs h-9 bg-brand hover:bg-brand-hover text-brand-foreground gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Kepatuhan'}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Status Kewarganegaraan &amp; Hak Kerja</label>
              <Input
                value={workAuth.citizenshipStatus}
                onChange={(e) => setWorkAuth({ ...workAuth, citizenshipStatus: e.target.value })}
                className="text-xs h-9"
              />
              <p className="text-[11px] text-muted-foreground">Contoh: I&apos;m an Indonesian citizen / WNI</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Kebutuhan Sponsor Visa Kerja</label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={workAuth.visaRequired}
                  onCheckedChange={(checked) => setWorkAuth({ ...workAuth, visaRequired: checked })}
                />
                <span className="text-xs text-foreground">
                  {workAuth.visaRequired ? 'Ya, membutuhkan sponsor visa' : 'Tidak membutuhkan sponsor visa kerja'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Status Disabilitas (EEO Voluntary Self-ID)</label>
              <select
                value={workAuth.disabilityStatus}
                onChange={(e) => setWorkAuth({ ...workAuth, disabilityStatus: e.target.value })}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand"
              >
                <option value="no">Tidak, saya tidak memiliki disabilitas</option>
                <option value="yes">Ya, saya memiliki disabilitas</option>
                <option value="prefer_not_to_say">Memilih untuk tidak menyatakan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Status Veteran (Military / Veteran)</label>
              <select
                value={workAuth.veteranStatus}
                onChange={(e) => setWorkAuth({ ...workAuth, veteranStatus: e.target.value })}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand"
              >
                <option value="no">Bukan veteran / Not a veteran</option>
                <option value="yes">Veteran</option>
                <option value="prefer_not_to_say">Memilih untuk tidak menyatakan</option>
              </select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
