"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Minimize2, FileText, Download, Loader2, CheckCircle2, X, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null); setOriginalSize(0); setCompressedSize(0);
  };

  const handleCompress = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/compress-pdf', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const orig = Number(res.headers.get('X-Original-Size') ?? file.size);
      const comp = Number(res.headers.get('X-Compressed-Size') ?? 0);
      setOriginalSize(orig);
      setCompressedSize(comp);
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('PDF compressed!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Compression failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const reduction = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Reduce PDF file size by removing dead objects and compressing internal streams."
      icon={<Minimize2 className="h-7 w-7" />}
      accentColor="rgba(14,165,233,0.35)"
      features={[
        'Re-serialises with compressed object streams',
        'Removes unused and dead objects',
        'Shows before and after file size',
        'No quality loss for text-based PDFs',
        'Processed server-side with pdf-lib',
        'Works on any standard PDF',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — remove dead objects and compress streams"
          accentClass="border-sky-500/60 bg-sky-500/[0.06] shadow-[0_0_40px_rgba(14,165,233,0.12)]"
          buttonClass="bg-sky-500 hover:bg-sky-400 shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
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

          {resultUrl && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-white/80">Compression complete</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Original</p>
                  <p className="text-sm font-semibold text-white/70">{fmt(originalSize)}</p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-3 text-center flex flex-col items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-sky-400 mb-0.5" />
                  <p className={`text-sm font-bold ${reduction > 0 ? 'text-sky-300' : 'text-white/40'}`}>
                    {reduction > 0 ? `−${reduction}%` : '0%'}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Compressed</p>
                  <p className="text-sm font-semibold text-emerald-300">{fmt(compressedSize)}</p>
                </div>
              </div>

              {reduction <= 0 && (
                <p className="text-xs text-white/30 text-center">This PDF was already well-optimised — no further reduction possible.</p>
              )}

              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'compressed.pdf'; a.click(); }}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download Compressed PDF
              </button>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing…</> : <><Minimize2 className="h-4 w-4" /> Compress PDF</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
