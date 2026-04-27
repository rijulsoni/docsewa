"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { RotateCw, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

const ANGLES = [
  { label: '90° CW', value: 90 },
  { label: '180°', value: 180 },
  { label: '270° CW', value: 270 },
];

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [pagesMode, setPagesMode] = useState<'all' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleRotate = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    if (pagesMode === 'custom' && !customPages.trim()) {
      toast.error('Enter page numbers (e.g. 1, 3-5)'); return;
    }
    setIsProcessing(true); setResultUrl(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('angle', String(angle));
      formData.append('pages', pagesMode === 'all' ? 'all' : customPages);
      const res = await fetch('/api/rotate-pdf', { method: 'POST', body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('PDF rotated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rotation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Rotate PDF"
      description="Rotate all or specific pages in your PDF by 90°, 180°, or 270°."
      icon={<RotateCw className="h-7 w-7" />}
      accentColor="rgba(234,179,8,0.35)"
      features={[
        'Rotate all pages or a custom selection',
        'Choose 90°, 180°, or 270° clockwise',
        'Comma and hyphen notation for page ranges',
        'Processed server-side with pdf-lib',
        'Rotation stacks with existing page orientation',
        'Result ready to download instantly',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — rotate all or specific pages"
          accentClass="border-yellow-500/60 bg-yellow-500/[0.06] shadow-[0_0_40px_rgba(234,179,8,0.12)]"
          buttonClass="bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_16px_rgba(234,179,8,0.25)]"
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
            <button onClick={() => { setFile(null); setResultUrl(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-5">
            <p className="text-sm font-semibold text-white/70">Rotation options</p>

            <div>
              <p className="text-xs text-white/40 mb-2">Rotation angle</p>
              <div className="flex gap-2">
                {ANGLES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAngle(a.value)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                      angle === a.value
                        ? 'border-yellow-500/50 bg-yellow-500/[0.10] text-yellow-300'
                        : 'border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60'
                    }`}
                  >
                    <RotateCw className={`h-5 w-5 ${a.value === 180 ? 'rotate-90' : a.value === 270 ? 'rotate-180' : ''}`} />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-2">Which pages?</p>
              <div className="flex gap-2 mb-3">
                {(['all', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPagesMode(mode)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                      pagesMode === mode
                        ? 'border-yellow-500/50 bg-yellow-500/[0.10] text-yellow-300'
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
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-yellow-500/50"
                />
              )}
            </div>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">PDF rotated successfully</p>
                  <p className="text-xs text-emerald-400/60">Ready to download</p>
                </div>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'rotated.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleRotate}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(234,179,8,0.25)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Rotating…</> : <><RotateCw className="h-4 w-4" /> Rotate PDF</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
