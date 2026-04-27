"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Crop, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CropPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesMode, setPagesMode] = useState<'all' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('');
  const [top, setTop]       = useState(0);
  const [right, setRight]   = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft]     = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleCrop = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    if (top === 0 && right === 0 && bottom === 0 && left === 0) {
      toast.error('Enter at least one non-zero margin.'); return;
    }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('pages', pagesMode === 'all' ? 'all' : customPages);
      fd.append('top',    String(top));
      fd.append('right',  String(right));
      fd.append('bottom', String(bottom));
      fd.append('left',   String(left));
      const res = await fetch('/api/crop-pages', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Pages cropped!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Crop failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const MarginInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div>
      <p className="text-xs text-white/40 mb-1.5">{label} (pt)</p>
      <input
        type="number"
        min={0}
        max={500}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 focus:outline-none focus:border-lime-500/50"
      />
    </div>
  );

  return (
    <ToolPageLayout
      title="Crop Pages"
      description="Trim margins from PDF pages by specifying how many points to remove from each edge."
      icon={<Crop className="h-7 w-7" />}
      accentColor="rgba(132,204,22,0.35)"
      features={[
        'Set independent margins for all four edges',
        'Apply to all pages or a custom range',
        'Margins specified in PDF points (1pt = 1/72 inch)',
        'Processed server-side with pdf-lib',
        'Useful for trimming scanned documents',
        'Removes excess whitespace from presentations',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — trim margins from any or all pages"
          accentClass="border-lime-500/60 bg-lime-500/[0.06] shadow-[0_0_40px_rgba(132,204,22,0.12)]"
          buttonClass="bg-lime-500 hover:bg-lime-400 text-black shadow-[0_4px_16px_rgba(132,204,22,0.25)]"
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

          <div className="glass-card rounded-2xl p-5 space-y-5">
            <p className="text-sm font-semibold text-white/70">Crop options</p>

            {/* Page selection */}
            <div>
              <p className="text-xs text-white/40 mb-2">Which pages?</p>
              <div className="flex gap-2 mb-3">
                {(['all', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPagesMode(mode)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      pagesMode === mode
                        ? 'border-lime-500/50 bg-lime-500/[0.10] text-lime-300'
                        : 'border-white/[0.06] text-white/40 hover:border-white/[0.12]'
                    }`}
                  >
                    {mode === 'all' ? 'All pages' : 'Custom range'}
                  </button>
                ))}
              </div>
              {pagesMode === 'custom' && (
                <input
                  type="text"
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  placeholder="e.g. 1, 3-5, 8"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-lime-500/50"
                />
              )}
            </div>

            {/* Margin inputs — visual cross layout */}
            <div>
              <p className="text-xs text-white/40 mb-3">Margins to trim (in pt, 1 pt = 1/72 inch)</p>
              <div className="flex justify-center mb-2">
                <div className="w-40"><MarginInput label="Top" value={top} onChange={setTop} /></div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1"><MarginInput label="Left" value={left} onChange={setLeft} /></div>
                <div className="w-16 h-16 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center shrink-0">
                  <Crop className="h-5 w-5 text-lime-400/50" />
                </div>
                <div className="flex-1"><MarginInput label="Right" value={right} onChange={setRight} /></div>
              </div>
              <div className="flex justify-center mt-2">
                <div className="w-40"><MarginInput label="Bottom" value={bottom} onChange={setBottom} /></div>
              </div>
            </div>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-300">Pages cropped</p>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'cropped.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleCrop}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-lime-500 hover:bg-lime-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(132,204,22,0.25)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Cropping…</> : <><Crop className="h-4 w-4" /> Crop Pages</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
