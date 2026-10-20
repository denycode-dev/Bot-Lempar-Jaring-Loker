'use client';

import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Upload,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Sliders,
  FileUp,
} from 'lucide-react';
import { QuestionItem } from '@/types';

interface QuestionsBankProps {
  questions: QuestionItem[];
  csvViewMode: 'table' | 'raw';
  onChangeCsvViewMode: (mode: 'table' | 'raw') => void;
  questionSearch: string;
  onChangeQuestionSearch: (search: string) => void;
  filteredQuestions: QuestionItem[];
  rawCsvText: string;
  onChangeRawCsvText: (text: string) => void;
  isUploadingCsv: boolean;
  onCsvFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenNewQuestionModal: () => void;
  onCleanCsv: () => void;
  onSmartPersonalize: () => void;
  onClearAllQuestions: () => void;
  onEditQuestion: (q: QuestionItem) => void;
  onDeleteQuestion: (id: string) => void;
  onSaveRawCsv: () => void;
  isAiConfigured: boolean;
}

export const QuestionsBank: React.FC<QuestionsBankProps> = ({
  questions,
  csvViewMode,
  onChangeCsvViewMode,
  questionSearch,
  onChangeQuestionSearch,
  filteredQuestions,
  rawCsvText,
  onChangeRawCsvText,
  isUploadingCsv,
  onCsvFileUpload,
  onOpenNewQuestionModal,
  onCleanCsv,
  onSmartPersonalize,
  onClearAllQuestions,
  onEditQuestion,
  onDeleteQuestion,
  onSaveRawCsv,
  isAiConfigured,
}) => {
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card id="tour-batch-questions" className="p-6 md:p-8 shadow-sm space-y-6 border-subtle-theme">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-subtle-theme pb-4">
        <div>
          <h2 className="text-base font-semibold text-main-theme">Database Soal Kuesioner</h2>
          <p className="text-xs text-muted-theme mt-0.5">
            Total {questions.length} pertanyaan tersimpan di file internal.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="card-subtle-theme border border-subtle-theme rounded-xl p-1 flex text-xs">
            <button
              type="button"
              onClick={() => onChangeCsvViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                csvViewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-theme hover:text-main-theme'
              }`}
            >
              Tabel Visual
            </button>
            <button
              type="button"
              onClick={() => onChangeCsvViewMode('raw')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                csvViewMode === 'raw' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-theme hover:text-main-theme'
              }`}
            >
              Teks CSV
            </button>
          </div>

          <div className="relative">
            <input
              ref={csvFileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={onCsvFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingCsv}
              onClick={() => csvFileInputRef.current?.click()}
              className="text-xs gap-1.5 h-8"
              title="Upload file CSV (Maks 5 MB, format .csv)"
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>{isUploadingCsv ? 'Mengunggah...' : 'Upload File CSV'}</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenNewQuestionModal}
            className="text-xs gap-1.5 h-8"
          >
            <Plus className="w-3.5 h-3.5 text-muted-theme" />
            <span>Tambah Soal</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCleanCsv}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-theme" />
            <span>Bersihkan Duplikat</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSmartPersonalize}
            className="text-xs gap-1.5 h-8 shadow-sm"
            title={isAiConfigured ? 'Sinkronkan jawaban dengan profil pelamar & AI' : 'Sinkronkan jawaban otomatis dari profil kamu (0 token)'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalisasi Jawaban</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              isAiConfigured ? 'bg-white/25 text-white' : 'bg-black/25 text-white/90'
            }`}>
              {isAiConfigured ? 'AI + Profil' : 'Profil'}
            </span>
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onClearAllQuestions}
            className="text-xs gap-1.5 h-8"
            title="Hapus semua pertanyaan dari database"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] card-subtle-theme px-4 py-2.5 rounded-xl border border-subtle-theme">
        <div className="flex items-center gap-2 text-muted-theme">
          <FileUp className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            Upload CSV: Format file wajib <strong className="text-main-theme">.csv</strong> | Ukuran maks <strong className="text-main-theme">5 MB</strong>
          </span>
        </div>
        <span className="text-[10px] text-muted-theme hidden sm:inline">
          Struktur kolom: Question, Type, Options, Answer
        </span>
      </div>

      {csvViewMode === 'table' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-theme absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pertanyaan..."
                value={questionSearch}
                onChange={(e) => onChangeQuestionSearch(e.target.value)}
                className="w-full input-theme border rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-primary transition"
              />
            </div>
            <span className="text-xs text-muted-theme shrink-0">
              Menampilkan {filteredQuestions.length} dari {questions.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-subtle-theme">
            <table className="w-full text-left text-xs">
              <thead className="card-subtle-theme text-muted-theme font-medium border-b border-subtle-theme">
                <tr>
                  <th className="p-3.5 w-12 text-center">#</th>
                  <th className="p-3.5">Pertanyaan HRD</th>
                  <th className="p-3.5 w-28">Tipe Form</th>
                  <th className="p-3.5 w-48">Jawaban Default / AI</th>
                  <th className="p-3.5 w-24 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y border-subtle-theme font-normal">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-theme italic">
                      Tidak ada pertanyaan yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <tr key={q.id || idx} className="hover:opacity-90 card-theme transition">
                      <td className="p-3.5 text-center text-muted-theme">{idx + 1}</td>
                      <td className="p-3.5 font-medium text-main-theme">{q.question}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium card-subtle-theme border border-subtle-theme text-muted-theme uppercase">
                          {q.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        {q.answer || <span className="text-muted-theme italic">(Kosong)</span>}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditQuestion(q)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-theme hover:text-main-theme transition"
                            title="Edit Jawaban"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-theme hover:text-destructive transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={16}
            value={rawCsvText}
            onChange={(e) => onChangeRawCsvText(e.target.value)}
            className="w-full input-theme border rounded-2xl p-4 font-mono text-xs focus:outline-none focus:border-primary transition"
            placeholder="Question,Type,Options,Answer..."
          />
          <Button
            type="button"
            size="sm"
            onClick={onSaveRawCsv}
            className="shadow-sm text-xs"
          >
            Simpan Perubahan CSV
          </Button>
        </div>
      )}
    </Card>
  );
};
