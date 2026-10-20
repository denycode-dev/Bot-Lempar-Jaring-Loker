'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ExternalLink, 
  MessageSquare, 
  Download, 
  Sparkles, 
  MapPin, 
  Mail, 
  UserCheck, 
  RefreshCw, 
  Plus, 
  ClipboardPaste, 
  Bookmark, 
  Bot, 
  Loader2, 
  Copy, 
  Check, 
  X, 
  Users, 
  Briefcase, 
  FileText, 
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Activity,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { TalentCandidate, TalentFilter, ParsedTalentPrompt } from '@/lib/talentTypes';
import { generateWhatsAppUrl, getBookmarkletCode, getLinkedInProfileBookmarkletCode, generateOsintContactUrl } from '@/lib/xraySearch';
import { CandidateDetailDialog } from '@/components/talent/modals/CandidateDetailDialog';
import { PasteResultDialog } from '@/components/talent/modals/PasteResultDialog';
import { BookmarkletGuideDialog } from '@/components/talent/modals/BookmarkletGuideDialog';
import { AddCandidateDialog } from '@/components/talent/modals/AddCandidateDialog';

const SAMPLE_PROMPT_PRESETS = [
  'Staff gudang atau admin inventori di Surabaya dan Sidoarjo, bisa Excel, siap kerja segera, ada nomor WA',
  'Accounting staff junior di Jakarta atau Tangerang, menguasai Accurate dan pajak, siap kerja cepat',
  'Teknisi mesin atau operator produksi di Gresik, lulusan SMK/D3, siap kerja sistem shift',
  'Customer Service atau Admin Online di Surabaya, terbiasa marketplace dan WhatsApp, ramah',
  'Frontend Developer React atau Next.js di Bandung atau Remote, portofolio aktif, siap bergabung segera'
];

export default function TalentScoutTab() {
  const [talents, setTalents] = useState<TalentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTable, setSearchTable] = useState('');

  // Mode Selection: 'ai_prompt' (Default & modern) or 'manual'
  const [searchMode, setSearchMode] = useState<'ai_prompt' | 'manual'>('ai_prompt');
  const [aiPrompt, setAiPrompt] = useState('Staff gudang atau admin logistik di Surabaya dan Sidoarjo, bisa Excel/WMS, siap kerja segera, utamakan ada nomor WhatsApp');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [parsedPrompt, setParsedPrompt] = useState<ParsedTalentPrompt | null>(null);

  // Provider matrix: 'linkedin' | 'glints' | 'webResumePdf'
  const [selectedProvider, setSelectedProvider] = useState<'linkedin' | 'glints' | 'webResumePdf'>('linkedin');
  const [googleUrls, setGoogleUrls] = useState<Record<string, string>>({});

  // Manual Filter Fallback
  const [filter, setFilter] = useState<TalentFilter>({
    targetRole: 'Staff Gudang / Admin',
    locations: ['Surabaya', 'Gresik', 'Sidoarjo'],
    onlyOpenToWork: true,
    platforms: ['linkedin'],
    searchMethod: 'xray',
    requireContact: true
  });

  const [xrayQuery, setXrayQuery] = useState('');
  const [googleSearchUrl, setGoogleSearchUrl] = useState('');

  // Modal & Drawer states
  const [isScrapingBrowser, setIsScrapingBrowser] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  const [showProfileBookmarkletModal, setShowProfileBookmarkletModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null);

  // Form input manual
  const [newCandidate, setNewCandidate] = useState<Partial<TalentCandidate>>({
    name: '',
    headline: '',
    profileUrl: '',
    location: 'Surabaya, Jawa Timur',
    phone: '',
    email: '',
    isOpenToWork: true,
    platform: 'linkedin'
  });

  const fetchTalents = async () => {
    try {
      const res = await fetch('/api/talents');
      const data = await res.json();
      if (data.success) {
        setTalents(data.talents || []);
      }
    } catch {
      toast.error('Gagal memuat daftar talenta');
    }
  };

  // Generate AI Prompt-based queries
  const handleGenerateAiPrompt = async (promptToUse?: string) => {
    const text = (promptToUse || aiPrompt).trim();
    if (!text) {
      toast.error('Ketik instruksi kebutuhan talenta terlebih dahulu');
      return;
    }
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch('/api/talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse_prompt', prompt: text })
      });
      const data = await res.json();
      if (data.success && data.parsedPrompt) {
        setParsedPrompt(data.parsedPrompt);
        setGoogleUrls(data.googleUrls || {});
        setXrayQuery(data.parsedPrompt.queries[selectedProvider] || data.parsedPrompt.queries.linkedin);
        setGoogleSearchUrl(data.googleUrls?.[selectedProvider] || data.googleUrls?.linkedin || '');

        // Sync to manual filter state as well
        setFilter({
          ...filter,
          targetRole: data.parsedPrompt.primaryRole,
          locations: data.parsedPrompt.locations,
          onlyOpenToWork: true,
          requireContact: data.parsedPrompt.requireContact
        });

        toast.success('Parameter & query multi-mesin pencari berhasil disusun AI');
      } else {
        toast.error('Gagal menyusun parameter dengan AI');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyusun prompt');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Generate standard manual query
  const generateManualXray = async () => {
    try {
      const res = await fetch('/api/talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_xray', filter })
      });
      const data = await res.json();
      if (data.success) {
        setXrayQuery(data.query);
        setGoogleSearchUrl(data.googleUrl);
      }
    } catch {}
  };

  // Initial load
  useEffect(() => {
    fetchTalents();
    handleGenerateAiPrompt();
  }, []);

  // Provider change handler
  const handleSelectProvider = (prov: 'linkedin' | 'glints' | 'webResumePdf') => {
    setSelectedProvider(prov);
    if (parsedPrompt && googleUrls[prov]) {
      setXrayQuery(parsedPrompt.queries[prov]);
      setGoogleSearchUrl(googleUrls[prov]);
    }
  };

  // KPI Stats
  const stats = useMemo(() => {
    const total = talents.length;
    const openToWork = talents.filter(t => t.isOpenToWork).length;
    const withContact = talents.filter(t => t.phone || t.email || (t.contact && /^\+?[0-9]{8,15}$/.test(t.contact))).length;
    const highIntegrity = talents.filter(t => (t.aiHonestyScore ?? 0) >= 85).length;
    return { total, openToWork, withContact, highIntegrity };
  }, [talents]);

  // Filtered table
  const filteredTalents = useMemo(() => {
    if (!searchTable.trim()) return talents;
    const q = searchTable.toLowerCase();
    return talents.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.headline.toLowerCase().includes(q) ||
      (t.location && t.location.toLowerCase().includes(q))
    );
  }, [talents, searchTable]);

  const handleExportCsv = () => {
    window.open('/api/talents?format=csv', '_blank');
    toast.success('Mengunduh data talenta ke format CSV');
  };

  const handleAutoScrapeBrowser = async () => {
    if (!googleSearchUrl) {
      toast.error('Susun query penelusuran terlebih dahulu');
      return;
    }
    setIsScrapingBrowser(true);
    toast.info('Membuka browser untuk mengekstrak hasil penelusuran...');
    try {
      const res = await fetch('/api/talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto_scrape_browser',
          googleUrl: googleSearchUrl,
          filter
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${data.count} talenta berhasil diambil`);
        fetchTalents();
      } else {
        toast.error(data.error || 'Gagal mengekstrak data');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsScrapingBrowser(false);
    }
  };

  const handleParsePastedText = async () => {
    if (!pastedText.trim()) {
      toast.error('Tempel teks hasil pencarian terlebih dahulu');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_paste',
          rawText: pastedText,
          defaultLocation: parsedPrompt?.locations[0] || filter.locations[0] || 'Indonesia'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.count} profil kandidat berhasil diekstrak dan disimpan`);
        setShowPasteModal(false);
        setPastedText('');
        fetchTalents();
      } else {
        toast.error(data.error || 'Gagal mengekstrak teks');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveManualCandidate = async () => {
    if (!newCandidate.name || !newCandidate.profileUrl) {
      toast.error('Nama dan tautan profil wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const evalRes = await fetch('/api/talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          candidate: newCandidate,
          requirement: `Posisi: ${filter.targetRole} di ${filter.locations.join(', ')}`
        })
      });
      const evalData = await evalRes.json();

      const candidateToSave: TalentCandidate = {
        id: `cand_${Date.now()}`,
        name: newCandidate.name || '',
        headline: newCandidate.headline || '',
        platform: newCandidate.platform || 'linkedin',
        profileUrl: newCandidate.profileUrl || '',
        location: newCandidate.location || 'Indonesia',
        phone: newCandidate.phone || '',
        email: newCandidate.email || '',
        contact: newCandidate.phone || newCandidate.email || '',
        isOpenToWork: newCandidate.isOpenToWork ?? true,
        aiHonestyScore: evalData.evaluation?.honestyScore || 90,
        aiHonestyNotes: evalData.evaluation?.notes || ['Data kandidat tersimpan'],
        aiMatchScore: evalData.evaluation?.matchScore || 85,
        availabilityStatus: evalData.evaluation?.availability || 'immediate',
        experiences: [],
        skills: [],
        sourcedDate: new Date().toISOString().split('T')[0],
        status: 'new'
      };

      await fetch('/api/talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_candidate', candidate: candidateToSave })
      });

      toast.success(`Kandidat ${candidateToSave.name} berhasil disimpan`);
      setShowAddModal(false);
      setNewCandidate({
        name: '',
        headline: '',
        profileUrl: '',
        location: 'Surabaya, Jawa Timur',
        phone: '',
        email: '',
        isOpenToWork: true,
        platform: 'linkedin'
      });
      fetchTalents();
    } catch (err: any) {
      toast.error('Gagal menyimpan kandidat: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyQuery = () => {
    if (!xrayQuery) return;
    navigator.clipboard.writeText(xrayQuery);
    toast.success('Query pencarian disalin ke clipboard');
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-0">
      {/* 1. KPI Metric Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Talenta Terdata', value: stats.total, color: 'text-foreground' },
          { label: 'Status OpenToWork', value: stats.openToWork, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Kontak Terverifikasi', value: stats.withContact, color: 'text-brand' },
          { label: 'Integritas Tinggi (>85)', value: stats.highIntegrity, color: 'text-brand' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col gap-1">
            <span className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* 2. Semantic AI Talent Prompter & Extraction Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-5">
        {/* Header with Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <h2 className="text-base font-semibold text-foreground">Mesin Pencari &amp; Evaluator Talenta</h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ketik instruksi pencarian dalam bahasa sehari-hari. AI akan menyusun sinonim jabatan, memetakan keahlian, dan merakit query multi-platform.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-md bg-muted/60 border border-border shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSearchMode('ai_prompt')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                searchMode === 'ai_prompt'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prompt AI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode('manual');
                generateManualXray();
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                searchMode === 'manual'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Manual</span>
            </button>
          </div>
        </div>

        {/* Mode 1: AI Semantic Prompt Input */}
        {searchMode === 'ai_prompt' ? (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Contoh: Butuh staf admin gudang atau logistik di Surabaya/Sidoarjo yang bisa Excel dan WMS, siap kerja segera, utamakan ada kontak WA..."
                className="w-full bg-background border border-input rounded-md p-3.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-brand focus:border-brand transition leading-relaxed"
              />
              <button
                type="button"
                onClick={() => handleGenerateAiPrompt()}
                disabled={isGeneratingPrompt || !aiPrompt.trim()}
                className="absolute right-3 bottom-3 px-4 py-2 bg-brand hover:bg-brand/90 disabled:opacity-50 text-white font-medium text-xs rounded-md transition flex items-center gap-1.5 shadow-xs"
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Susun Parameter</span>
                  </>
                )}
              </button>
            </div>

            {/* Presets / Inspiration chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-muted-foreground">
              <span className="font-semibold shrink-0">Contoh Prompt:</span>
              {SAMPLE_PROMPT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiPrompt(preset);
                    handleGenerateAiPrompt(preset);
                  }}
                  className="px-2.5 py-1 rounded-md bg-muted/40 border border-border hover:border-brand/50 hover:text-foreground transition truncate max-w-xs shrink-0 text-left"
                  title={preset}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Parsed Breakdown Card */}
            {parsedPrompt && (
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Parameter Ditemukan oleh AI</span>
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    Role Utama: <strong className="text-foreground">{parsedPrompt.primaryRole}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-md bg-background border border-border space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Sinonim Peran</span>
                    <div className="flex flex-wrap gap-1">
                      {parsedPrompt.roleSynonyms.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-muted text-foreground rounded text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-md bg-background border border-border space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Radius Wilayah</span>
                    <div className="flex flex-wrap gap-1">
                      {parsedPrompt.locations.map((loc, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-muted text-foreground rounded text-[10px]">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-md bg-background border border-border space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Keahlian Kunci</span>
                    <div className="flex flex-wrap gap-1">
                      {parsedPrompt.skills.length > 0 ? (
                        parsedPrompt.skills.map((sk, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-muted text-foreground rounded text-[10px]">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Kualifikasi umum</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Mode 2: Manual Detail Filter */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Posisi / Jabatan Target</label>
                <input
                  type="text"
                  value={filter.targetRole}
                  onChange={(e) => {
                    const next = { ...filter, targetRole: e.target.value };
                    setFilter(next);
                  }}
                  className="w-full bg-background border border-input rounded-md px-3.5 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-brand focus:border-brand transition"
                  placeholder="Contoh: Staff Gudang / Admin"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Domisili / Wilayah Target</label>
                <input
                  type="text"
                  value={filter.locations.join(', ')}
                  onChange={(e) => {
                    const next = { ...filter, locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) };
                    setFilter(next);
                  }}
                  className="w-full bg-background border border-input rounded-md px-3.5 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-brand focus:border-brand transition"
                  placeholder="Surabaya, Gresik, Sidoarjo"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Filter Tambahan</label>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filter.onlyOpenToWork}
                      onChange={(e) => setFilter({ ...filter, onlyOpenToWork: e.target.checked })}
                      className="w-4 h-4 rounded text-brand focus:ring-brand"
                    />
                    <span>Hanya #OpenToWork</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filter.requireContact}
                      onChange={(e) => setFilter({ ...filter, requireContact: e.target.checked })}
                      className="w-4 h-4 rounded text-brand focus:ring-brand"
                    />
                    <span>Prioritaskan Kontak (HP/WA)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={generateManualXray}
                className="px-4 py-2 bg-brand hover:bg-brand/90 text-white font-medium rounded-md transition flex items-center gap-1.5 shadow-xs text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Perbarui Query Manual</span>
              </button>
            </div>
          </div>
        )}

        {/* Multi-Provider Tabs & Query Preview */}
        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
          {/* Provider Selection Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Pilih Mesin Sumber:
              </span>
              <button
                type="button"
                onClick={() => handleSelectProvider('linkedin')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  selectedProvider === 'linkedin'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>LinkedIn (#OpenToWork)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProvider('glints')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  selectedProvider === 'glints'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Glints Publik</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProvider('webResumePdf')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  selectedProvider === 'webResumePdf'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume PDF Publik</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyQuery}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
              title="Salin query aktif"
            >
              <Copy className="w-3 h-3" />
              <span>Salin Query</span>
            </button>
          </div>

          {/* Active Query Display */}
          <div className="font-mono text-xs text-foreground bg-background p-2.5 rounded-md border border-border break-all select-all leading-relaxed">
            {xrayQuery || 'Menyusun parameter penelusuran...'}
          </div>

          {/* Extraction Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAutoScrapeBrowser}
              disabled={isScrapingBrowser || !googleSearchUrl}
              className="px-4 py-2 bg-brand hover:bg-brand/90 disabled:opacity-50 text-white text-xs font-medium rounded-md transition flex items-center gap-2 shadow-xs"
              title="Membuka browser otomatis untuk mengambil hasil ke database"
            >
              {isScrapingBrowser ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengekstrak Data...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Panen via Browser</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="px-4 py-2 bg-background border border-border text-foreground hover:bg-muted text-xs font-medium rounded-md transition flex items-center gap-2 shadow-xs"
              title="Tempel teks yang disalin dari hasil Google untuk diekstrak seketika"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Tempel Hasil Pencarian</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBookmarkletModal(true)}
              className="px-4 py-2 bg-background border border-border text-foreground hover:bg-muted text-xs font-medium rounded-md transition flex items-center gap-2 shadow-xs"
              title="Kirim seluruh profil dari tab Google hanya dengan 1 kali klik bookmark"
            >
              <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Bookmarklet Google SERP</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProfileBookmarkletModal(true)}
              className="px-4 py-2 bg-brand hover:bg-brand/90 text-white text-xs font-medium rounded-md transition flex items-center gap-2 shadow-xs"
              title="Ekstrak profil LinkedIn lengkap (riwayat karir, open to work, dan skills) dalam 1 klik"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bookmarklet Profil LinkedIn</span>
            </button>

            {googleSearchUrl && (
              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto px-3.5 py-2 bg-background border border-border text-muted-foreground hover:text-foreground text-xs font-medium rounded-md transition flex items-center gap-1.5"
                title="Buka penelusuran di Google"
              >
                <span>Buka di Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Candidate Table Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">Daftar Talenta Terverifikasi</h3>
              <span className="text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {talents.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Klik nama kandidat untuk melihat analisis Forensic &amp; Background Check mendalam (tenure, keahlian, riwayat kerja).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search filter in table */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                placeholder="Cari nama atau jabatan..."
                className="bg-background border border-input rounded-md pl-8 pr-3 py-1.5 text-xs w-44 sm:w-56 focus:outline-hidden focus:ring-1 focus:ring-brand focus:border-brand transition"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-md bg-background border border-border text-foreground hover:bg-muted text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Manual</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={talents.length === 0}
              className="px-3.5 py-2 rounded-md bg-brand hover:bg-brand/90 disabled:opacity-50 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredTalents.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Users className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">Belum ada data kandidat</p>
            <p className="text-xs max-w-md mx-auto">
              Gunakan tombol &quot;Panen via Browser&quot; atau &quot;Tempel Hasil Pencarian&quot; di atas untuk menambahkan kandidat ke daftar ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-medium text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3">Kandidat</th>
                  <th className="px-4 py-3">Domisili</th>
                  <th className="px-4 py-3">Kontak Langsung</th>
                  <th className="px-4 py-3">Status Karir</th>
                  <th className="px-4 py-3">Integritas &amp; Tenure</th>
                  <th className="px-4 py-3 text-right">Aksi &amp; Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTalents.map((cand) => {
                  const hasRealPhone = Boolean(cand.phone && /^\+?[0-9]{8,15}$/.test(cand.phone.replace(/[\s-]/g, '')));
                  const waUrl = hasRealPhone ? generateWhatsAppUrl(cand.phone!, cand.name, 'Perusahaan Kami', parsedPrompt?.primaryRole || filter.targetRole) : null;
                  const osintUrl = generateOsintContactUrl(cand.name, cand.location);

                  return (
                    <tr 
                      key={cand.id} 
                      className="hover:bg-muted/30 transition group cursor-pointer"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      {/* Name & Headline */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0">
                            {cand.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-xs group-hover:text-brand transition flex items-center gap-1.5">
                              <span>{cand.name}</span>
                              {cand.experiences && cand.experiences.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand/10 text-brand font-normal">
                                  {cand.experiences.length} Pengalaman
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{cand.headline}</div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{cand.location || 'Indonesia'}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium hover:bg-emerald-500/20 transition"
                            title={`Chat WhatsApp: ${cand.phone}`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        ) : cand.email ? (
                          <a
                            href={`mailto:${cand.email}`}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-muted-foreground hover:text-foreground font-medium"
                          >
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[110px]">{cand.email}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={cand.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border text-[11px] text-muted-foreground hover:text-foreground transition"
                              title="Buka profil LinkedIn untuk mengirim pesan / connect"
                            >
                              <UserCheck className="w-2.5 h-2.5" />
                              <span>Via LinkedIn</span>
                            </a>
                            <a
                              href={osintUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-background border border-border text-muted-foreground hover:text-brand transition"
                              title="Cari jejak nomor kontak / CV PDF kandidat di Google"
                            >
                              <Search className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {cand.isOpenToWork ? (
                          <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>OpenToWork</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                            Aktif Bekerja
                          </span>
                        )}
                      </td>

                      {/* Honesty Score & Tenure */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  (cand.aiHonestyScore ?? 90) >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${cand.aiHonestyScore ?? 90}%` }}
                              />
                            </div>
                            <span className="font-mono font-semibold text-foreground text-xs">
                              {cand.aiHonestyScore ?? 90}%
                            </span>
                          </div>
                          {cand.tenureAnalysis && (
                            <span className="text-[10px] text-muted-foreground block">
                              Stabilitas: <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{cand.tenureAnalysis.stabilityRating}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(cand)}
                            className="px-2.5 py-1 rounded-md bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 text-xs font-medium transition flex items-center gap-1"
                            title="Buka Background Check & Riwayat Karir"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Background Check</span>
                          </button>
                          <a
                            href={cand.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 inline-flex rounded-md bg-background border border-border text-muted-foreground hover:text-foreground transition"
                            title="Buka profil asli"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL: CANDIDATE FORENSIC & BACKGROUND CHECK */}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />

      {/* 5. MODAL: TEMPEL CEPAT HASIL PENCARIAN */}
      <PasteResultDialog
        isOpen={showPasteModal}
        onClose={() => {
          setShowPasteModal(false);
          setPastedText('');
        }}
        pastedText={pastedText}
        onChangePastedText={setPastedText}
        isLoading={isLoading}
        onSubmit={handleParsePastedText}
      />

      {/* 6 & 7. MODAL: PANDUAN BOOKMARKLET */}
      <BookmarkletGuideDialog
        type={showBookmarkletModal ? 'google' : showProfileBookmarkletModal ? 'linkedin' : null}
        onClose={() => {
          setShowBookmarkletModal(false);
          setShowProfileBookmarkletModal(false);
        }}
      />

      {/* 8. MODAL: TAMBAH KANDIDAT MANUAL */}
      <AddCandidateDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        candidate={newCandidate}
        onChangeCandidate={setNewCandidate}
        isLoading={isLoading}
        onSubmit={handleSaveManualCandidate}
      />
    </div>
  );
}
