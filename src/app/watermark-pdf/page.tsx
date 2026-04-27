"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Stamp, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.2);
  const [fontSize, setFontSize] = useState(60);
  const [color, setColor] = useState('#808080');
  const [angle, setAngle] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleApply = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    if (!text.trim()) { toast.error('Watermark text cannot be empty.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('text', text);
      fd.append('opacity', String(opacity));
      fd.append('fontSize', String(fontSize));
      fd.append('color', color);
      fd.append('angle', String(angle));
      const res = await fetch('/api/watermark-pdf', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Watermark added!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add watermark.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Watermark PDF"
      description="Stamp custom text diagonally across every page of your PDF."
      icon={<Stamp className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Custom text watermark on every page',
        'Control opacity, font size, and angle',
        'Pick any colour with the colour picker',
        'Live preview before applying',
        'Processed server-side with pdf-lib',
        'Result downloads instantly as PDF',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — stamp custom watermark text on every page"
          accentClass="border-purple-500/60 bg-purple-500/[0.06] shadow-[0_0_40px_rgba(168,85,247,0.12)]"
          buttonClass="bg-purple-500 hover:bg-purple-400 shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
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
            <p className="text-sm font-semibold text-white/70">Watermark options</p>

            <div>
              <p className="text-xs text-white/40 mb-2">Watermark text</p>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
                maxLength={80}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-2">Color</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/[0.10] p-0.5"
                  />
                  <span className="text-xs font-mono text-white/40">{color.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 mb-2">Angle: {angle}°</p>
                <input type="range" min={0} max={90} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>

              <div>
                <p className="text-xs text-white/40 mb-2">Opacity: {Math.round(opacity * 100)}%</p>
                <input type="range" min={5} max={80} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full accent-purple-500" />
              </div>

              <div>
                <p className="text-xs text-white/40 mb-2">Font size: {fontSize}pt</p>
                <input type="range" min={20} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
            </div>

            <div className="relative h-20 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden flex items-center justify-center" aria-label="Preview">
              <span
                style={{
                  fontSize: Math.max(12, fontSize / 4),
                  color,
                  opacity,
                  transform: `rotate(-${angle}deg)`,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                {text || 'Preview'}
              </span>
              <span className="absolute bottom-1 right-2 text-[10px] text-white/20">preview</span>
            </div>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-300">Watermark applied</p>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'watermarked.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying…</> : <><Stamp className="h-4 w-4" /> Add Watermark</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
