"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Hash, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Position = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
type Format = 'n' | 'Page n' | 'n / N' | 'Page n of N';

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'top-left',      label: '↖ Top Left' },
  { value: 'top-center',    label: '↑ Top Center' },
  { value: 'top-right',     label: '↗ Top Right' },
  { value: 'bottom-left',   label: '↙ Bottom Left' },
  { value: 'bottom-center', label: '↓ Bottom Center' },
  { value: 'bottom-right',  label: '↘ Bottom Right' },
];

const FORMATS: { value: Format; label: string }[] = [
  { value: 'n',           label: '1, 2, 3…' },
  { value: 'Page n',      label: 'Page 1, Page 2…' },
  { value: 'n / N',       label: '1 / 10, 2 / 10…' },
  { value: 'Page n of N', label: 'Page 1 of 10…' },
];

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [format, setFormat] = useState<Format>('n');
  const [startFrom, setStartFrom] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [color, setColor] = useState('#888888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleApply = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('position', position);
      fd.append('format', format);
      fd.append('startFrom', String(startFrom));
      fd.append('fontSize', String(fontSize));
      fd.append('color', color);
      const res = await fetch('/api/page-numbers', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Page numbers added!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add page numbers.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const preview = format.replace(/n/g, String(startFrom)).replace(/N/g, '?');

  return (
    <ToolPageLayout
      title="Add Page Numbers"
      description="Stamp page numbers on every page — choose position, format, font size, and colour."
      icon={<Hash className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Six position options — top and bottom rows',
        'Four number formats including total pages',
        'Choose the starting page number',
        'Custom font size and colour',
        'Live preview before processing',
        'Processed server-side with pdf-lib',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — stamp page numbers in any position"
          accentClass="border-teal-500/60 bg-teal-500/[0.06] shadow-[0_0_40px_rgba(20,184,166,0.12)]"
          buttonClass="bg-teal-500 hover:bg-teal-400 shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
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
            <p className="text-sm font-semibold text-white/70">Page number options</p>

            <div>
              <p className="text-xs text-white/40 mb-2">Position</p>
              <div className="grid grid-cols-3 gap-1.5">
                {POSITIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPosition(p.value)}
                    className={cn(
                      'py-2 px-2 rounded-lg border text-xs font-medium transition-all',
                      position === p.value
                        ? 'border-teal-500/50 bg-teal-500/[0.10] text-teal-300'
                        : 'border-white/[0.06] text-white/35 hover:border-white/[0.12] hover:text-white/60'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-2">Format</p>
              <div className="grid grid-cols-2 gap-1.5">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={cn(
                      'py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left',
                      format === f.value
                        ? 'border-teal-500/50 bg-teal-500/[0.10] text-teal-300'
                        : 'border-white/[0.06] text-white/35 hover:border-white/[0.12] hover:text-white/60'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-2">Start from</p>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={startFrom}
                  onChange={(e) => setStartFrom(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-2">Size (pt)</p>
                <input
                  type="number"
                  min={6}
                  max={36}
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.min(36, Math.max(6, parseInt(e.target.value) || 11)))}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-2">Color</p>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/[0.10] p-0.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <Hash className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              <p className="text-xs text-white/40">
                Preview: <span className="text-white/70 font-mono">{preview}</span>
                <span className="text-white/25 ml-2">· placed at {position.replace('-', ' ')}</span>
              </p>
            </div>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-300">Page numbers added</p>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'numbered.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying…</> : <><Hash className="h-4 w-4" /> Add Page Numbers</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
