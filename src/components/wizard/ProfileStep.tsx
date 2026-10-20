'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ChevronDown,
  FileText,
  Check,
  Eye,
  Upload,
  Bot,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { AppConfig } from '@/types';

interface ProfileStepProps {
  config: AppConfig;
  onChangeConfig: (config: AppConfig) => void;
  updatedCvFields: string[];
  unchangedCvFields: string[];
  onClearCvVisualMarks: () => void;
  isSyncingProfile: boolean;
  isBotRunning: boolean;
  onSyncProfile: (platform: string) => void;
  isUploadingCv: boolean;
  onCvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCvPreview: () => void;
  cvAnalysisSummary?: string;
  shouldUpdateProfileWithCv: boolean;
  onToggleShouldUpdateProfileWithCv: (val: boolean) => void;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({
  config,
  onChangeConfig,
  updatedCvFields,
  unchangedCvFields,
  onClearCvVisualMarks,
  isSyncingProfile,
  isBotRunning,
  onSyncProfile,
  isUploadingCv,
  onCvUpload,
  onOpenCvPreview,
  cvAnalysisSummary,
  shouldUpdateProfileWithCv,
  onToggleShouldUpdateProfileWithCv,
}) => {
  const [isProfileSyncDropdownOpen, setIsProfileSyncDropdownOpen] = useState(false);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  const getFieldClass = (field: string) => {
    if (updatedCvFields.includes(field)) {
      return 'bg-emerald-500/5 ring-2 ring-emerald-500/40 border-emerald-500';
    }
    if (unchangedCvFields.includes(field)) {
      return 'ring-1 ring-subtle-theme';
    }
    return '';
  };

  const renderAiBadge = (field: string) => {
    if (updatedCvFields.includes(field)) {
      return (
        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          ✨ Baru Diperbarui
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Profil Pelamar &amp; Analisis CV</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Data ini digunakan oleh bot dan AI saat mengisi formulir lowongan kerja secara otomatis.
          </p>
        </div>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsProfileSyncDropdownOpen(!isProfileSyncDropdownOpen)}
            disabled={isSyncingProfile || isBotRunning}
            className="text-xs gap-2 shadow-xs h-9 rounded-md"
            title="Tarik data profil otomatis dari akun Glints, Indeed, JobStreet, atau LinkedIn kamu"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSyncingProfile ? 'animate-spin text-brand' : 'text-muted-foreground'}`} />
            <span>{isSyncingProfile ? 'Menyinkronkan Profil...' : 'Tarik Profil dari Akun'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isProfileSyncDropdownOpen ? 'rotate-180' : ''}`} />
          </Button>

          {isProfileSyncDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-card border border-border shadow-lg py-1.5 z-30 divide-y divide-border text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Pilih Portal Sumber
              </div>
              <div>
                {[
                  { id: 'glints', name: 'Glints', sub: 'glints.com/id/profile' },
                  { id: 'indeed', name: 'Indeed', sub: 'profile.indeed.com' },
                  { id: 'jobstreet', name: 'JobStreet', sub: 'jobstreet.co.id' },
                  { id: 'linkedin', name: 'LinkedIn', sub: 'linkedin.com/in/me' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsProfileSyncDropdownOpen(false);
                      onSyncProfile(item.id);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between transition text-foreground"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{item.sub}</span>
                  </button>
                ))}
              </div>
              <div className="p-2.5 bg-muted/40 text-[10px] text-muted-foreground leading-relaxed">
                💡 <strong>Tips Cepat:</strong> Bila ekstensi AutoApply aktif, kamu cukup buka tab profilmu di browser lalu klik <em>&quot;Tarik Profil Ini&quot;</em> di pojok kanan bawah.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CV Document Upload Banner */}
      <div id="tour-cv-upload" className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-foreground">Dokumen CV Pelamar (PDF / DOCX)</span>
                {config.cvFileName ? (
                  <span className="text-[10px] font-medium bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                    <Check className="w-3 h-3 text-brand" />
                    <span>CV Terpasang</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                    Opsional / Rekomendasi
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {config.cvFileName
                  ? `File aktif: ${config.cvFileName} (Dianalisis: ${config.cvAnalyzedAt || 'Baru saja'})`
                  : 'Unggah CV Anda agar AI dapat membaca riwayat kerja, skill, dan otomatis mengunggah saat lowongan meminta lampiran resume.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {(config.cvFileName || config.cvExtractedText) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenCvPreview}
                className="text-xs gap-1.5 h-9 rounded-md"
                title="Lihat pratinjau teks CV dan perbandingan data profil"
              >
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Lihat Isi &amp; Preview CV</span>
              </Button>
            )}
            <input
              ref={cvFileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={onCvUpload}
            />
            <Button
              type="button"
              variant="brand"
              size="sm"
              disabled={isUploadingCv}
              onClick={() => cvFileInputRef.current?.click()}
              className="text-xs gap-2 h-9 shadow-xs rounded-md"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingCv ? 'Menganalisis...' : config.cvFileName ? 'Ganti File CV' : 'Upload File CV'}</span>
            </Button>
          </div>
        </div>

        {/* Sync checkbox */}
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={shouldUpdateProfileWithCv}
              onChange={(e) => onToggleShouldUpdateProfileWithCv(e.target.checked)}
              className="w-4 h-4 rounded border-input text-brand focus:ring-0 cursor-pointer"
            />
            <span className="text-foreground font-medium">
              Perbarui informasi profil di formulir secara otomatis dari CV ini
            </span>
          </label>

          {updatedCvFields.length > 0 && (
            <span className="text-[10px] font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
              ✨ {updatedCvFields.length} kolom berhasil diperbarui AI
            </span>
          )}
        </div>

        {cvAnalysisSummary && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
            <Bot className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="truncate">{cvAnalysisSummary}</span>
          </div>
        )}
      </div>

      {/* Visual marks indicator */}
      {(updatedCvFields.length > 0 || unchangedCvFields.length > 0) && (
        <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-brand">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
              <span>Border Biru: Diperbarui oleh AI</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              <span>Border Netral: Tidak Berubah / Tetap</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClearCvVisualMarks}
            className="text-[10px] text-muted-foreground hover:text-foreground underline"
          >
            Hapus tanda visual
          </button>
        </div>
      )}

      {/* Form Fields Grid */}
      <div id="tour-profile-fields" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Lengkap */}
        <div id="field-profile-fullname" className={`p-2 rounded-xl transition-all ${getFieldClass('fullName')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Nama Lengkap</label>
              {renderAiBadge('fullName')}
            </div>
            <span className="text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
              Wajib
            </span>
          </div>
          <input
            type="text"
            required
            value={config.fullName || ''}
            onChange={(e) => onChangeConfig({ ...config, fullName: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="Misal: Budi Santoso"
          />
        </div>

        {/* Nomor Telepon / WhatsApp */}
        <div id="field-profile-phone" className={`p-2 rounded-xl transition-all ${getFieldClass('phoneNumber')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Nomor Telepon / WhatsApp</label>
              {renderAiBadge('phoneNumber')}
            </div>
            <span className="text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
              Wajib
            </span>
          </div>
          <input
            type="text"
            required
            value={config.phoneNumber || ''}
            onChange={(e) => onChangeConfig({ ...config, phoneNumber: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="081234567890"
          />
        </div>

        {/* Email Pelamar */}
        <div id="field-profile-email" className={`p-2 rounded-xl transition-all ${getFieldClass('email')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Email Pelamar</label>
              {renderAiBadge('email')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="email"
            value={config.email || ''}
            onChange={(e) => onChangeConfig({ ...config, email: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="emailkamu@gmail.com"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Digunakan untuk mengisi form email di platform lamaran</p>
        </div>

        {/* Gender & Status Pernikahan */}
        <div className="grid grid-cols-2 gap-3">
          <div id="field-profile-gender" className={`p-2 rounded-xl transition-all ${getFieldClass('gender')}`}>
            <label className="block text-xs font-medium text-foreground mb-1.5">Jenis Kelamin</label>
            <select
              value={config.gender || 'Laki-laki'}
              onChange={(e) => onChangeConfig({ ...config, gender: e.target.value })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div id="field-profile-marital" className={`p-2 rounded-xl transition-all ${getFieldClass('maritalStatus')}`}>
            <label className="block text-xs font-medium text-foreground mb-1.5">Status Pernikahan</label>
            <select
              value={config.maritalStatus || 'Single'}
              onChange={(e) => onChangeConfig({ ...config, maritalStatus: e.target.value })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            >
              <option value="Single">Single / Belum Menikah</option>
              <option value="Menikah">Menikah</option>
            </select>
          </div>
        </div>

        {/* Tanggal Lahir & Kode Pos */}
        <div className="grid grid-cols-2 gap-3">
          <div id="field-profile-dob" className={`p-2 rounded-xl transition-all ${getFieldClass('dateOfBirth')}`}>
            <label className="block text-xs font-medium text-foreground mb-1.5">Tanggal Lahir</label>
            <input
              type="date"
              value={config.dateOfBirth || ''}
              onChange={(e) => onChangeConfig({ ...config, dateOfBirth: e.target.value })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Untuk pertanyaan umur/DOB</p>
          </div>
          <div id="field-profile-postal" className={`p-2 rounded-xl transition-all ${getFieldClass('postalCode')}`}>
            <label className="block text-xs font-medium text-foreground mb-1.5">Kode Pos Domisili</label>
            <input
              type="text"
              value={config.postalCode || ''}
              onChange={(e) => onChangeConfig({ ...config, postalCode: e.target.value })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
              placeholder="60235"
              maxLength={10}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Untuk pertanyaan zip/postal code</p>
          </div>
        </div>

        {/* Gaji Bulanan */}
        <div id="field-profile-salary" className={`p-2 rounded-xl transition-all ${getFieldClass('expectedSalary')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Gaji Bulanan yang Diharapkan (IDR)</label>
              {renderAiBadge('expectedSalary')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="number"
            value={config.expectedSalary || ''}
            onChange={(e) => onChangeConfig({ ...config, expectedSalary: Number(e.target.value) })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs tabular-nums"
            placeholder="8000000"
          />
        </div>

        {/* Pengalaman Kerja */}
        <div id="field-profile-experience" className={`p-2 rounded-xl transition-all ${getFieldClass('yearsOfExperience')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Pengalaman Kerja (Tahun)</label>
              {renderAiBadge('yearsOfExperience')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="number"
            value={config.yearsOfExperience || 0}
            onChange={(e) => onChangeConfig({ ...config, yearsOfExperience: Number(e.target.value) })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs tabular-nums"
          />
        </div>

        {/* Pendidikan Terakhir */}
        <div id="field-profile-education" className={`p-2 rounded-xl transition-all ${getFieldClass('educationLevel')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Pendidikan Terakhir</label>
              {renderAiBadge('educationLevel')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <select
            value={config.educationLevel || 'Sarjana (S1)'}
            onChange={(e) => onChangeConfig({ ...config, educationLevel: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
          >
            <option value="SMA / SMK">SMA / SMK</option>
            <option value="Diploma (D3)">Diploma (D3)</option>
            <option value="Sarjana (S1)">Sarjana (S1)</option>
            <option value="Magister (S2)">Magister (S2)</option>
            <option value="Doktor (S3)">Doktor (S3)</option>
          </select>
        </div>

        {/* IPK Terakhir */}
        <div className={`p-2 rounded-xl transition-all ${getFieldClass('gpa')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">IPK Terakhir</label>
              {renderAiBadge('gpa')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="text"
            value={config.gpa || ''}
            onChange={(e) => onChangeConfig({ ...config, gpa: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs tabular-nums"
            placeholder="3.75"
          />
        </div>

        {/* Periode Pemberitahuan */}
        <div className={`p-2 rounded-xl transition-all ${getFieldClass('noticePeriod')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Periode Pemberitahuan (Notice Period)</label>
              {renderAiBadge('noticePeriod')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <select
            value={config.noticePeriod || 'Immediately'}
            onChange={(e) => onChangeConfig({ ...config, noticePeriod: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
          >
            <option value="Immediately">Segera (Immediately)</option>
            <option value="1 week">1 Minggu</option>
            <option value="2 weeks">2 Minggu</option>
            <option value="1 month">1 Bulan</option>
            <option value="2 months">2 Bulan</option>
          </select>
        </div>

        {/* Domisili / Kota */}
        <div id="field-profile-domicile" className={`p-2 rounded-xl transition-all ${getFieldClass('domicile')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Domisili / Kota</label>
              {renderAiBadge('domicile')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="text"
            value={config.domicile || ''}
            onChange={(e) => onChangeConfig({ ...config, domicile: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="Gresik, Surabaya, atau Jakarta"
          />
        </div>

        {/* Alamat Lengkap */}
        <div className={`p-2 rounded-xl transition-all ${getFieldClass('address')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Alamat Lengkap / Jalan</label>
              {renderAiBadge('address')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="text"
            value={config.address || ''}
            onChange={(e) => onChangeConfig({ ...config, address: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="Desa Banjaran RT 03 RW 03, Wringinanom, Gresik"
          />
        </div>

        {/* Link Portofolio */}
        <div id="field-profile-portfolio" className={`p-2 rounded-xl transition-all ${getFieldClass('portfolioUrl')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Link Portofolio</label>
              {renderAiBadge('portfolioUrl')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="text"
            value={config.portfolioUrl || ''}
            onChange={(e) => onChangeConfig({ ...config, portfolioUrl: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="https://..."
          />
        </div>

        {/* Link LinkedIn */}
        <div id="field-profile-linkedin" className={`p-2 rounded-xl transition-all ${getFieldClass('linkedinUrl')}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-medium text-foreground">Link LinkedIn</label>
              {renderAiBadge('linkedinUrl')}
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              Opsional
            </span>
          </div>
          <input
            type="text"
            value={config.linkedinUrl || ''}
            onChange={(e) => onChangeConfig({ ...config, linkedinUrl: e.target.value })}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>

      {/* Daftar Keahlian / Skills */}
      <div id="field-profile-skills" className={`p-2 rounded-xl transition-all ${getFieldClass('skills')}`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <label className="block text-xs font-medium text-foreground">
              Daftar Keahlian &amp; Alat Kerja (Pisahkan dengan koma)
            </label>
            {renderAiBadge('skills')}
          </div>
          <span className="text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
            Wajib
          </span>
        </div>
        <textarea
          rows={4}
          required
          value={config.skills || ''}
          onChange={(e) => onChangeConfig({ ...config, skills: e.target.value })}
          className="w-full bg-background border border-input rounded-md p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition leading-relaxed font-mono shadow-xs"
          placeholder="React, TypeScript, Next.js, Node.js, Express, PostgreSQL, Git"
        />
      </div>

      {/* EEO & Otorisasi Kerja Card */}
      <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <div>
            <div className="text-xs font-semibold text-foreground">Otorisasi Kerja &amp; EEO</div>
            <p className="text-[11px] text-muted-foreground">Pertanyaan standar yang sering muncul di form lamaran LinkedIn/Indeed.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Citizenship */}
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1.5">Status Kewarganegaraan</label>
            <select
              value={config.citizenshipStatus || 'WNI'}
              onChange={(e) => onChangeConfig({ ...config, citizenshipStatus: e.target.value })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            >
              <option value="WNI">WNI (Warga Negara Indonesia)</option>
              <option value="permanent_resident">Penduduk Tetap / PR</option>
              <option value="work_visa">Visa Kerja Aktif</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          {/* Visa Required */}
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1.5">Butuh Sponsor Visa?</label>
            <div className="flex items-center gap-3 p-2.5 rounded-md border border-input bg-background shadow-xs">
              <input
                type="checkbox"
                id="visaRequired"
                checked={config.visaRequired ?? false}
                onChange={(e) => onChangeConfig({ ...config, visaRequired: e.target.checked })}
                className="w-4 h-4 rounded border-input text-brand focus:ring-0 cursor-pointer"
              />
              <label htmlFor="visaRequired" className="text-xs text-muted-foreground cursor-pointer select-none">
                Ya, saya membutuhkan sponsorship visa
              </label>
            </div>
          </div>

          {/* Disability */}
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1.5">Status Disabilitas</label>
            <select
              value={config.disabilityStatus || 'prefer_not_to_say'}
              onChange={(e) => onChangeConfig({ ...config, disabilityStatus: e.target.value as any })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            >
              <option value="prefer_not_to_say">Tidak Ingin Menjawab</option>
              <option value="no">Tidak memiliki disabilitas</option>
              <option value="yes">Memiliki disabilitas</option>
            </select>
          </div>

          {/* Veteran */}
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1.5">Status Veteran</label>
            <select
              value={config.veteranStatus || 'prefer_not_to_say'}
              onChange={(e) => onChangeConfig({ ...config, veteranStatus: e.target.value as any })}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition shadow-xs"
            >
              <option value="prefer_not_to_say">Tidak Ingin Menjawab</option>
              <option value="no">Bukan Veteran</option>
              <option value="yes">Veteran / TNI/Polri Purnawirawan</option>
            </select>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand shrink-0" />
          <span>Data ini digunakan oleh bot untuk menjawab pertanyaan skrining otomatis di <b className="text-foreground">LinkedIn Easy Apply</b> dan <b className="text-foreground">Indeed</b>.</span>
        </p>
      </div>
    </div>
  );
};
