'use client';

import React, { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Database,
  Search,
  Plus,
  Upload,
  Download,
  Edit3,
  Trash2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { QuestionFormDialog, QuestionFormData } from '@/components/modals/QuestionFormDialog';

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  type: string;
  category?: string;
  reviewStatus?: string;
  confidenceScore?: string;
  usageCount?: number;
  lastUsedAt?: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unreviewed'>('all');
  const [categoryFilter] = useState<string>('all');
  const [, startTransition] = useTransition();

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    question: '',
    type: 'dropdown',
    options: '',
    answer: '',
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      }
    } catch (err: any) {
      toast.error('Gagal memuat bank soal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    startTransition(() => {
      setSearchTerm(val);
    });
  };

  // Filtered list using useMemo and useTransition (vercel-react-best-practices)
  const filteredQuestions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return questions.filter((q) => {
      const matchesSearch =
        !term ||
        q.question.toLowerCase().includes(term) ||
        q.answer.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && (q.reviewStatus === 'verified' || !q.reviewStatus)) ||
        (statusFilter === 'unreviewed' && q.reviewStatus === 'unreviewed');

      const matchesCategory =
        categoryFilter === 'all' ||
        q.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [questions, searchTerm, statusFilter, categoryFilter]);

  const verifiedCount = useMemo(
    () => questions.filter((q) => q.reviewStatus === 'verified' || !q.reviewStatus).length,
    [questions]
  );
  const unreviewedCount = useMemo(
    () => questions.filter((q) => q.reviewStatus === 'unreviewed').length,
    [questions]
  );

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Jawaban berhasil disetujui & diverifikasi!');
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, reviewStatus: 'verified' } : q))
        );
      } else {
        toast.error(data.error || 'Gagal menyetujui');
      }
    } catch (err: any) {
      toast.error('Gagal memproses persetujuan: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pertanyaan ini dari database PostgreSQL?')) return;

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Pertanyaan berhasil dihapus');
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        toast.error(data.error || 'Gagal menghapus');
      }
    } catch (err: any) {
      toast.error('Gagal menghapus pertanyaan: ' + err.message);
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ question: '', type: 'dropdown', options: '', answer: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (q: QuestionItem) => {
    setIsEditMode(true);
    setEditingId(q.id);
    setFormData({
      question: q.question,
      type: q.type || 'dropdown',
      options: '',
      answer: q.answer,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Pertanyaan dan jawaban wajib diisi');
      return;
    }

    try {
      if (isEditMode && editingId) {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            id: editingId,
            question: formData.question,
            answer: formData.answer,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Pertanyaan berhasil diperbarui!');
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === editingId
                ? { ...q, question: formData.question, answer: formData.answer }
                : q
            )
          );
          setIsFormOpen(false);
        }
      } else {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            question: formData.question,
            answer: formData.answer,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Pertanyaan baru berhasil ditambahkan!');
          fetchQuestions();
          setIsFormOpen(false);
        }
      }
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    }
  };

  const handleExportCsv = () => {
    const csvContent =
      'Question,Answer,Category,ReviewStatus\n' +
      questions
        .map(
          (q) =>
            `"${q.question.replace(/"/g, '""')}","${q.answer.replace(/"/g, '""')}","${
              q.category || 'general'
            }","${q.reviewStatus || 'verified'}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `autoapply-questions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchQuestions();
      } else {
        toast.error(data.error || 'Gagal mengunggah CSV');
      }
    } catch (err: any) {
      toast.error('Gagal memproses file CSV: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <Card className="p-6 md:p-8 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-semibold text-foreground">
                Database Soal Kuesioner (Screening Bank)
              </h2>
              <p className="text-xs text-muted-foreground">
                Total {questions.length} pertanyaan tersimpan di PostgreSQL dengan sub-2ms indexed lookup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadCsv}
              accept=".csv"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 border-border hover:bg-secondary gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs h-8 border-border hover:bg-secondary gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="text-xs h-8 bg-brand hover:bg-brand-hover text-brand-foreground gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pertanyaan</span>
            </Button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-secondary/40 border border-border/50 text-center">
            <span className="text-[11px] text-muted-foreground font-medium block">Total Pertanyaan</span>
            <span className="text-lg font-semibold text-foreground tabular-nums block">
              {questions.length}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
            <span className="text-[11px] text-success font-medium block">Terverifikasi (Verified)</span>
            <span className="text-lg font-semibold text-success tabular-nums block">
              {verifiedCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">
              Menunggu Review (AI)
            </span>
            <span className="text-lg font-semibold text-amber-600 dark:text-amber-400 tabular-nums block">
              {unreviewedCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-brand/5 border border-brand/20 text-center">
            <span className="text-[11px] text-brand font-medium block">Fuzzy Match Engine</span>
            <span className="text-lg font-semibold text-brand tabular-nums block">pg_trgm</span>
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="inline-flex rounded-lg border border-border p-1 bg-card shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semua ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'verified'
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Terverifikasi ({verifiedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unreviewed')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'unreviewed'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Menunggu Review ({unreviewedCount})
          </button>
        </div>

        {/* Search input with useTransition */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Cari pertanyaan atau jawaban..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="text-xs h-9 pl-9"
          />
        </div>
      </div>

      {/* Questions List */}
      <Card className="p-0 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Memuat bank soal dari PostgreSQL...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Tidak Ada Pertanyaan yang Cocok</p>
            <p>Coba ubah kata kunci pencarian atau ganti filter status di atas.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredQuestions.slice(0, 100).map((q) => {
              const isUnreviewed = q.reviewStatus === 'unreviewed';
              return (
                <div
                  key={q.id}
                  className={`p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isUnreviewed ? 'bg-amber-500/5' : 'hover:bg-secondary/20'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs md:text-sm font-semibold text-foreground">
                        {q.question}
                      </p>
                      {isUnreviewed ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium"
                        >
                          Review AI
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[9px] bg-success/10 text-success border-success/30 font-medium"
                        >
                          Verified
                        </Badge>
                      )}
                      {q.category ? (
                        <Badge variant="secondary" className="text-[9px] uppercase font-mono">
                          {q.category}
                        </Badge>
                      ) : null}
                    </div>

                    <p className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2.5 py-1 rounded inline-block">
                      Jawaban: <span className="text-foreground font-medium">{q.answer}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isUnreviewed ? (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(q.id)}
                        className="text-xs h-7 bg-success hover:bg-success/90 text-white gap-1 px-2.5"
                      >
                        <Check className="w-3 h-3" />
                        <span>Setujui</span>
                      </Button>
                    ) : null}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(q)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(q.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add / Edit Question Dialog */}
      {isFormOpen ? (
        <QuestionFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          data={formData}
          onChange={setFormData}
          onSubmit={handleFormSubmit}
          isEditMode={isEditMode}
        />
      ) : null}
    </div>
  );
}
