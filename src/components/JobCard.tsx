'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building2, MapPin, Calendar, FileText, Banknote, Check, X, Clock, Minus } from 'lucide-react';

export interface QuestionAnswerItem {
  question: string;
  answer: string;
  type?: string;
}

export interface AppliedJobCard {
  company: string;
  title: string;
  platform: string;
  jobUrl: string;
  date: string;
  status: string;
  salary?: string;
  location?: string;
  workType?: string;
  questionsAndAnswers?: QuestionAnswerItem[];
}

const PLATFORM_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  glints: { bg: 'bg-green-500/15 border-green-500/30', text: 'text-green-500 dark:text-green-400', dot: 'bg-green-500' },
  linkedin: { bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-500 dark:text-blue-400', dot: 'bg-blue-500' },
  indeed: { bg: 'bg-purple-500/15 border-purple-500/30', text: 'text-purple-500 dark:text-purple-400', dot: 'bg-purple-500' },
  jobstreet: { bg: 'bg-orange-500/15 border-orange-500/30', text: 'text-orange-500 dark:text-orange-400', dot: 'bg-orange-500' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  applied: { bg: 'bg-brand/10 dark:bg-brand/20', text: 'text-brand', label: 'Dilamar', icon: Check },
  success: { bg: 'bg-brand/10 dark:bg-brand/20', text: 'text-brand', label: 'Dilamar', icon: Check },
  failed: { bg: 'bg-destructive/10 dark:bg-destructive/20', text: 'text-destructive', label: 'Gagal', icon: X },
  skipped: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Dilewati', icon: Minus },
  pending: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', label: 'Pending', icon: Clock },
};

export function formatJobDate(dateStr: string): string {
  if (!dateStr) return '–';
  const clean = dateStr.trim();

  const dmyMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2})[.:](\d{1,2}))?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? `${dmyMatch[4].padStart(2, '0')}:${(dmyMatch[5] || '00').padStart(2, '0')}` : '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = months[month] || `Bulan ${month + 1}`;
    return hour ? `${day} ${monthName} ${year}, ${hour}` : `${day} ${monthName} ${year}`;
  }

  try {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch {}

  return clean;
}

interface JobCardProps {
  job: AppliedJobCard;
  index: number;
  onViewDetail?: (job: AppliedJobCard) => void;
}

export default function JobCard({ job, index, onViewDetail }: JobCardProps) {
  const platformKey = job.platform?.toLowerCase() || 'glints';
  const platformStyle = PLATFORM_STYLES[platformKey] || PLATFORM_STYLES.glints;
  const statusKey = job.status?.toLowerCase() || 'applied';
  const statusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.applied;

  const qaCount = job.questionsAndAnswers?.length || 0;

  return (
    <Card
      className="group relative flex flex-col gap-3 p-4 border-border hover:border-brand/40 transition-colors duration-150 shadow-xs"
      style={{ animationDelay: `${(index % 12) * 30}ms` }}
    >
      {/* Header: Company + Platform Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate leading-tight">
              {job.company || 'Perusahaan'}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium border ${platformStyle.bg} ${platformStyle.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${platformStyle.dot}`} />
          {job.platform || 'Platform'}
        </Badge>
      </div>

      {/* Job Title */}
      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
        {job.title || 'Posisi Tidak Diketahui'}
      </h3>

      {/* Meta Info */}
      <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
        {job.location && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        {job.salary && job.salary !== 'Gaji Tidak Ditampilkan' && (
          <div className="flex items-center gap-1.5 truncate text-emerald-600 dark:text-emerald-400">
            <Banknote className="w-3 h-3 shrink-0" />
            <span className="truncate tabular-nums">{job.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 tabular-nums">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{formatJobDate(job.date)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border mt-auto gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {React.createElement(statusStyle.icon, { className: 'w-2.5 h-2.5 shrink-0' })}
          <span>{statusStyle.label}</span>
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          {onViewDetail && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onViewDetail(job)}
              className="h-6 px-2 text-[10px] font-medium rounded-md border-border bg-secondary/50 hover:bg-secondary text-foreground gap-1"
              title="Lihat riwayat pertanyaan & jawaban bot"
            >
              <FileText className="w-3 h-3" />
              <span className="tabular-nums">{qaCount > 0 ? `${qaCount} Q&A` : 'Detail'}</span>
            </Button>
          )}

          {job.jobUrl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="h-6 px-2 text-[10px] font-medium rounded-md gap-1 text-muted-foreground hover:text-foreground"
            >
              <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                <span>Buka</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground/40">No URL</span>
          )}
        </div>
      </div>
    </Card>
  );
}
