"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { PanelTop, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Position  = 'header' | 'footer';
type Alignment = 'left' | 'center' | 'right';

export default function HeaderFooterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText]           = useState('');
  const [position, setPosition]   = useState<Position>('footer');
  const [alignment, setAlignment] = useState<Alignment>('center');
  const [fontSize, setFontSize]   = useState(11);
  const [color, setColor]         = useState('#888888');
  const [margin, setMargin]       = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleApply = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    if (!text.trim()) { toast.error('Enter the header/footer text.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('text', text);
      fd.append('position', position);
      fd.append('alignment', alignment);
      fd.append('fontSize', String(fontSize));
      fd.append('color', color);
      fd.append('margin', String(margin));
      const res = await fetch('/api/header-footer', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success(`${position === 'header' ? 'Header' : 'Footer'} added!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add header/footer.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const previewText = text
    .replace(/\{page\}/g, '1')
    .replace(/\{total\}/g, '?')
    || 'Your text here';

  return (
    <ToolPageLayout
      title="Header / Footer"
      description="Stamp custom text at the top or bottom of every page — with alignment and styling options."
      icon={<PanelTop className="h-7 w-7" />}
      accentColor="rgba(217,70,239,0.35)"
      features={[
        'Add a header or footer to every page',
        'Left, centre, or right alignment',
        'Use {page} and {total} for page numbers',
        'Custom font size and colour',
        'Configurable margin from the edge',
        'Processed server-side with pdf-lib',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — stamp a header or footer on every page"
          accentClass="border-fuchsia-500/60 bg-fuchsia-500/[0.06] shadow-[0_0_40px_rgba(217,70,239,0.12)]"
          buttonClass="bg-fuchsia-500 hover:bg-fuchsia-400 shadow-[0_4px_16px_rgba(217,70,239,0.3)]"
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
            <p className="text-sm font-semibold text-white/70">Header / Footer options</p>

            {/* Text */}
            <div>
              <p className="text-xs text-white/40 mb-1.5">
                Text <span className="text-white/20">— use {'{page}'} and {'{total}'} for page numbers</span>
              </p>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Confidential · {page} of {total}"
                maxLength={120}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-fuchsia-500/50"
              />
            </div>

            {/* Position & Alignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-2">Position</p>
                <div className="flex gap-2">
                  {(['header', 'footer'] as Position[]).map((p) => (
                    <button key={p} onClick={() => setPosition(p)} className={cn(
                      'flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-all',
                      position === p ? 'border-fuchsia-500/50 bg-fuchsia-500/[0.10] text-fuchsia-300' : 'border-white/[0.06] text-white/40 hover:border-white/[0.12]'
                    )}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-2">Alignment</p>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as Alignment[]).map((a) => (
                    <button key={a} onClick={() => setAlignment(a)} className={cn(
                      'flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-all',
                      alignment === a ? 'border-fuchsia-500/50 bg-fuchsia-500/[0.10] text-fuchsia-300' : 'border-white/[0.06] text-white/40 hover:border-white/[0.12]'
                    )}>{a}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font size, color, margin */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1.5">Size (pt)</p>
                <input type="number" min={6} max={36} value={fontSize}
                  onChange={(e) => setFontSize(Math.min(36, Math.max(6, parseInt(e.target.value) || 11)))}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 focus:outline-none focus:border-fuchsia-500/50"
                />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1.5">Colour</p>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/[0.10] p-0.5"
                />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1.5">Margin (pt)</p>
                <input type="number" min={10} max={100} value={margin}
                  onChange={(e) => setMargin(Math.min(100, Math.max(10, parseInt(e.target.value) || 30)))}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 focus:outline-none focus:border-fuchsia-500/50"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="relative h-20 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className={cn(
                'absolute inset-x-0 px-3 py-1.5 flex',
                position === 'header' ? 'top-0 border-b border-fuchsia-500/20 bg-fuchsia-500/[0.04]' : 'bottom-0 border-t border-fuchsia-500/20 bg-fuchsia-500/[0.04]',
                alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'
              )}>
                <span style={{ fontSize: Math.max(9, fontSize * 0.7), color, fontFamily: 'Helvetica, sans-serif' }}>
                  {previewText}
                </span>
              </div>
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-white/15">preview</span>
            </div>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-300">
                  {position === 'header' ? 'Header' : 'Footer'} added to all pages
                </p>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'header-footer.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(217,70,239,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying…</> : <><PanelTop className="h-4 w-4" /> Add {position === 'header' ? 'Header' : 'Footer'}</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
