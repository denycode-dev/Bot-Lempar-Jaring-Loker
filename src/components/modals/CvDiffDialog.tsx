'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  AlertCircle,
  Copy,
  HelpCircle,
  ShieldCheck,
  Banknote,
  Clock,
  MapPin,
  CheckCheck,
  Edit3,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export interface DiffItem {
  field: string;
  label: string;
  oldVal: string;
  newVal: string;
  willChange: boolean;
}

export interface ScreeningQuestionItem {
  questionText: string;
  normalizedQuestion: string;
  answerText: string;
  category: 'experience' | 'salary' | 'availability' | 'skills' | 'general' | 'education';
  matchType?: 'exact' | 'keyword';
  confidenceScore?: string;
}

interface CvDiffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cvFileName?: string;
  cvExtractedText?: string;
  cvAnalyzedAt?: string;
  pendingParsedCv: any;
  currentProfile: any;
  pendingDiffList: DiffItem[];
  missingFields?: string[];
  screeningQuestions?: ScreeningQuestionItem[];
  honestyNotes?: string[];
  onConfirm: (finalProfile: any, selectedQuestions: ScreeningQuestionItem[]) => Promise<void>;
}

export function CvDiffDialog({
  isOpen,
  onClose,
  cvFileName,
  cvExtractedText,
  cvAnalyzedAt,
  pendingParsedCv,
  currentProfile,
  pendingDiffList,
  missingFields = [],
  screeningQuestions = [],
  honestyNotes = [],
  onConfirm,
}: CvDiffDialogProps) {
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'diff' | 'screening' | 'raw'>('diff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Working profile state containing extracted fields + user edits in modal
  const [workingProfile, setWorkingProfile] = useState<Record<string, any>>(() => {
    return {
      ...currentProfile,
      ...pendingParsedCv,
      expectedSalary: pendingParsedCv?.expectedSalary || currentProfile?.expectedSalary || '',
      noticePeriod: pendingParsedCv?.noticePeriod || currentProfile?.noticePeriod || 'Immediately',
      skills: Array.isArray(pendingParsedCv?.skills)
        ? pendingParsedCv.skills.join(', ')
        : (pendingParsedCv?.skills || currentProfile?.skills || ''),
    };
  });

  // Selected diff fields to apply to profile
  const [selectedDiffFields, setSelectedDiffFields] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    pendingDiffList.forEach((d) => {
      if (d.willChange && d.newVal) initial.add(d.field);
    });
    // Auto-select salary and notice period if provided
    if (pendingParsedCv?.expectedSalary || currentProfile?.expectedSalary) initial.add('expectedSalary');
    if (pendingParsedCv?.noticePeriod || currentProfile?.noticePeriod) initial.add('noticePeriod');
    return initial;
  });

  // Editable screening questions bank
  const [editableQuestions, setEditableQuestions] = useState<ScreeningQuestionItem[]>(() => {
    return screeningQuestions.map((q) => ({ ...q }));
  });

  // Selected screening question indices
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState<Set<number>>(() => {
    return new Set(screeningQuestions.map((_, idx) => idx));
  });

  // Category filter for screening questions
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>('all');

  // Handle manual input for missing fields (e.g. salary, notice period, address)
  const handleFieldChange = (field: string, value: any) => {
    setWorkingProfile((prev) => {
      const updated = { ...prev, [field]: value };

      // Dynamically update screening questions if salary or notice period is changed
      if (field === 'expectedSalary' && value) {
        setEditableQuestions((prevQuestions) =>
          prevQuestions.map((q) => {
            if (q.category === 'salary' || q.questionText.toLowerCase().includes('gaji')) {
              return {
                ...q,
                answerText: `Rp ${Number(value).toLocaleString('id-ID')}`,
              };
            }
            return q;
          })
        );
      } else if (field === 'noticePeriod' && value) {
        setEditableQuestions((prevQuestions) =>
          prevQuestions.map((q) => {
            if (q.category === 'availability' || q.questionText.toLowerCase().includes('mulai')) {
              return {
                ...q,
                answerText: `${value}.`,
              };
            }
            return q;
          })
        );
      }

      return updated;
    });

    // Automatically mark the field as selected to be applied
    setSelectedDiffFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  };

  // Filtered screening questions list
  const filteredQuestions = useMemo(() => {
    if (questionCategoryFilter === 'all') return editableQuestions;
    return editableQuestions.filter((q) => q.category === questionCategoryFilter);
  }, [editableQuestions, questionCategoryFilter]);

  // Handle submit / save
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build final profile with only selected fields
      const finalProfile: Record<string, any> = { ...currentProfile };

      selectedDiffFields.forEach((fieldKey) => {
        if (workingProfile[fieldKey] !== undefined) {
          finalProfile[fieldKey] = workingProfile[fieldKey];
        }
      });

      // Filter selected screening questions
      const finalQuestions = editableQuestions.filter((_, idx) =>
        selectedQuestionIndices.has(idx)
      );

      await onConfirm(finalProfile, finalQuestions);
      onClose();
    } catch (err: any) {
      toast.error('Gagal menerapkan perubahan: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allQuestionsSelected =
    editableQuestions.length > 0 && selectedQuestionIndices.size === editableQuestions.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border">
        {/* Header */}
        <DialogHeader className="p-5 md:p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base md:text-lg font-semibold text-foreground">
                  Pratinjau Ekstraksi AI &amp; Bank Soal Kuesioner
                </DialogTitle>
                {cvFileName && (
                  <Badge variant="outline" className="text-[10px] text-brand border-brand/30">
                    {cvFileName}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                AI telah memverifikasi fakta CV secara jujur, mendeteksi kelengkapan data, dan menyusun jawaban Bank Soal Screening.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-border shrink-0 text-xs bg-card overflow-x-auto">
          <Button
            type="button"
            variant={activeTab === 'diff' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => startTransition(() => setActiveTab('diff'))}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Formulir &amp; Input Data</span>
            {selectedDiffFields.size > 0 && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 bg-background/80">
                {selectedDiffFields.size}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={activeTab === 'screening' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => startTransition(() => setActiveTab('screening'))}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Bank Soal Screening</span>
            {editableQuestions.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 bg-background/80">
                {selectedQuestionIndices.size}/{editableQuestions.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={activeTab === 'raw' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => startTransition(() => setActiveTab('raw'))}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Teks Mentah CV</span>
          </Button>
        </div>

        {/* Modal Body */}
        <ScrollArea className="flex-1 px-5 md:px-6 py-4 max-h-[62vh]">
          {activeTab === 'diff' && (
            <div className="space-y-4">
              {/* Honesty Status Banner */}
              <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">
                      Pengecekan AI Berbasis Fakta CV (Zero Hallucination)
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {honestyNotes[0] || 'Seluruh data identitas, pendidikan, dan keahlian diambil langsung dari teks CV tanpa rekayasa.'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-brand border-brand/30 shrink-0 self-start sm:self-auto">
                  Terverifikasi Dokumen
                </Badge>
              </div>

              {/* Missing Fields Quick Manual Input Banner */}
              {missingFields.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-amber-700 dark:text-amber-300">
                        Informasi yang Belum Ada di CV — Lengkapi Langsung di Bawah Ini:
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Karena tidak ditemukan di CV, Anda dapat mengisinya secara manual sekarang agar profil dan jawaban Bank Soal terisi akurat.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Expected Salary Input */}
                    <div className="space-y-1 bg-background/80 p-2.5 rounded-lg border border-border/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                          <Banknote className="h-3.5 w-3.5 text-brand" />
                          <span>Ekspektasi Gaji Bulanan (IDR)</span>
                        </label>
                        {workingProfile.expectedSalary ? (
                          <span className="text-[10px] text-brand font-mono font-medium">
                            Rp {Number(workingProfile.expectedSalary).toLocaleString('id-ID')}
                          </span>
                        ) : null}
                      </div>
                      <Input
                        type="number"
                        value={workingProfile.expectedSalary || ''}
                        onChange={(e) => handleFieldChange('expectedSalary', e.target.value)}
                        placeholder="Contoh: 8000000"
                        className="text-xs h-8"
                      />
                    </div>

                    {/* Notice Period Input */}
                    <div className="space-y-1 bg-background/80 p-2.5 rounded-lg border border-border/80">
                      <label className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand" />
                        <span>Ketersediaan Mulai Bekerja (Notice Period)</span>
                      </label>
                      <Input
                        value={workingProfile.noticePeriod || ''}
                        onChange={(e) => handleFieldChange('noticePeriod', e.target.value)}
                        placeholder="Immediately / 1 Bulan / 2 Minggu"
                        className="text-xs h-8"
                      />
                    </div>

                    {/* Domicile / Address if missing */}
                    {missingFields.includes('domicile') && (
                      <div className="space-y-1 bg-background/80 p-2.5 rounded-lg border border-border/80 sm:col-span-2">
                        <label className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-brand" />
                          <span>Kota Domisili / Alamat Tempat Tinggal</span>
                        </label>
                        <Input
                          value={workingProfile.domicile || workingProfile.address || ''}
                          onChange={(e) => handleFieldChange('domicile', e.target.value)}
                          placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                          className="text-xs h-8"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Diffs & Profile Fields Table */}
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none">
                    <Checkbox
                      checked={pendingDiffList.length > 0 && selectedDiffFields.size >= pendingDiffList.filter(d => d.newVal).length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const all = new Set<string>();
                          pendingDiffList.forEach((d) => {
                            if (d.newVal) all.add(d.field);
                          });
                          all.add('expectedSalary');
                          all.add('noticePeriod');
                          setSelectedDiffFields(all);
                        } else {
                          setSelectedDiffFields(new Set());
                        }
                      }}
                    />
                    <span>Pilih semua yang akan diterapkan</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-brand">{selectedDiffFields.size}</span>
                    <span>kolom dipilih untuk disimpan</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="p-3 w-10 text-center">Pilih</th>
                        <th className="p-3">Nama Kolom</th>
                        <th className="p-3 w-1/3">Nilai Profil Saat Ini</th>
                        <th className="p-3 w-1/3">Nilai dari CV / Input Manual</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pendingDiffList.map((item) => {
                        const isSelected = selectedDiffFields.has(item.field);
                        const currentVal = workingProfile[item.field] !== undefined ? String(workingProfile[item.field]) : item.newVal;

                        return (
                          <tr
                            key={item.field}
                            onClick={() => {
                              setSelectedDiffFields((prev) => {
                                const next = new Set(prev);
                                if (next.has(item.field)) {
                                  next.delete(item.field);
                                } else {
                                  next.add(item.field);
                                }
                                return next;
                              });
                            }}
                            className={`transition-colors cursor-pointer hover:bg-muted/30 ${
                              isSelected ? 'bg-brand/5' : 'opacity-75'
                            }`}
                          >
                            <td className="p-3 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {
                                  setSelectedDiffFields((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(item.field)) {
                                      next.delete(item.field);
                                    } else {
                                      next.add(item.field);
                                    }
                                    return next;
                                  });
                                }}
                              />
                            </td>
                            <td className="p-3 font-medium text-foreground align-top">
                              {item.label}
                            </td>
                            <td className="p-3 text-muted-foreground font-mono text-[11px] align-top break-all">
                              {item.oldVal || <span className="italic text-muted-foreground/60">(Kosong)</span>}
                            </td>
                            <td className="p-3 font-mono text-[11px] align-top break-all">
                              {currentVal ? (
                                <span className={isSelected ? 'text-brand font-semibold' : 'text-muted-foreground line-through'}>
                                  {currentVal}
                                </span>
                              ) : (
                                <span className="italic text-muted-foreground/60">(Belum Diisi)</span>
                              )}
                            </td>
                            <td className="p-3 text-center align-middle whitespace-nowrap">
                              {isSelected ? (
                                <Badge variant="outline" className="text-[10px] text-brand border-brand/30 bg-brand/10">
                                  Akan Diterapkan
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] line-through">
                                  Dilewati
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'screening' && (
            <div className="space-y-4">
              {/* Screening Intro Banner */}
              <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">
                      Jawaban Kuesioner Screening Otomatis (PostgreSQL Screening Bank)
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Jawaban berikut disusun berdasarkan profil Anda. Bot akan langsung menggunakannya saat melamar kerja. Anda dapat mengedit teks jawaban secara bebas sebelum disimpan.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      if (allQuestionsSelected) {
                        setSelectedQuestionIndices(new Set());
                      } else {
                        setSelectedQuestionIndices(new Set(editableQuestions.map((_, i) => i)));
                      }
                    }}
                    className="text-xs h-7"
                  >
                    {allQuestionsSelected ? 'Batal Semua' : 'Pilih Semua'}
                  </Button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'Semua Kategori' },
                  { id: 'experience', label: 'Pengalaman' },
                  { id: 'salary', label: 'Gaji' },
                  { id: 'availability', label: 'Ketersediaan' },
                  { id: 'skills', label: 'Keahlian' },
                  { id: 'general', label: 'Umum & Legalitas' },
                  { id: 'education', label: 'Pendidikan' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setQuestionCategoryFilter(cat.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      questionCategoryFilter === cat.id
                        ? 'bg-brand text-brand-foreground border-brand'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {filteredQuestions.map((q, idx) => {
                  const realIndex = editableQuestions.indexOf(q);
                  const isChecked = selectedQuestionIndices.has(realIndex);

                  return (
                    <div
                      key={q.normalizedQuestion || idx}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        isChecked
                          ? 'border-brand/40 bg-card shadow-xs'
                          : 'border-border/60 bg-muted/20 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            setSelectedQuestionIndices((prev) => {
                              const next = new Set(prev);
                              if (checked) {
                                next.add(realIndex);
                              } else {
                                next.delete(realIndex);
                              }
                              return next;
                            });
                          }}
                          className="mt-1 shrink-0"
                        />

                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {q.questionText}
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-border">
                              {q.category}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1 font-medium text-foreground">
                                <Edit3 className="w-3 h-3 text-brand" /> Jawaban Bot (Dapat Diedit):
                              </span>
                              <span className="text-[10px] text-brand">Confidence 1.00</span>
                            </div>
                            <Textarea
                              value={q.answerText}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setEditableQuestions((prev) =>
                                  prev.map((item, i) => (i === realIndex ? { ...item, answerText: newText } : item))
                                );
                              }}
                              className="text-xs min-h-[56px] bg-background resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Seluruh isi teks hasil ekstraksi digital CV ({cvExtractedText?.length || 0} karakter):</span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    if (cvExtractedText) {
                      navigator.clipboard.writeText(cvExtractedText);
                      toast.success('Teks CV disalin ke clipboard!');
                    }
                  }}
                  className="gap-1 h-7 text-xs"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin Teks</span>
                </Button>
              </div>
              <pre className="p-4 rounded-xl bg-muted/40 border border-border text-foreground font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[420px] select-all">
                {cvExtractedText || 'Teks CV belum dimuat atau kosong.'}
              </pre>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground self-start sm:self-center">
            {cvAnalyzedAt ? `Dianalisis: ${cvAnalyzedAt}` : ''}
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="text-xs h-9">
              Tutup
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || (selectedDiffFields.size === 0 && selectedQuestionIndices.size === 0)}
              className="text-xs h-9 bg-brand hover:bg-brand-hover text-brand-foreground gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? 'Menyimpan ke Database...'
                  : `Terapkan Profil & Simpan Bank Soal (${selectedQuestionIndices.size} Soal)`}
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
