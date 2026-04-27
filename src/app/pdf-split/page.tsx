"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Scissors, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

type SplitMode = 'all' | 'range';
interface SplitFile { name: string; data: string; }

export default function PdfSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('all');
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([]);
  const [singleResultUrl, setSingleResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setSplitFiles([]); setSingleResultUrl(null);
  };

  const handleSplit = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    if (splitMode === 'range' && !pageRange.trim()) { toast.error('Enter a page range (e.g. 1-3, 5).'); return; }
    setIsProcessing(true); setSplitFiles([]); setSingleResultUrl(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('splitMode', splitMode);
      if (splitMode === 'range') formData.append('pageRange', pageRange);
      const res = await fetch('/api/pdf-split', { method: 'POST', body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Split failed.'); }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/pdf')) {
        setSingleResultUrl(URL.createObjectURL(await res.blob()));
        toast.success('Pages extracted successfully!');
      } else {
        const data = await res.json();
        setSplitFiles(data.files);
        toast.success(`Split into ${data.files.length} pages!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Split failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingle = () => {
    if (!singleResultUrl) return;
    const a = document.createElement('a');
    a.href = singleResultUrl; a.download = 'extracted-pages.pdf'; a.click();
  };

  const downloadPage = (sf: SplitFile) => {
    const bytes = atob(sf.data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url; a.download = sf.name; a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) =>
    bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Split PDF"
      description="Extract individual pages or a custom range from any PDF document."
      icon={<Scissors className="h-7 w-7" />}
      accentColor="rgba(244,63,94,0.35)"
      features={[
        'Extract every page into separate PDF files',
        'Extract a custom page range into one PDF',
        'Comma and hyphen notation for ranges',
        'Processed server-side with pdf-lib',
        'Download all pages with one click',
        'Original content and formatting preserved',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — extract all pages or a custom range"
          accentClass="border-rose-500/60 bg-rose-500/[0.06] shadow-[0_0_40px_rgba(244,63,94,0.12)]"
          buttonClass="bg-rose-500 hover:bg-rose-400 shadow-[0_4px_16px_rgba(244,63,94,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={() => { setFile(null); setSplitFiles([]); setSingleResultUrl(null); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-white/70 mb-1">Split options</p>
            {[
              { value: 'all' as SplitMode, label: 'Extract all pages', desc: 'Every page becomes its own PDF file' },
              { value: 'range' as SplitMode, label: 'Extract page range', desc: 'Combine specific pages into one PDF' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  splitMode === opt.value
                    ? 'border-rose-500/40 bg-rose-500/[0.06]'
                    : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                }`}
              >
                <input
                  type="radio"
                  name="splitMode"
                  value={opt.value}
                  checked={splitMode === opt.value}
                  onChange={() => setSplitMode(opt.value)}
                  className="mt-0.5 accent-rose-500"
                />
                <div className="flex-grow">
                  <p className="text-sm font-medium text-white/80">{opt.label}</p>
                  <p className="text-xs text-white/35 mt-0.5">{opt.desc}</p>
                  {opt.value === 'range' && splitMode === 'range' && (
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g. 1-3, 5, 7-9"
                      className="mt-3 w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30"
                    />
                  )}
                </div>
              </label>
            ))}
          </div>

          {singleResultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Pages extracted</p>
                  <p className="text-xs text-emerald-400/60">Your extracted PDF is ready</p>
                </div>
              </div>
              <button onClick={downloadSingle} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          {splitFiles.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-sm font-semibold text-white/80">{splitFiles.length} pages extracted</p>
                </div>
                <button
                  onClick={() => splitFiles.forEach((sf, i) => setTimeout(() => downloadPage(sf), i * 150))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                {splitFiles.map((sf) => (
                  <button
                    key={sf.name}
                    onClick={() => downloadPage(sf)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-white/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.06] transition-all text-left"
                  >
                    <FileText className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="text-xs text-white/50 truncate">{sf.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(244,63,94,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><Scissors className="h-4 w-4" /> Split PDF</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
