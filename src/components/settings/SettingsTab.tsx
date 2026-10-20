'use client';

import React from 'react';
import {
  Settings2,
  Sparkles,
  Save,
  Bot,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Database,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppConfig, AiEndpointConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SettingsTabProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  isSavingConfig: boolean;
  handleSaveConfig: (overrideConfig?: AppConfig) => Promise<void>;
  isTestingAi: boolean;
  handleTestAi: () => Promise<void>;
  readinessMetrics: {
    hasAi: boolean;
    [key: string]: any;
  };
  visibleKeyIds: Record<string, boolean>;
  setVisibleKeyIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  config,
  setConfig,
  isSavingConfig,
  handleSaveConfig,
  isTestingAi,
  handleTestAi,
  readinessMetrics,
  visibleKeyIds,
  setVisibleKeyIds,
}) => {
  const rawEndpoints =
    config.aiEndpoints && config.aiEndpoints.length > 0
      ? config.aiEndpoints
      : [
          {
            id: 'ep-primary',
            name: '9Router Gateway',
            type: 'openai_compatible' as const,
            baseUrl: config.customAiBaseUrl || 'https://api.9router.com/v1',
            apiKey: config.customAiApiKey || config.geminiApiKey || '',
            model: config.customAiModel || 'google/gemini-2.5-flash',
            isActive: true,
          },
        ];

  const primaryEp = rawEndpoints[0];
  const isPrimaryVisible = Boolean(visibleKeyIds[primaryEp.id]);


  return (
    <div id="tour-settings-page" className="space-y-6">
      {/* Header Card */}
      <div className="p-6 md:p-8 rounded-xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Pengaturan Sistem &amp; Integrasi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kelola konfigurasi model AI (OpenAI API), media penyimpanan riwayat lamaran, dan otomasi browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={isTestingAi || !readinessMetrics.hasAi}
            onClick={handleTestAi}
            className="rounded-md text-xs gap-2"
            title="Uji koneksi ke endpoint AI yang aktif"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>{isTestingAi ? 'Menguji AI...' : 'Uji Koneksi AI'}</span>
          </Button>

          <Button
            type="button"
            variant="brand"
            disabled={isSavingConfig}
            onClick={() => handleSaveConfig()}
            className="rounded-md text-xs font-medium gap-2 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingConfig ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </Button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 md:p-8 rounded-xl bg-card border border-border shadow-xs space-y-8">
        {/* 1. PENGATURAN AI (OPENAI API) */}
        <div id="settings-ai-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-semibold text-foreground">Pengaturan AI (OpenAI API)</h3>
                {readinessMetrics.hasAi ? (
                  <Badge variant="successSubtle" className="text-[10px] font-medium gap-1">
                    <Check className="w-3 h-3" />
                    <span>AI Siap</span>
                  </Badge>
                ) : (
                  <Badge variant="destructiveSubtle" className="text-[10px] font-medium">
                    Wajib Diisi
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fitur otomatisasi formulir, Q&amp;A HRD, dan generator cover letter menggunakan standar OpenAI API.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTestingAi || !readinessMetrics.hasAi}
              onClick={handleTestAi}
              className="self-start sm:self-auto rounded-md text-xs gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>{isTestingAi ? 'Menguji Koneksi…' : 'Uji Koneksi AI'}</span>
            </Button>
          </div>

          {/* Primary AI Provider Card */}
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-xl border bg-card border-brand/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand inline-block animate-pulse" />
                  Provider AI Utama
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  Default Utama
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor="settings-primary-ai-url" className="block text-xs font-medium text-foreground mb-1.5">
                    Base URL Endpoint
                  </label>
                  <Input
                    id="settings-primary-ai-url"
                    type="text"
                    value={primaryEp.baseUrl}
                    onChange={(e) => {
                      const updated = [...rawEndpoints];
                      updated[0] = { ...updated[0], baseUrl: e.target.value };
                      setConfig({ ...config, aiEndpoints: updated, customAiBaseUrl: e.target.value });
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="https://api.openai.com/v1"
                    className="rounded-md px-3.5 py-2 text-xs font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Endpoint OpenAI atau provider kompatibel (Gemini, Groq, DeepSeek, Ollama, dll).
                  </p>
                </div>

                <div>
                  <label htmlFor="settings-primary-ai-model" className="block text-xs font-medium text-foreground mb-1.5">
                    Nama Model AI
                  </label>
                  <Input
                    id="settings-primary-ai-model"
                    type="text"
                    value={primaryEp.model}
                    onChange={(e) => {
                      const updated = [...rawEndpoints];
                      updated[0] = { ...updated[0], model: e.target.value };
                      setConfig({ ...config, aiEndpoints: updated, customAiModel: e.target.value });
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="gpt-4o-mini"
                    className="rounded-md px-3.5 py-2 text-xs font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Misal: <code className="text-[10px] bg-muted px-1 py-0.5 rounded">gpt-4o-mini</code>, <code className="text-[10px] bg-muted px-1 py-0.5 rounded">gemini-2.5-flash</code>, atau model lokal.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="settings-primary-ai-key" className="block text-xs font-medium text-foreground">
                      API Key / Token
                    </label>
                    <span className="text-[10px] font-semibold text-brand">Wajib Diisi</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="settings-primary-ai-key"
                      type={isPrimaryVisible ? 'text' : 'password'}
                      value={primaryEp.apiKey}
                      onChange={(e) => {
                        const updated = [...rawEndpoints];
                        updated[0] = { ...updated[0], apiKey: e.target.value };
                        setConfig({
                          ...config,
                          aiEndpoints: updated,
                          customAiApiKey: e.target.value,
                          geminiApiKey: e.target.value.startsWith('AIzaSy') ? e.target.value : config.geminiApiKey,
                        });
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="sk-… atau token API provider Anda"
                      className="rounded-md pl-3.5 pr-9 py-2 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setVisibleKeyIds((prev) => ({ ...prev, [primaryEp.id]: !prev[primaryEp.id] }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded"
                      aria-label={isPrimaryVisible ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
                    >
                      {isPrimaryVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup Endpoints */}
            {rawEndpoints.slice(1).map((backupEp, bIndex) => {
              const actualIndex = bIndex + 1;
              const isBackupVisible = Boolean(visibleKeyIds[backupEp.id]);

              return (
                <div key={backupEp.id} className="p-4 sm:p-5 rounded-xl border bg-card border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted inline-block" />
                      Endpoint Cadangan #{actualIndex} (Failover)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = rawEndpoints.filter((_, idx) => idx !== actualIndex);
                        setConfig({ ...config, aiEndpoints: updated });
                        toast.success(`Endpoint cadangan #${actualIndex} dihapus`);
                      }}
                      className="text-destructive hover:text-destructive/80 text-xs flex items-center gap-1 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label htmlFor={`settings-backup-ai-url-${backupEp.id}`} className="block text-xs font-medium text-foreground mb-1.5">
                        Base URL Endpoint
                      </label>
                      <Input
                        id={`settings-backup-ai-url-${backupEp.id}`}
                        type="text"
                        value={backupEp.baseUrl}
                        onChange={(e) => {
                          const updated = [...rawEndpoints];
                          updated[actualIndex] = { ...updated[actualIndex], baseUrl: e.target.value };
                          setConfig({ ...config, aiEndpoints: updated });
                        }}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="https://api.openai.com/v1"
                        className="rounded-md px-3.5 py-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor={`settings-backup-ai-model-${backupEp.id}`} className="block text-xs font-medium text-foreground mb-1.5">
                        Nama Model AI
                      </label>
                      <Input
                        id={`settings-backup-ai-model-${backupEp.id}`}
                        type="text"
                        value={backupEp.model}
                        onChange={(e) => {
                          const updated = [...rawEndpoints];
                          updated[actualIndex] = { ...updated[actualIndex], model: e.target.value };
                          setConfig({ ...config, aiEndpoints: updated });
                        }}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="gpt-4o-mini"
                        className="rounded-md px-3.5 py-2 text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor={`settings-backup-ai-key-${backupEp.id}`} className="block text-xs font-medium text-foreground mb-1.5">
                        API Key Cadangan
                      </label>
                      <div className="relative">
                        <Input
                          id={`settings-backup-ai-key-${backupEp.id}`}
                          type={isBackupVisible ? 'text' : 'password'}
                          value={backupEp.apiKey}
                          onChange={(e) => {
                            const updated = [...rawEndpoints];
                            updated[actualIndex] = { ...updated[actualIndex], apiKey: e.target.value };
                            setConfig({ ...config, aiEndpoints: updated });
                          }}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="sk-… atau token cadangan"
                          className="rounded-md pl-3.5 pr-9 py-2 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setVisibleKeyIds((prev) => ({ ...prev, [backupEp.id]: !prev[backupEp.id] }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded"
                          aria-label={isBackupVisible ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
                        >
                          {isBackupVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Backup Button */}
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newBackup: AiEndpointConfig = {
                    id: `ep-backup-${Date.now()}`,
                    name: `Cadangan ${rawEndpoints.length}`,
                    type: 'openai_compatible',
                    baseUrl: 'https://api.openai.com/v1',
                    apiKey: '',
                    model: 'gpt-4o-mini',
                    isActive: false,
                  };
                  setConfig({ ...config, aiEndpoints: [...rawEndpoints, newBackup] });
                  toast.info('Formulir endpoint cadangan baru ditambahkan');
                }}
                className="rounded-md text-xs gap-2 border-dashed"
              >
                <Plus className="w-3.5 h-3.5 text-brand" />
                <span>Tambah Endpoint Cadangan (Failover)</span>
              </Button>

              <p className="text-[11px] text-muted-foreground hidden sm:block">
                💡 Bila kuota endpoint utama habis, sistem secara otomatis beralih ke cadangan.
              </p>
            </div>
          </div>
        </div>

        {/* 2. MEDIA PENYIMPANAN DATA */}
        <div id="settings-storage-section" className="space-y-4 pt-6 border-t border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Penyimpanan Riwayat Lamaran</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pilih format media penyimpanan untuk riwayat pekerjaan yang berhasil dilamar oleh bot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: SQLite */}
            <button
              type="button"
              onClick={() => setConfig({ ...config, storageType: 'sqlite' })}
              className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                config.storageType === 'sqlite' || !config.storageType
                  ? 'bg-brand/5 border-brand text-foreground shadow-xs ring-1 ring-brand/30'
                  : 'bg-card border-border text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                  <Database className="w-4 h-4" />
                </div>
                {(config.storageType === 'sqlite' || !config.storageType) && (
                  <Badge variant="brandSubtle" className="text-[10px] font-medium gap-1">
                    <Check className="w-3 h-3" />
                    <span>Aktif</span>
                  </Badge>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">SQLite Database (Bawaan)</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Tersimpan di `data/jobs.db`. Tercepat, andal, dan mendukung ribuan data tanpa perlambatan.
                </div>
              </div>
            </button>

            {/* Option 2: JSON File */}
            <button
              type="button"
              onClick={() => setConfig({ ...config, storageType: 'json' })}
              className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                config.storageType === 'json'
                  ? 'bg-sky-500/5 border-sky-500 text-foreground shadow-xs ring-1 ring-sky-500/30'
                  : 'bg-card border-border text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                  <FileJson className="w-4 h-4" />
                </div>
                {config.storageType === 'json' && (
                  <Badge variant="outline" className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20 gap-1">
                    <Check className="w-3 h-3" />
                    <span>Aktif</span>
                  </Badge>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Local JSON File</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Tersimpan di `applied_jobs.json`. Berkas teks portabel yang mudah dibaca dan diedit manual.
                </div>
              </div>
            </button>

            {/* Option 3: Google Sheets */}
            <button
              type="button"
              onClick={() => setConfig({ ...config, storageType: 'sheets' })}
              className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                config.storageType === 'sheets'
                  ? 'bg-emerald-500/5 border-emerald-500 text-foreground shadow-xs ring-1 ring-emerald-500/30'
                  : 'bg-card border-border text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                {config.storageType === 'sheets' && (
                  <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 gap-1">
                    <Check className="w-3 h-3" />
                    <span>Aktif</span>
                  </Badge>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Google Sheets API</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Sinkronisasi riwayat lamaran ke spreadsheet Google Drive secara real-time.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. KREDENSIAL GOOGLE SHEETS */}
        <div
          className={`space-y-4 pt-6 border-t border-border transition-all ${
            config.storageType === 'sheets' ? 'opacity-100' : 'opacity-80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Kredensial &amp; Konfigurasi Google Sheets</span>
            </div>
            {config.storageType !== 'sheets' ? (
              <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded border border-border">
                Hanya diperlukan bila storage Google Sheets dipilih
              </span>
            ) : (
              <Badge variant="successSubtle" className="text-[11px] font-medium">
                Wajib Diisi (Google Sheets Aktif)
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="settings-sheets-id" className="block text-xs font-medium text-foreground">
                  Spreadsheet ID
                </label>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                  {config.storageType === 'sheets' ? 'Wajib' : 'Opsional'}
                </span>
              </div>
              <Input
                id="settings-sheets-id"
                type="text"
                value={config.spreadsheetId || ''}
                onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
                className="rounded-md px-3.5 py-2 text-xs font-mono"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="settings-sheets-tab" className="block text-xs font-medium text-foreground">
                  Nama Sheet Tab
                </label>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                  Opsional
                </span>
              </div>
              <Input
                id="settings-sheets-tab"
                type="text"
                value={config.sheetName || 'Sheet1'}
                onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                className="rounded-md px-3.5 py-2 text-xs"
                placeholder="Sheet1"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="settings-sheets-creds" className="block text-xs font-medium text-foreground">
                Google Credentials JSON (Service Account)
              </label>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                {config.storageType === 'sheets' ? 'Wajib' : 'Opsional'}
              </span>
            </div>
            <Textarea
              id="settings-sheets-creds"
              rows={4}
              value={config.googleCredentialsJson || ''}
              onChange={(e) => setConfig({ ...config, googleCredentialsJson: e.target.value })}
              className="rounded-md p-3.5 text-xs font-mono"
              placeholder='{"type": "service_account", "project_id": "...", ...}'
            />
          </div>
        </div>

        {/* 4. PREFERENSI MESIN OTOMASI & BROWSER */}
        <div id="settings-browser-section" className="space-y-4 pt-6 border-t border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Pengaturan Browser &amp; Otomatisasi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sesuaikan performa eksekusi, simulasi manusia, dan tingkat keamanan mesin browser Camoufox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Stealth Mode */}
            <div className="p-4 rounded-xl border bg-card border-border flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-foreground">Human Stealth Simulation</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Mengacak jeda klik, gerakan kursor mouse melengkung alami, dan kecepatan ketik agar tidak terdeteksi bot Cloudflare / DataDome.
                </div>
              </div>
              <Switch
                id="settings-stealth-mode"
                checked={config.enableHumanStealth ?? true}
                onCheckedChange={(checked) => setConfig({ ...config, enableHumanStealth: checked })}
                className="mt-1"
              />
            </div>

            {/* Debug Test Mode */}
            <div className="p-4 rounded-xl border bg-card border-border flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-foreground">Mode Uji Coba (Debug Dry-Run)</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Mencari dan membuka lowongan kerja tanpa menekan tombol submit lamaran akhir. Cocok untuk verifikasi selektor form.
                </div>
              </div>
              <Switch
                id="settings-debug-mode"
                checked={config.debugTest ?? false}
                onCheckedChange={(checked) => setConfig({ ...config, debugTest: checked })}
                className="mt-1"
              />
            </div>

            {/* Mode Kirim Lamaran */}
            <div className="p-4 rounded-xl border bg-card border-border space-y-2">
              <label htmlFor="settings-apply-mode" className="block font-semibold text-foreground">
                Mode Pengiriman Lamaran
              </label>
              <select
                id="settings-apply-mode"
                value={config.autoApplyMode || 'auto'}
                onChange={(e) => setConfig({ ...config, autoApplyMode: e.target.value as 'auto' | 'review' })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus-visible:ring-1 focus-visible:ring-brand focus-visible:outline-hidden cursor-pointer"
              >
                <option value="auto">Otomatis Kirim Penuh (Auto-Submit)</option>
                <option value="review">Mode Review (Minta Konfirmasi Pengguna)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                {config.autoApplyMode === 'review'
                  ? 'Bot akan mengisi semua jawaban dan berhenti di tombol submit menunggu persetujuan Anda.'
                  : 'Bot otomatis mengirimkan formulir lamaran saat semua isian sudah lengkap.'}
              </p>
            </div>

            {/* Concurrency */}
            <div className="p-4 rounded-xl border bg-card border-border space-y-2">
              <label htmlFor="settings-concurrency" className="block font-semibold text-foreground">
                Jumlah Tab / Browser Serentak (Concurrency)
              </label>
              <Input
                id="settings-concurrency"
                type="number"
                min={1}
                max={5}
                value={config.concurrency || 1}
                onChange={(e) =>
                  setConfig({ ...config, concurrency: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="rounded-md px-3 py-2 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Disarankan 1 untuk stabilitas sesi portal loker dan konsumsi RAM yang hemat.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Semua pengaturan tersimpan aman secara lokal di sistem Anda.
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="brand"
              disabled={isSavingConfig}
              onClick={() => handleSaveConfig()}
              className="rounded-md text-xs font-medium gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
