'use client';

import React from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Briefcase,
  Building2,
  GraduationCap,
  Layers,
  Activity,
  MessageSquare,
  UserCheck,
  Search,
} from 'lucide-react';
import { TalentCandidate } from '@/lib/talentTypes';
import { generateWhatsAppUrl, generateOsintContactUrl } from '@/lib/xraySearch';

interface CandidateDetailDialogProps {
  candidate: TalentCandidate | null;
  onClose: () => void;
}

export const CandidateDetailDialog: React.FC<CandidateDetailDialogProps> = ({
  candidate,
  onClose,
}) => {
  if (!candidate) return null;

  return (
    <Dialog open={Boolean(candidate)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="border-b border-subtle-theme pb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-bold text-main-theme">
                  {candidate.name}
                </DialogTitle>
                {candidate.isOpenToWork && (
                  <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>#OpenToWork</span>
                  </Badge>
                )}
                {candidate.availabilityStatus === 'immediate' && (
                  <Badge variant="outline" className="text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    Siap Kerja Segera
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-theme mt-0.5">
                {candidate.headline}
              </DialogDescription>
              <div className="flex items-center gap-1.5 text-xs text-muted-theme mt-1">
                <MapPin className="w-3 h-3 text-muted-theme" />
                <span>{candidate.location}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3 -mr-3 my-2 space-y-5">
          <div className="space-y-5 pr-1">
            {/* AI Forensic Summary */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-main-theme uppercase tracking-wider">
                    Hasil Background Check &amp; Integritas AI
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-theme">Skor Kredibilitas:</span>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    {candidate.aiHonestyScore ?? 90}/100
                  </span>
                </div>
              </div>

              {candidate.tenureAnalysis && (
                <div className="p-3 rounded-xl card-theme border border-subtle-theme space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-main-theme">Analisis Stabilitas Karir (Tenure):</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">
                      {candidate.tenureAnalysis.stabilityRating}
                    </span>
                  </div>
                  <p className="text-muted-theme leading-relaxed text-[11px]">
                    {candidate.tenureAnalysis.notes}
                  </p>
                </div>
              )}

              {candidate.aiHonestyNotes && candidate.aiHonestyNotes.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-muted-theme uppercase block">
                    Catatan Verifikasi:
                  </span>
                  <ul className="space-y-1">
                    {candidate.aiHonestyNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-theme text-xs leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Target Pekerjaan (#OpenToWork Preferences) */}
            {candidate.openToWorkDetails && (
              <div className="p-4 rounded-2xl card-subtle-theme border border-subtle-theme space-y-2.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-main-theme uppercase tracking-wider">
                    Preferensi Pekerjaan (#OpenToWork)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {candidate.openToWorkDetails.positions && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-theme font-semibold uppercase block">
                        Posisi yang Diminati
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {candidate.openToWorkDetails.positions.map((pos, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px]">
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {candidate.openToWorkDetails.locations && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-theme font-semibold uppercase block">
                        Wilayah yang Bersedia
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {candidate.openToWorkDetails.locations.map((loc, i) => (
                          <span key={i} className="px-2 py-0.5 rounded card-theme border border-subtle-theme text-main-theme text-[11px]">
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {candidate.openToWorkDetails.startDate && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-theme font-semibold uppercase block">
                        Kesiapan Mulai
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        {candidate.openToWorkDetails.startDate}
                      </span>
                    </div>
                  )}

                  {candidate.openToWorkDetails.workplaceTypes && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-theme font-semibold uppercase block">
                        Sistem Kerja
                      </span>
                      <span className="text-muted-theme text-xs">
                        {candidate.openToWorkDetails.workplaceTypes.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Riwayat Pengalaman Kerja */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-main-theme uppercase tracking-wider">
                    Riwayat Pengalaman Kerja ({candidate.experiences?.length || 0})
                  </h4>
                </div>
                {candidate.experienceYears && (
                  <span className="text-xs text-muted-theme font-medium">
                    Total Masa Kerja: <strong>{candidate.experienceYears} Tahun</strong>
                  </span>
                )}
              </div>

              {candidate.experiences && candidate.experiences.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-primary/30 space-y-4 text-xs">
                  {candidate.experiences.map((exp, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-sm" />
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <span className="font-bold text-main-theme text-xs">{exp.title}</span>
                        <span className="text-[11px] font-mono text-primary font-medium">
                          {exp.duration}
                        </span>
                      </div>
                      <div className="text-muted-theme text-xs font-medium">{exp.company}</div>
                      {exp.description && (
                        <p className="text-muted-theme text-[11px] whitespace-pre-line leading-relaxed pt-0.5">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl card-subtle-theme border border-subtle-theme text-center text-xs text-muted-theme">
                  Riwayat detail belum terindeks. Gunakan tombol &quot;Bookmarklet Profil LinkedIn&quot; untuk mengekstrak seluruh riwayat kerja otomatis saat membuka tab LinkedIn kandidat.
                </div>
              )}
            </div>

            {/* Riwayat Pendidikan */}
            {candidate.education && candidate.education.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-main-theme uppercase tracking-wider">
                    Riwayat Pendidikan &amp; Pelatihan ({candidate.education.length})
                  </h4>
                </div>
                <div className="p-3.5 rounded-2xl card-subtle-theme border border-subtle-theme space-y-2.5 text-xs">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <span className="font-bold text-main-theme text-xs">{edu.school}</span>
                        {edu.period && (
                          <span className="text-[11px] font-mono text-muted-theme">{edu.period}</span>
                        )}
                      </div>
                      {edu.fieldOfStudy && (
                        <div className="text-muted-theme text-xs font-medium">
                          Jurusan: <strong className="text-main-theme">{edu.fieldOfStudy}</strong>
                        </div>
                      )}
                      {edu.activities && (
                        <p className="text-[11px] text-muted-theme italic pt-0.5">
                          Aktivitas &amp; Organisasi: {edu.activities}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keahlian Terverifikasi */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-main-theme uppercase tracking-wider">
                    Keahlian &amp; Tools ({candidate.skills.length})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg card-theme border border-subtle-theme text-main-theme text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Aktivitas & Minat Profesional */}
            {candidate.activityHighlights && candidate.activityHighlights.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-main-theme uppercase tracking-wider text-xs">
                      Aktivitas &amp; Minat Profesional (LinkedIn Feed)
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-theme">Repost &amp; Wawasan Industri</span>
                </div>
                <div className="space-y-2 pt-1">
                  {candidate.activityHighlights.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl card-theme border border-subtle-theme text-[11px] leading-relaxed text-muted-theme flex items-start gap-2 shadow-2xs">
                      <span className="text-blue-500 font-bold mt-0.5 shrink-0">💬</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t border-subtle-theme flex sm:justify-between items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {candidate.phone && /^\+?[0-9]{8,15}$/.test(candidate.phone.replace(/[\s-]/g, '')) ? (
              <Button
                type="button"
                size="sm"
                asChild
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shadow-sm"
              >
                <a
                  href={generateWhatsAppUrl(candidate.phone, candidate.name, 'Perusahaan Kami', candidate.headline)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Hubungi via WhatsApp ({candidate.phone})</span>
                </a>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                asChild
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5 shadow-sm"
              >
                <a href={candidate.profileUrl} target="_blank" rel="noreferrer">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Hubungi via LinkedIn / InMail</span>
                </a>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="text-xs gap-1.5"
              title="Cari jejak nomor kontak atau resume PDF kandidat di Google"
            >
              <a
                href={generateOsintContactUrl(candidate.name, candidate.location)}
                target="_blank"
                rel="noreferrer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari Jejak Kontak (OSINT)</span>
              </a>
            </Button>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
