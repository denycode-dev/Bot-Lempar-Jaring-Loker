'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Zap, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Save, 
  Lock,
  Layers,
  Sparkles,
  Bot,
  Edit3,
  ListFilter
} from 'lucide-react';

interface AiSettingsState {
  aiProvider?: 'gemini' | 'custom_router';
  customAiApiKey: string;
  hasCustomAiKey: boolean;
  customAiBaseUrl: string;
  customAiModel: string;
  generateCoverLetter: boolean;
  humanStealthMode: boolean;
  matchScoreThreshold: number;
  autoSubmit: boolean;
  concurrency: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AiSettingsState>({
    aiProvider: 'custom_router',
    customAiApiKey: '',
    hasCustomAiKey: false,
    customAiBaseUrl: 'https://api.openai.com/v1',
    customAiModel: 'gpt-4o-mini',
    generateCoverLetter: true,
    humanStealthMode: true,
    matchScoreThreshold: 75,
    autoSubmit: false,
    concurrency: 2,
  });

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; reply?: string } | null>(null);
  const [testingAi, setTestingAi] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Dynamic models fetching states
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isManualModelInput, setIsManualModelInput] = useState(false);

  const fetchModels = async (baseUrlOverride?: string, apiKeyOverride?: string) => {
    const targetUrl = (baseUrlOverride !== undefined ? baseUrlOverride : settings.customAiBaseUrl).trim();
    const targetKey = (apiKeyOverride !== undefined ? apiKeyOverride : settings.customAiApiKey).trim();

    if (!targetUrl) {
      setModelsError('URL endpoint AI belum diisi.');
      return;
    }

    try {
      setLoadingModels(true);
      setModelsError(null);

      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: targetUrl,
          apiKey: targetKey && !targetKey.includes('••••') ? targetKey : undefined,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.models) && data.models.length > 0) {
        setModelsList(data.models);
        // If current model is empty, default to the first available model
        setSettings((prev) => {
          if (!prev.customAiModel) {
            return { ...prev, customAiModel: data.models[0] };
          }
          return prev;
        });
      } else {
        setModelsError(data.error || 'Daftar model kosong dari endpoint ini.');
      }
    } catch (err: any) {
      setModelsError(err?.message || 'Gagal menghubungi server untuk memuat model.');
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.config) {
        const c = data.config;
        const initialUrl = c.customAiBaseUrl || 'https://api.openai.com/v1';
        const initialModel = c.customAiModel || 'gpt-4o-mini';
        const hasKey = Boolean(c.hasCustomAiKey);
        const apiKey = c.customAiApiKey || '';

        setSettings({
          aiProvider: 'custom_router',
          customAiApiKey: apiKey,
          hasCustomAiKey: hasKey,
          customAiBaseUrl: initialUrl,
          customAiModel: initialModel,
          generateCoverLetter: c.generateCoverLetter ?? true,
          humanStealthMode: c.humanStealthMode ?? true,
          matchScoreThreshold: c.matchScoreThreshold || 75,
          autoSubmit: c.autoSubmit ?? false,
          concurrency: c.concurrency || 2,
        });

        // Automatically load models list if endpoint and key are already configured
        if (hasKey && initialUrl) {
          fetchModels(initialUrl, apiKey);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    startTransition(async () => {
      try {
        const payload = {
          ...settings,
          aiProvider: 'custom_router', // Ensure OpenAI Standard compatible provider
        };

        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (result.success) {
          setSaveStatus({
            type: 'success',
            message: 'Konfigurasi AI (OpenAI Standard) & Enkripsi Kunci berhasil diperbarui!',
          });
          // Refresh settings to obtain latest masked keys
          await fetchSettings();
        } else {
          setSaveStatus({
            type: 'error',
            message: result.error || 'Gagal menyimpan pengaturan.',
          });
        }
      } catch (err: any) {
        setSaveStatus({
          type: 'error',
          message: err?.message || 'Terjadi kesalahan sistem saat menyimpan.',
        });
      }
    });
  };

  const handleTestAi = async () => {
    setTestingAi(true);
    setTestResult(null);

    try {
      const keyToSend = settings.customAiApiKey;

      const payload: any = {};
      if (keyToSend && !keyToSend.includes('••••')) {
        payload.endpoint = {
          type: 'openai_compatible',
          apiKey: keyToSend,
          baseUrl: settings.customAiBaseUrl,
          model: settings.customAiModel,
        };
      }

      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Koneksi AI Terverifikasi Aktif!',
          reply: data.reply,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Gagal terhubung ke AI Endpoint.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Gagal menguji koneksi AI.',
      });
    } finally {
      setTestingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="h-6 w-6 text-blue-500" />
              Pengaturan &amp; AI Configuration
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Kelola kredensial AI berstandar OpenAI (AES-256-GCM), seleksi model gateway, dan parameter otomasi pelamar.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            AES-256-GCM Enkripsi Aktif
          </div>
        </div>
      </div>

      {/* Alerts */}
      {saveStatus && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
            saveStatus.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Unified AI Configuration (OpenAI Standard Only) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Konfigurasi AI (OpenAI Standard)</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kompatibel dengan semua provider OpenAI standard (OpenAI, Qodeer, OpenRouter, Groq, Ollama, DeepSeek, dll).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Lock className="h-3.5 w-3.5 text-zinc-400" />
              Tersimpan di PostgreSQL
            </div>
          </div>

          <div className="space-y-5">
            {/* Field 1: AI URL (ai-url) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
                <span>AI Base URL (<code className="text-blue-400">ai-url</code>)</span>
                <span className="text-[11px] text-zinc-500">Standar OpenAI API</span>
              </label>
              <input
                type="text"
                value={settings.customAiBaseUrl}
                onChange={(e) => setSettings((s) => ({ ...s, customAiBaseUrl: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">
                Endpoint gateway OpenAI-compatible. Dilindungi filter SSRF: IP lokal/internal diblokir otomatis.
              </p>
            </div>

            {/* Field 2: Token / API Key */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
                <span>API Key / Token (<code className="text-blue-400">token</code>)</span>
                {settings.hasCustomAiKey && (
                  <span className="text-xs text-emerald-400 font-medium">Kunci tersimpan aman (AES-256)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={settings.customAiApiKey}
                  onChange={(e) => setSettings((s) => ({ ...s, customAiApiKey: e.target.value }))}
                  placeholder={settings.hasCustomAiKey ? '•••••••• (Kunci tersimpan aman)' : 'Masukkan Token / API Key...'}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  aria-label={showToken ? 'Sembunyikan token' : 'Tampilkan token'}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Digunakan untuk autentikasi <code className="text-zinc-400">Authorization: Bearer &lt;TOKEN&gt;</code>.
              </p>
            </div>

            {/* Field 3: AI Model (Select Dropdown + Fetch Button) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <ListFilter className="h-4 w-4 text-blue-400" />
                  <span>Model AI (<code className="text-blue-400">model</code>)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualModelInput(!isManualModelInput)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{isManualModelInput ? 'Gunakan Dropdown' : 'Ketik Manual'}</span>
                  </button>

                  <span className="text-zinc-600">&bull;</span>

                  <button
                    type="button"
                    onClick={() => fetchModels()}
                    disabled={loadingModels}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                    title="Ambil daftar model dari curl {ai-url}/models"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingModels ? 'animate-spin' : ''}`} />
                    <span>{loadingModels ? 'Mengambil...' : 'Tarik Daftar Model'}</span>
                  </button>
                </div>
              </div>

              {isManualModelInput ? (
                <input
                  type="text"
                  value={settings.customAiModel}
                  onChange={(e) => setSettings((s) => ({ ...s, customAiModel: e.target.value }))}
                  placeholder="Contoh: gpt-4o-mini atau meng/claude-sonnet-5.5"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              ) : (
                <div className="relative">
                  <select
                    value={settings.customAiModel}
                    onChange={(e) => setSettings((s) => ({ ...s, customAiModel: e.target.value }))}
                    disabled={loadingModels}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono cursor-pointer disabled:opacity-50 appearance-none pr-8"
                  >
                    {modelsList.length > 0 ? (
                      <>
                        {!modelsList.includes(settings.customAiModel) && settings.customAiModel && (
                          <option value={settings.customAiModel}>
                            {settings.customAiModel} (Model saat ini)
                          </option>
                        )}
                        {modelsList.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value={settings.customAiModel}>
                        {settings.customAiModel
                          ? `${settings.customAiModel} (Belum sinkron model - klik 'Tarik Daftar Model')`
                          : '-- Klik Tarik Daftar Model --'}
                      </option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-3 text-zinc-400">
                    <RefreshCw className={`h-4 w-4 ${loadingModels ? 'animate-spin text-blue-400' : 'opacity-60'}`} />
                  </div>
                </div>
              )}

              {/* Status and Error Indicators */}
              {modelsList.length > 0 && !modelsError && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{modelsList.length} model berhasil dimuat dari endpoint <code className="text-zinc-300">{settings.customAiBaseUrl}/models</code>.</span>
                </p>
              )}

              {modelsError && (
                <div className="mt-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Gagal menarik model:</span> {modelsError}
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      Anda dapat menggunakan opsi <b>Ketik Manual</b> di atas untuk menulis nama model langsung jika endpoint tidak mendukung rute /models.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-zinc-500">
                Model yang digunakan untuk klasifikasi formulir loker, analisis CV, dan penyusunan jawaban screening.
              </p>
            </div>
          </div>

          {/* Test AI Connection Button & Output */}
          <div className="pt-3 border-t border-zinc-800/80">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestAi}
                disabled={testingAi}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
              >
                {testingAi ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                    Menguji Endpoint AI...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-400" />
                    Uji Koneksi AI
                  </>
                )}
              </button>
              <span className="text-xs text-zinc-400">
                Memverifikasi keaktifan model <code className="text-zinc-200">{settings.customAiModel}</code> dan respon endpoint.
              </span>
            </div>

            {testResult && (
              <div
                className={`mt-3 rounded-lg border p-3.5 text-xs ${
                  testResult.success
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-red-500/30 bg-red-500/10 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.reply && (
                  <div className="mt-2 rounded bg-zinc-950/60 p-2.5 font-mono text-[11px] text-zinc-300">
                    Respons AI: {testResult.reply}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Automation & Strategy Options */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Perilaku Otomasi &amp; Pelamar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3.5 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={settings.generateCoverLetter}
                onChange={(e) => setSettings((s) => ({ ...s, generateCoverLetter: e.target.checked }))}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-white block">Generate Cover Letter Otomatis</span>
                <span className="text-xs text-zinc-400 block mt-0.5">
                  AI menyusun surat lamaran spesifik sesuai kualifikasi lowongan dan profil CV pelamar.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3.5 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={settings.humanStealthMode}
                onChange={(e) => setSettings((s) => ({ ...s, humanStealthMode: e.target.checked }))}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-white block">Human Stealth Mode</span>
                <span className="text-xs text-zinc-400 block mt-0.5">
                  Menambahkan jeda realistis antar pengetikan &amp; klik guna menghindari deteksi bot WAF.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3.5 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={settings.autoSubmit}
                onChange={(e) => setSettings((s) => ({ ...s, autoSubmit: e.target.checked }))}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-white block">Auto-Submit Aplikasi Langsung</span>
                <span className="text-xs text-zinc-400 block mt-0.5">
                  Jika dinonaktifkan, bot akan berhenti sebelum tombol Submit akhir untuk review manual.
                </span>
              </div>
            </label>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Batas Skor Kecocokan Minimum</span>
                <span className="text-sm font-bold text-blue-400">{settings.matchScoreThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={settings.matchScoreThreshold}
                onChange={(e) => setSettings((s) => ({ ...s, matchScoreThreshold: Number(e.target.value) }))}
                className="mt-3 w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-400 block mt-1">
                Bot hanya melamar lowongan dengan skor relevansi di atas nilai ambang batas ini.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: System Architecture & Storage Badge */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Penyimpanan Terpadu PostgreSQL</h3>
                <p className="text-xs text-zinc-400">
                  Database: <code className="text-zinc-200">autoapply</code> @ localhost:5432 &bull; Trigram Search (<code className="text-zinc-200">pg_trgm</code>) Aktif &bull; Zero Google Sheets Dependency
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              Database Online
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
