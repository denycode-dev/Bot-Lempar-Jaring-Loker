'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Download,
  FileJson,
  RefreshCw,
  Briefcase,
  LayoutGrid,
  List,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  Check,
  X,
  Clock,
  Minus,
} from 'lucide-react';
import JobCard, { AppliedJobCard, formatJobDate } from '@/components/JobCard';

const PLATFORMS = ['Semua', 'Glints', 'LinkedIn', 'Indeed', 'Jobstreet'];
const STATUSES = ['Semua', 'Dilamar', 'Gagal', 'Dilewati'];
const PAGE_SIZE = 12;

const STATUS_FILTER_MAP: Record<string, string[]> = {
  Dilamar: ['applied', 'success'],
  Gagal: ['failed'],
  Dilewati: ['skipped'],
};

interface AppliedJobsViewProps {
  jobs: AppliedJobCard[];
  storageType?: 'sqlite' | 'json' | 'sheets';
  activeStorageInfo?: string;
  onRefresh: () => void;
  onExportCsv: () => void;
  onExportJson?: () => void;
  onSelectJob: (job: AppliedJobCard) => void;
  initialViewMode?: 'grid' | 'list' | 'table';
}

export const AppliedJobsView: React.FC<AppliedJobsViewProps> = ({
  jobs,
  storageType,
  activeStorageInfo,
  onRefresh,
  onExportCsv,
  onExportJson,
  onSelectJob,
  initialViewMode = 'grid',
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>(initialViewMode);
  const [page, setPage] = useState(1);

  // Stats summary
  const stats = useMemo(() => {
    const total = jobs.length;
    const byPlatform: Record<string, number> = {};
    let today = 0;
    const todayStr = new Date().toISOString().slice(0, 10);

    jobs.forEach((j) => {
      const p = j.platform?.toLowerCase() || 'lain';
      byPlatform[p] = (byPlatform[p] || 0) + 1;
      if (j.date?.startsWith(todayStr)) today++;
    });

    return { total, byPlatform, today };
  }, [jobs]);

  // Filtered + searched jobs
  const filtered = useMemo(() => {
    let result = [...jobs];

    if (platformFilter !== 'Semua') {
      result = result.filter((j) => j.platform?.toLowerCase() === platformFilter.toLowerCase());
    }

    if (statusFilter !== 'Semua') {
      const keys = STATUS_FILTER_MAP[statusFilter] || [];
      result = result.filter((j) => keys.includes(j.status?.toLowerCase() || ''));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) => j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return result;
  }, [jobs, platformFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <Card className="p-6 md:p-8 shadow-xs space-y-6 border-border">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-foreground">Riwayat Lamaran Terkirim</h2>
            {storageType && (
              <Badge variant="outline" className="text-[10px] gap-1 font-medium bg-brand/5 text-brand border-brand/20">
                <Database className="w-3 h-3" />
                <span>
                  {storageType === 'sqlite' ? 'SQLite DB' : storageType === 'json' ? 'JSON File' : 'Google Sheets'}
                </span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeStorageInfo || `Total ${jobs.length} lamaran tersimpan dan terpantau otomatis.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            disabled={jobs.length === 0}
            className="text-xs gap-1.5 h-8 rounded-md"
            title="Unduh seluruh data lamaran dalam format CSV"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>

          {onExportJson && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportJson}
              disabled={jobs.length === 0}
              className="text-xs gap-1.5 h-8 rounded-md"
              title="Unduh seluruh data lamaran dalam format JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export JSON</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-xs gap-1.5 h-8 rounded-md"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Lamaran', value: stats.total, color: 'text-brand', bg: 'bg-brand/5 border-brand/20' },
          { label: 'Hari Ini', value: stats.today, color: 'text-foreground', bg: 'bg-card border-border' },
          { label: 'LinkedIn', value: stats.byPlatform['linkedin'] || 0, color: 'text-foreground', bg: 'bg-card border-border' },
          { label: 'Glints', value: stats.byPlatform['glints'] || 0, color: 'text-foreground', bg: 'bg-card border-border' },
        ].map((stat) => (
          <div key={stat.label} className={`p-3.5 rounded-xl border ${stat.bg} flex flex-col gap-1 shadow-xs`}>
            <span className={`text-2xl font-semibold font-mono tabular-nums ${stat.color}`}>{stat.value}</span>
            <span className="text-[11px] text-muted-foreground font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filter and View Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-0 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari posisi atau perusahaan..."
            className="w-full pl-8 pr-4 py-2 text-xs rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition placeholder:text-muted-foreground shadow-xs"
          />
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-secondary/50 border border-border overflow-x-auto max-w-full">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleFilterChange(setPlatformFilter, p)}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-medium transition whitespace-nowrap ${
                platformFilter === p
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-secondary/50 border border-border">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleFilterChange(setStatusFilter, s)}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-medium transition whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-secondary/50 border border-border shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-sm transition ${
              viewMode === 'grid' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Tampilan Grid Kartu"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-sm transition ${
              viewMode === 'list' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Tampilan List Ringkas"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-sm transition ${
              viewMode === 'table' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Tampilan Tabel Data"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Result Count and Pagination Indicator */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Menampilkan <b className="text-foreground font-semibold tabular-nums">{filtered.length}</b> dari <b className="text-foreground font-semibold tabular-nums">{jobs.length}</b> lamaran
          {search && (
            <>
              {' '}· hasil pencarian &ldquo;<b className="text-brand">{search}</b>&rdquo;
            </>
          )}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="tabular-nums">Halaman {page} dari {totalPages}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-6 w-6 p-0 rounded-md"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-6 w-6 p-0 rounded-md"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="p-4 rounded-xl bg-muted/60 border border-border">
            <Briefcase className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Belum ada lamaran ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">
              {jobs.length === 0
                ? 'Jalankan bot untuk mulai melamar lowongan secara otomatis.'
                : 'Coba ubah filter atau kata kunci pencarian.'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((job, idx) => (
            <JobCard
              key={`${job.company}-${job.title}-${job.date}-${idx}`}
              job={job}
              index={idx}
              onViewDetail={onSelectJob}
            />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="flex flex-col gap-2">
          {paginated.map((job, idx) => {
            const qaCount = job.questionsAndAnswers?.length || 0;
            return (
              <div
                key={`${job.company}-${job.title}-${job.date}-${idx}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border bg-card hover:border-brand/40 transition-colors group shadow-xs"
              >
                <div className="w-8 h-8 shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                    {job.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate mt-0.5">
                    <span className="truncate">{job.company}</span>
                    {job.location && <span>· {job.location}</span>}
                    {job.salary && job.salary !== 'Gaji Tidak Ditampilkan' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">· {job.salary}</span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-medium shrink-0">
                  {job.platform}
                </Badge>
                <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{formatJobDate(job.date)}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectJob(job)}
                  className="h-7 text-[10px] px-2.5 font-medium rounded-md shrink-0"
                >
                  <span className="tabular-nums">{qaCount > 0 ? `${qaCount} Q&A` : 'Detail'}</span>
                </Button>
                {job.jobUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground rounded-md"
                  >
                    <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="p-3.5">Perusahaan</th>
                <th className="p-3.5">Posisi</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Tautan</th>
                <th className="p-3.5 text-center">Detail / Q&amp;A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((job, idx) => {
                const qaCount = job.questionsAndAnswers?.length || 0;
                return (
                  <tr key={`${job.company}-${job.title}-${idx}`} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-medium text-foreground">{job.company}</td>
                    <td className="p-3.5 text-muted-foreground">{job.title}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px]">
                        {job.platform}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-muted-foreground tabular-nums">{formatJobDate(job.date)}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          job.status?.toLowerCase() === 'applied' || job.status?.toLowerCase() === 'success'
                            ? 'bg-brand/10 text-brand border-brand/20'
                            : job.status?.toLowerCase() === 'external link'
                            ? 'bg-secondary text-secondary-foreground border-border'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {job.status === 'External Link' ? '🔗 External Link' : job.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {job.jobUrl ? (
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand hover:underline flex items-center gap-1 font-medium text-[11px]"
                        >
                          <span>Lihat Loker</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectJob(job)}
                        className={`h-7 text-[10px] px-2.5 font-medium rounded-md ${
                          qaCount > 0 ? 'bg-brand/10 border-brand/30 text-brand hover:bg-brand/20' : ''
                        }`}
                      >
                        <span className="tabular-nums">{qaCount > 0 ? `${qaCount} Q&A` : 'Detail'}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
