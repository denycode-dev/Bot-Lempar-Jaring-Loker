'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  UserCheck,
  Upload,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { CvDiffDialog, DiffItem, ScreeningQuestionItem } from '@/components/modals/CvDiffDialog';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    skills: '',
    educationLevel: 'Sarjana (S1)',
    gpa: '3.50',
    yearsOfExperience: 2,
    expectedSalary: 8000000,
    noticePeriod: 'Immediately',
    cvFileName: '',
    cvExtractedText: '',
    cvAnalyzedAt: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [pendingParsedCv, setPendingParsedCv] = useState<any>(null);
  const [pendingDiffList, setPendingDiffList] = useState<DiffItem[]>([]);
  const [pendingMissingFields, setPendingMissingFields] = useState<string[]>([]);
  const [pendingScreeningQuestions, setPendingScreeningQuestions] = useState<ScreeningQuestionItem[]>([]);
  const [pendingHonestyNotes, setPendingHonestyNotes] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.config) {
        setProfile((prev) => ({
          ...prev,
          fullName: data.config.fullName || '',
          email: data.config.email || '',
          phoneNumber: data.config.phoneNumber || '',
          address: data.config.address || '',
          linkedinUrl: data.config.linkedinUrl || '',
          githubUrl: data.config.githubUrl || '',
          portfolioUrl: data.config.portfolioUrl || '',
          skills: data.config.skills || '',
          educationLevel: data.config.educationLevel || 'Sarjana (S1)',
          gpa: data.config.gpa || '3.50',
          yearsOfExperience: data.config.yearsOfExperience || 2,
          expectedSalary: data.config.expectedSalary || 8000000,
          noticePeriod: data.config.noticePeriod || 'Immediately',
          cvFileName: data.config.cvFileName || '',
          cvExtractedText: data.config.cvExtractedText || '',
          cvAnalyzedAt: data.config.cvAnalyzedAt || '',
        }));
      }
    } catch (err: any) {
      toast.error('Gagal memuat profil: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profil pelamar berhasil disimpan ke PostgreSQL!');
      } else {
        toast.error(data.error || 'Gagal menyimpan profil');
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat menyimpan profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['.pdf', '.docx'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Hanya file .pdf dan .docx yang diperbolehkan');
      return;
    }

    setIsUploadingCv(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cv', file);

    try {
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`CV ${file.name} berhasil diunggah & diekstrak!`);
        setProfile((prev) => ({
          ...prev,
          cvFileName: file.name,
          cvExtractedText: data.extractedText || '',
          cvAnalyzedAt: new Date().toISOString(),
        }));

        // AI parsed profile, missing fields, and screening questions
        const parsedData = data.parsedCv || data.aiParsed;
        if (parsedData) {
          setPendingParsedCv(parsedData);
          setPendingMissingFields(data.missingFields || []);
          setPendingScreeningQuestions(data.screeningQuestions || []);
          setPendingHonestyNotes(data.honestyNotes || []);

          const diffs: DiffItem[] = [
            {
              field: 'fullName',
              label: 'Nama Lengkap',
              oldVal: profile.fullName,
              newVal: parsedData.fullName || '',
              willChange: Boolean(parsedData.fullName && parsedData.fullName !== profile.fullName),
            },
            {
              field: 'email',
              label: 'Email Aktif',
              oldVal: profile.email,
              newVal: parsedData.email || '',
              willChange: Boolean(parsedData.email && parsedData.email !== profile.email),
            },
            {
              field: 'phoneNumber',
              label: 'Nomor Telepon / WA',
              oldVal: profile.phoneNumber,
              newVal: parsedData.phoneNumber || '',
              willChange: Boolean(parsedData.phoneNumber && parsedData.phoneNumber !== profile.phoneNumber),
            },
            {
              field: 'address',
              label: 'Alamat / Domisili',
              oldVal: profile.address,
              newVal: parsedData.address || parsedData.domicile || '',
              willChange: Boolean((parsedData.address || parsedData.domicile) && (parsedData.address || parsedData.domicile) !== profile.address),
            },
            {
              field: 'educationLevel',
              label: 'Pendidikan Terakhir',
              oldVal: profile.educationLevel,
              newVal: parsedData.educationLevel || '',
              willChange: Boolean(parsedData.educationLevel && parsedData.educationLevel !== profile.educationLevel),
            },
            {
              field: 'gpa',
              label: 'IPK / GPA',
              oldVal: profile.gpa,
              newVal: parsedData.gpa ? String(parsedData.gpa) : '',
              willChange: Boolean(parsedData.gpa && String(parsedData.gpa) !== profile.gpa),
            },
            {
              field: 'yearsOfExperience',
              label: 'Pengalaman Kerja (Tahun)',
              oldVal: String(profile.yearsOfExperience),
              newVal: parsedData.yearsOfExperience !== undefined ? String(parsedData.yearsOfExperience) : '',
              willChange: Boolean(parsedData.yearsOfExperience !== undefined && Number(parsedData.yearsOfExperience) !== profile.yearsOfExperience),
            },
            {
              field: 'expectedSalary',
              label: 'Ekspektasi Gaji Bulanan (IDR)',
              oldVal: profile.expectedSalary ? `Rp ${Number(profile.expectedSalary).toLocaleString('id-ID')}` : '',
              newVal: parsedData.expectedSalary ? `Rp ${Number(parsedData.expectedSalary).toLocaleString('id-ID')}` : '',
              willChange: Boolean(parsedData.expectedSalary && Number(parsedData.expectedSalary) !== profile.expectedSalary),
            },
            {
              field: 'noticePeriod',
              label: 'Ketersediaan (Notice Period)',
              oldVal: profile.noticePeriod,
              newVal: parsedData.noticePeriod || '',
              willChange: Boolean(parsedData.noticePeriod && parsedData.noticePeriod !== profile.noticePeriod),
            },
            {
              field: 'skills',
              label: 'Daftar Keahlian Utama',
              oldVal: profile.skills,
              newVal: Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : (parsedData.skills || ''),
              willChange: Boolean(parsedData.skills),
            },
            {
              field: 'linkedinUrl',
              label: 'LinkedIn URL',
              oldVal: profile.linkedinUrl,
              newVal: parsedData.linkedinUrl || '',
              willChange: Boolean(parsedData.linkedinUrl && parsedData.linkedinUrl !== profile.linkedinUrl),
            },
            {
              field: 'githubUrl',
              label: 'GitHub URL',
              oldVal: profile.githubUrl,
              newVal: parsedData.githubUrl || '',
              willChange: Boolean(parsedData.githubUrl && parsedData.githubUrl !== profile.githubUrl),
            },
            {
              field: 'portfolioUrl',
              label: 'Portfolio URL',
              oldVal: profile.portfolioUrl,
              newVal: parsedData.portfolioUrl || '',
              willChange: Boolean(parsedData.portfolioUrl && parsedData.portfolioUrl !== profile.portfolioUrl),
            },
          ];

          setPendingDiffList(diffs);
          setIsDiffModalOpen(true);
        }
      } else {
        toast.error(data.error || 'Gagal mengekstrak teks CV');
      }
    } catch (err: any) {
      toast.error('Gagal mengunggah CV: ' + err.message);
    } finally {
      setIsUploadingCv(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmCvDiff = async (finalProfile: any, selectedQuestions: ScreeningQuestionItem[]) => {
    const res = await fetch('/api/upload-cv/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: finalProfile,
        screeningQuestions: selectedQuestions,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setProfile((prev) => ({
        ...prev,
        ...finalProfile,
      }));
      setIsDiffModalOpen(false);
      toast.success(data.message || 'Profil dan Bank Soal Kuesioner berhasil disimpan!');
    } else {
      throw new Error(data.error || 'Gagal menyimpan profil dan bank soal');
    }
  };

  return (
    <div className="space-y-6">
      {/* CV Document Upload Card */}
      <Card className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-semibold text-foreground">
                Dokumen Resume / Curriculum Vitae
              </h2>
              <p className="text-xs text-muted-foreground">
                Unggah CV utama (.pdf atau .docx) untuk diekstrak dan dianalisis AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCvUpload}
              accept=".pdf,.docx"
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCv}
              className="text-xs h-9 bg-brand hover:bg-brand-hover text-brand-foreground gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingCv ? 'Mengekstrak Teks...' : 'Unggah File CV Baru'}</span>
            </Button>
          </div>
        </div>

        {profile.cvFileName ? (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Check className="w-4 h-4 text-success shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{profile.cvFileName}</p>
                <p className="text-[11px] text-muted-foreground">
                  Teks berhasil diekstrak ({profile.cvExtractedText.length} karakter).
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] text-brand border-brand/30 shrink-0">
              Terverifikasi di DB
            </Badge>
          </div>
        ) : (
          <div className="py-6 text-center border border-dashed border-border rounded-lg text-xs text-muted-foreground">
            Belum ada file CV yang diunggah. Unggah file PDF Anda agar bot dapat menggunakannya saat melamar.
          </div>
        )}
      </Card>

      {/* Main Profile Form Card */}
      <Card className="p-6 md:p-8 rounded-xl border border-border bg-card shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-semibold text-foreground">
                Data Identitas &amp; Profil Pelamar
              </h2>
              <p className="text-xs text-muted-foreground">
                Data ini menjadi rujukan utama AI dalam menjawab formulir screening lowongan
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="text-xs h-9 bg-brand hover:bg-brand-hover text-brand-foreground gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Nama Lengkap *</label>
            <Input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="Contoh: Yoga Pratama"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email Aktif *</label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="email@example.com"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Nomor Telepon / WhatsApp *</label>
            <Input
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              placeholder="081234567890"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Alamat / Domisili *</label>
            <Input
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Jakarta Selatan, DKI Jakarta"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Tingkat Pendidikan Terakhir</label>
            <Input
              value={profile.educationLevel}
              onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
              placeholder="Sarjana (S1)"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">IPK / GPA</label>
            <Input
              value={profile.gpa}
              onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
              placeholder="3.50"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Ekspektasi Gaji Bulanan (IDR)</label>
            <Input
              type="number"
              value={profile.expectedSalary}
              onChange={(e) => setProfile({ ...profile, expectedSalary: Number(e.target.value) })}
              className="text-xs h-9 tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Ketersediaan Mulai Bekerja (Notice Period)</label>
            <Input
              value={profile.noticePeriod}
              onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
              placeholder="Immediately / 1 Bulan"
              className="text-xs h-9"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-foreground">Daftar Keahlian Utama (Pisahkan dengan koma) *</label>
            <Textarea
              value={profile.skills}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              placeholder="React, TypeScript, Next.js, Node.js, PostgreSQL, Tailwind CSS"
              className="text-xs min-h-[72px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">LinkedIn URL</label>
            <Input
              value={profile.linkedinUrl}
              onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">GitHub URL</label>
            <Input
              value={profile.githubUrl}
              onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
              placeholder="https://github.com/username"
              className="text-xs h-9"
            />
          </div>
        </div>
      </Card>

      {/* CV Diff Confirmation Modal */}
      {isDiffModalOpen ? (
        <CvDiffDialog
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          cvFileName={profile.cvFileName}
          cvExtractedText={profile.cvExtractedText}
          cvAnalyzedAt={profile.cvAnalyzedAt}
          pendingParsedCv={pendingParsedCv}
          currentProfile={profile}
          pendingDiffList={pendingDiffList}
          missingFields={pendingMissingFields}
          screeningQuestions={pendingScreeningQuestions}
          honestyNotes={pendingHonestyNotes}
          onConfirm={handleConfirmCvDiff}
        />
      ) : null}
    </div>
  );
}
