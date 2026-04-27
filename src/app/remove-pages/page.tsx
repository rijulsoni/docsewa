"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Trash2, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RemovePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState('');

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleRemove = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    if (!pages.trim()) { toast.error('Enter the page numbers to remove.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('pages', pages);
      const res = await fetch('/api/remove-pages', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const name = file.name.replace(/\.pdf$/i, '') + '-edited.pdf';
      setResultName(name);
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Pages removed!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove pages.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Remove Pages"
      description="Delete one or more pages from a PDF by specifying their page numbers."
      icon={<Trash2 className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'Remove individual pages or a range',
        'Comma and hyphen notation for ranges',
        'Cannot accidentally delete all pages',
        'Processed server-side with pdf-lib',
        'Remaining pages keep original quality',
        'Result downloads with an edited filename',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — specify which pages to delete"
          accentClass="border-red-500/60 bg-red-500/[0.06] shadow-[0_0_40px_rgba(239,68,68,0.12)]"
          buttonClass="bg-red-500 hover:bg-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
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
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setResultUrl(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-white/70">Pages to remove</p>
            <input
              type="text"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g. 2, 4-6, 9"
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-red-500/50"
            />
            <p className="text-xs text-white/30">
              Use commas to separate individual pages and hyphens for ranges.
              <br />
              Example: <span className="text-white/40 font-mono">2, 4-6, 9</span> removes pages 2, 4, 5, 6 and 9.
            </p>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Pages removed</p>
                  <p className="text-xs text-emerald-400/60 font-mono truncate max-w-[180px]">{resultName}</p>
                </div>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = resultName; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleRemove}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Removing…</> : <><Trash2 className="h-4 w-4" /> Remove Pages</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
