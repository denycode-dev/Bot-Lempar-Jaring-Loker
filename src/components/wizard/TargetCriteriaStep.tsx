'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Check,
  Sliders,
  Filter,
  Users,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  KeyRound,
  Plus,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { AppConfig } from '@/types';

interface TargetCriteriaStepProps {
  config: AppConfig;
  onChangeConfig: (config: AppConfig) => void;
  sessionStatuses: Record<string, Record<string, { loggedIn: boolean; details?: string }>>;
  isCheckingSessions: boolean;
  isSetupBrowserLoading: boolean;
  isSetupBrowserRunning: boolean;
  isBotRunning: boolean;
  onOpenCookieModal: (platform: string) => void;
  onCheckAccountSessions: (accountId?: string) => void;
  onToggleSetupBrowser: (profileFolder?: string) => void;
  onOpenAddAccount: () => void;
  onSelectActiveAccount: (accountId: string) => void;
  onDeleteAccount: (accountId: string) => void;
}

export const TargetCriteriaStep: React.FC<TargetCriteriaStepProps> = ({
  config,
  onChangeConfig,
  sessionStatuses,
  isCheckingSessions,
  isSetupBrowserLoading,
  isSetupBrowserRunning,
  isBotRunning,
  onOpenCookieModal,
  onCheckAccountSessions,
  onToggleSetupBrowser,
  onOpenAddAccount,
  onSelectActiveAccount,
  onDeleteAccount,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">Target Lowongan &amp; Kuota</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tentukan kata kunci pekerjaan yang dibidik, lokasi, dan platform yang ingin diikutsertakan.
        </p>
      </div>

      {/* Platform Checkbox Pills */}
      <div id="tour-criteria-platform">
        <label className="block text-xs font-medium text-muted-foreground mb-2">Platform Aktif</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'enableGlints', label: 'Glints' },
            { key: 'enableJobstreet', label: 'JobStreet' },
            { key: 'enableLinkedin', label: 'LinkedIn' },
            { key: 'enableIndeed', label: 'Indeed' },
          ].map((item) => {
            const isChecked = Boolean(config[item.key as keyof AppConfig]);
            return (
              <label
                key={item.key}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 select-none ${
                  isChecked
                    ? 'bg-brand/5 border-brand/40 text-foreground'
                    : 'bg-card border-border text-muted-foreground hover:border-brand/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onChangeConfig({ ...config, [item.key]: e.target.checked })}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-brand border-brand text-white dark:text-zinc-950' : 'border-input'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3" />}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Criteria Main Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div id="field-criteria-keywords" className="p-2 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-foreground">Kata Kunci Lowongan</label>
            <span className="text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
              Wajib
            </span>
          </div>
          <input
            type="text"
            required={!config.indeedNoJobTitleFilter}
            value={config.searchKeywords || ''}
            onChange={(e) => onChangeConfig({ ...config, searchKeywords: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="Frontend Developer, React"
          />
        </div>

        <div id="field-criteria-location" className="p-2 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-foreground">Lokasi Kerja</label>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="text"
            value={config.location || ''}
            onChange={(e) => onChangeConfig({ ...config, location: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="Jakarta, Remote"
          />
        </div>

        <div id="field-criteria-salary" className="p-2 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-foreground">Filter Gaji Minimal</label>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="text"
            value={config.minSalary || ''}
            onChange={(e) => onChangeConfig({ ...config, minSalary: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs tabular-nums"
            placeholder="Misal: 8000000"
          />
        </div>

        <div id="field-criteria-concurrency" className="p-2 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-foreground">Worker Konkuren (Tab)</label>
            <span className="text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
              Wajib
            </span>
          </div>
          <input
            type="number"
            min={1}
            max={8}
            value={config.concurrency || 3}
            onChange={(e) => onChangeConfig({ ...config, concurrency: parseInt(e.target.value) || 3 })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs tabular-nums"
          />
        </div>
      </div>

      {/* Limit Schema */}
      <div id="field-criteria-limit" className="p-5 rounded-xl bg-card border border-border space-y-4 shadow-xs transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="text-xs font-semibold text-foreground">Mode Pembagian Batasan Harian</div>
            <div className="text-[11px] text-muted-foreground">Atur batasan maksimal pengiriman lamaran per hari</div>
          </div>

          <div className="flex bg-secondary/50 p-1 rounded-md border border-border self-start md:self-auto">
            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, limitMode: 'shared' })}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition ${
                (config.limitMode || 'shared') === 'shared'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Batas Gabungan (Shared)
            </button>
            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, limitMode: 'per_platform' })}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition ${
                config.limitMode === 'per_platform'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Batas Terpisah
            </button>
          </div>
        </div>

        {(config.limitMode || 'shared') === 'shared' ? (
          <div className="flex items-center gap-4">
            <div className="w-48">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Total Kuota Bersama</label>
              <input
                type="number"
                min={1}
                value={config.limitPerDay}
                onChange={(e) => onChangeConfig({ ...config, limitPerDay: parseInt(e.target.value) || 0 })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 tabular-nums"
              />
            </div>
            <div className="text-xs text-muted-foreground pt-3">
              Bot akan berhenti otomatis jika total gabungan seluruh platform mencapai kuota ini.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {[
              { key: 'limitGlints', label: 'Glints', defaultVal: 80 },
              { key: 'limitJobstreet', label: 'JobStreet', defaultVal: 75 },
              { key: 'limitLinkedin', label: 'LinkedIn', defaultVal: 50 },
              { key: 'limitIndeed', label: 'Indeed', defaultVal: 50 },
            ].map((p) => (
              <div key={p.key}>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">{p.label}</label>
                <input
                  type="number"
                  value={(config as any)[p.key] || p.defaultVal}
                  onChange={(e) => onChangeConfig({ ...config, [p.key]: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 tabular-nums"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode Simulasi Debug */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-xs">
        <div>
          <div className="text-xs font-semibold text-foreground">Mode Simulasi (Debug)</div>
          <div className="text-[11px] text-muted-foreground">
            Navigasi lowongan tanpa menekan tombol kirim akhir untuk uji coba alur bot.
          </div>
        </div>
        <input
          type="checkbox"
          checked={config.debugTest}
          onChange={(e) => onChangeConfig({ ...config, debugTest: e.target.checked })}
          className="w-4 h-4 rounded border-input text-brand focus:ring-0 cursor-pointer"
        />
      </div>

      {/* FITUR OTOMASI PENDUKUNG */}
      <div id="tour-smart-features" className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">
              Otomasi Formulir &amp; Filter Relevansi
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Opsi tambahan untuk pengisian esai motivasi, jeda waktu alami, dan filter syarat kualifikasi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dynamic Cover Letter */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Generator Surat Motivasi</span>
              <input
                type="checkbox"
                checked={config.enableCoverLetterGen ?? true}
                onChange={(e) => onChangeConfig({ ...config, enableCoverLetterGen: e.target.checked })}
                className="w-4 h-4 rounded border-input text-brand focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Menyusun respon motivasi yang relevan sesuai posisi dan profil saat form pertanyaan memintanya.
            </p>
          </div>

          {/* Human Stealth Emulation */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Simulasi Jeda Ketik Alami</span>
              <input
                type="checkbox"
                checked={config.enableHumanStealth ?? true}
                onChange={(e) => onChangeConfig({ ...config, enableHumanStealth: e.target.checked })}
                className="w-4 h-4 rounded border-input text-brand focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Menambahkan variasi jeda pengetikan (40-120ms) dan jeda klik untuk mensimulasikan interaksi pengguna.
            </p>
          </div>
        </div>

        {/* Negative Keywords & Blacklist */}
        <div id="field-criteria-blacklist" className="p-4 rounded-xl border border-border bg-muted/20 space-y-3 transition-all">
          <div>
            <span className="text-xs font-semibold text-foreground">Penyaringan &amp; Blacklist Loker</span>
            <p className="text-[11px] text-muted-foreground">
              Mencegah bot melamar kantor sendiri, agensi yang dihindari, atau loker magang dan kata kunci yang tidak diinginkan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Blacklist Perusahaan (Dipisahkan Koma)
              </label>
              <input
                type="text"
                value={config.blacklistedCompanies || ''}
                onChange={(e) => onChangeConfig({ ...config, blacklistedCompanies: e.target.value })}
                placeholder="Kantor Sekarang, PT ABC, Agensi XYZ..."
                className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Jika nama perusahaan cocok, bot langsung melewatinya (0 kuota).
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Kata Kunci Terlarang (Negative Keywords)
              </label>
              <input
                type="text"
                value={config.negativeKeywords || ''}
                onChange={(e) => onChangeConfig({ ...config, negativeKeywords: e.target.value })}
                placeholder="magang, intern, unpaid, sales lapangan, mandarin..."
                className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Loker dengan judul/deskripsi berisi kata ini otomatis dilewati.
              </p>
            </div>
          </div>

          {/* Optional Match Scoring Threshold */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableJobMatchFilterCheck"
                checked={config.enableJobMatchFilter ?? false}
                onChange={(e) => onChangeConfig({ ...config, enableJobMatchFilter: e.target.checked })}
                className="w-4 h-4 rounded border-input text-brand focus:ring-0 cursor-pointer"
              />
              <label htmlFor="enableJobMatchFilterCheck" className="text-xs font-medium text-foreground cursor-pointer select-none">
                Aktifkan Skor Relevansi Minimal ({config.minMatchScore ?? 50}%)
              </label>
            </div>
            {config.enableJobMatchFilter && (
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={config.minMatchScore ?? 50}
                onChange={(e) => onChangeConfig({ ...config, minMatchScore: Number(e.target.value) })}
                className="w-32 cursor-pointer accent-brand"
              />
            )}
          </div>
        </div>

        {/* Execution Mode */}
        <div id="field-criteria-autoapplymode" className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 transition-all">
          <div>
            <span className="text-xs font-semibold text-foreground">Mode Eksekusi Lamaran</span>
            <p className="text-[11px] text-muted-foreground">
              Pilih apakah bot langsung mengirim lamaran atau berhenti di tombol akhir untuk Anda tinjau.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, autoApplyMode: 'auto' })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                (config.autoApplyMode || 'auto') === 'auto'
                  ? 'bg-brand/5 border-brand text-foreground font-semibold shadow-xs'
                  : 'bg-background border-border text-muted-foreground hover:border-brand/40'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-foreground">Otomatis Penuh (Full Auto)</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Langsung kirim formulir dan lanjut ke lowongan berikutnya.</div>
              </div>
              {(config.autoApplyMode || 'auto') === 'auto' && <Check className="w-4 h-4 text-brand shrink-0 ml-2" />}
            </button>

            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, autoApplyMode: 'review' })}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                config.autoApplyMode === 'review'
                  ? 'bg-brand/5 border-brand text-foreground font-semibold shadow-xs'
                  : 'bg-background border-border text-muted-foreground hover:border-brand/40'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-foreground">Mode Copilot (Tinjau Dulu)</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Isi semua form, lalu jeda di tombol kirim agar Anda bisa cek ulang.</div>
              </div>
              {config.autoApplyMode === 'review' && <Check className="w-4 h-4 text-brand shrink-0 ml-2" />}
            </button>
          </div>
        </div>
      </div>

      {/* FILTER PENCARIAN LANJUTAN */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-border pb-4">
          <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">Filter Pencarian Lanjutan</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Menyaring hasil pencarian di setiap platform agar lebih relevan dan sesuai target.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal Posting */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tanggal Diposting</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: '', l: 'Semua' },
                { v: '24h', l: '24 Jam' },
                { v: 'week', l: '7 Hari' },
                { v: 'month', l: '30 Hari' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => onChangeConfig({ ...config, datePosted: opt.v as any })}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition ${
                    (config.datePosted ?? '') === opt.v
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                      : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Tipe Pekerjaan */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tipe Pekerjaan</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: 'full_time', l: 'Full-time' },
                { v: 'part_time', l: 'Part-time' },
                { v: 'contract', l: 'Kontrak' },
                { v: 'internship', l: 'Magang' },
                { v: 'freelance', l: 'Freelance' },
              ].map((opt) => {
                const active = (config.jobType || []).includes(opt.v);
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => {
                      const cur = config.jobType || [];
                      onChangeConfig({
                        ...config,
                        jobType: active ? cur.filter((x) => x !== opt.v) : [...cur, opt.v],
                      });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Kerja */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mode Kerja</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: 'onsite', l: 'On-site' },
                { v: 'hybrid', l: 'Hybrid' },
                { v: 'remote', l: 'Remote' },
              ].map((opt) => {
                const active = (config.workMode || []).includes(opt.v);
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => {
                      const cur = config.workMode || [];
                      onChangeConfig({
                        ...config,
                        workMode: active ? cur.filter((x) => x !== opt.v) : [...cur, opt.v],
                      });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Pengalaman */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Level Pengalaman</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: 'fresh', l: 'Fresh Grad' },
                { v: '1-3', l: '1–3 Tahun' },
                { v: '3-5', l: '3–5 Tahun' },
                { v: '5+', l: '5+ Tahun' },
              ].map((opt) => {
                const active = (config.experienceLevel || []).includes(opt.v);
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => {
                      const cur = config.experienceLevel || [];
                      onChangeConfig({
                        ...config,
                        experienceLevel: active ? cur.filter((x) => x !== opt.v) : [...cur, opt.v],
                      });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand shrink-0" />
          <span>Filter ini berlaku untuk <b className="text-foreground">LinkedIn, Indeed, Glints, dan JobStreet</b>.</span>
        </p>
      </div>

      {/* MULTI-AKUN & KESIAPAN SESI LOGIN PORTAL KERJA */}
      <div id="tour-cookie-sync" className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                <span>Manajemen Akun &amp; Verifikasi Sesi Portal</span>
                <Badge variant="brandSubtle" className="text-[10px] font-medium">
                  Multi-Akun Aktif
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dukungan multi-profil browser untuk rotasi akun serta verifikasi status otentikasi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenCookieModal('glints')}
              className="text-xs gap-1.5 h-8 rounded-md border-border bg-background hover:bg-muted"
              title="Impor cookie sesi dari browser"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>Impor Cookies</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCheckAccountSessions()}
              disabled={isCheckingSessions || isSetupBrowserRunning}
              className="text-xs gap-1.5 h-8 rounded-md"
              title="Periksa apakah cookies/sesi masih aktif di browser tanpa membuka jendela"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSessions ? 'animate-spin text-brand' : 'text-muted-foreground'}`} />
              <span>{isCheckingSessions ? 'Memeriksa...' : 'Cek Status Sesi'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const activeAcc = (config.browserAccounts || []).find((a) => a.id === config.activeBrowserAccountId);
                onToggleSetupBrowser(activeAcc?.profileFolder);
              }}
              disabled={isSetupBrowserLoading || isBotRunning}
              className={`text-xs gap-1.5 h-8 rounded-md ${
                isSetupBrowserRunning ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' : ''
              }`}
            >
              {isSetupBrowserLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
              ) : (
                <KeyRound className="w-3.5 h-3.5" />
              )}
              <span>
                {isSetupBrowserLoading
                  ? 'Membuka...'
                  : isSetupBrowserRunning
                  ? 'Tutup Login'
                  : 'Buka Browser Login'}
              </span>
            </Button>

            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={onOpenAddAccount}
              className="text-xs gap-1.5 h-8 rounded-md shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Akun</span>
            </Button>
          </div>
        </div>

        {/* Account Profiles Switcher Cards */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pilih Profil Akun Browser
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(config.browserAccounts || [
              { id: 'account-1', name: 'Akun Utama', profileFolder: 'automation-profile', createdAt: '2026-09-19' },
            ]).map((acc) => {
              const isActive = (config.activeBrowserAccountId || 'account-1') === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => onSelectActiveAccount(acc.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-brand/5 border-brand shadow-xs ring-1 ring-brand/30'
                      : 'bg-card border-border hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium ${
                          isActive ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {acc.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate">{acc.name}</span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-medium bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20 shrink-0">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 pt-1.5 border-t border-border">
                    <span className="font-mono truncate">{acc.profileFolder}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckAccountSessions(acc.id);
                        }}
                        className="hover:text-brand transition"
                        title="Cek sesi akun ini"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      {(config.browserAccounts || []).length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAccount(acc.id);
                          }}
                          className="hover:text-destructive transition"
                          title="Hapus profil akun ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clean Session Status Table */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Status Autentikasi Job Portal (Profil Aktif)
            </label>
            <span className="text-[10px] text-muted-foreground">
              {sessionStatuses[config.activeBrowserAccountId || 'account-1']
                ? 'Terverifikasi langsung dari browser'
                : 'Klik "Cek Status Sesi" untuk memindai login status terkini'}
            </span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2.5 px-3.5">Platform</th>
                    <th className="py-2.5 px-3.5">Status Filter</th>
                    <th className="py-2.5 px-3.5">Sesi Login</th>
                    <th className="py-2.5 px-3.5">Keterangan</th>
                    <th className="py-2.5 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-normal">
                  {[
                    {
                      id: 'glints',
                      name: 'Glints',
                      color: 'bg-blue-500',
                      enabled: config.enableGlints,
                      url: 'https://glints.com/id',
                    },
                    {
                      id: 'jobstreet',
                      name: 'JobStreet',
                      color: 'bg-purple-500',
                      enabled: config.enableJobstreet,
                      url: 'https://id.jobstreet.com',
                    },
                    {
                      id: 'linkedin',
                      name: 'LinkedIn',
                      color: 'bg-sky-500',
                      enabled: config.enableLinkedin,
                      url: 'https://www.linkedin.com',
                    },
                    {
                      id: 'indeed',
                      name: 'Indeed',
                      color: 'bg-emerald-500',
                      enabled: config.enableIndeed,
                      url: 'https://id.indeed.com',
                    },
                  ].map((portal) => {
                    const status = sessionStatuses[config.activeBrowserAccountId || 'account-1']?.[portal.id];
                    return (
                      <tr key={portal.id} className="hover:bg-muted/30 transition">
                        <td className="py-2.5 px-3.5 font-medium text-foreground flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${portal.color}`} />
                          <span>{portal.name}</span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <Badge
                            variant={portal.enabled ? 'brandSubtle' : 'secondary'}
                            className="text-[10px]"
                          >
                            {portal.enabled ? 'Diikutsertakan' : 'Dinonaktifkan'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3.5">
                          {!status ? (
                            <span className="text-[11px] text-muted-foreground">Belum Diperiksa</span>
                          ) : status.loggedIn ? (
                            <Badge variant="successSubtle" className="text-[10px] gap-1">
                              <Check className="w-3 h-3" /> Sudah Login
                            </Badge>
                          ) : (
                            <Badge variant="destructiveSubtle" className="text-[10px] gap-1">
                              <ShieldAlert className="w-3 h-3" /> Belum Login
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-muted-foreground text-[11px]">
                          {status?.details || `Memerlukan sesi akun ${portal.name}`}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand hover:underline inline-flex items-center gap-1 text-[11px] font-medium"
                          >
                            <span>Buka {portal.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
