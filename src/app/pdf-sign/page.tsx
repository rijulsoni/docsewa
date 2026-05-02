"use client"
import React, { useState, useRef, useEffect } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { PenLine, Download, Loader2, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const CORNERS: { key: Corner; label: string }[] = [
  { key: 'top-left',     label: '↖ Top left' },
  { key: 'top-right',    label: '↗ Top right' },
  { key: 'bottom-left',  label: '↙ Bottom left' },
  { key: 'bottom-right', label: '↘ Bottom right' },
];

export default function PdfSignPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [page, setPage]               = useState(1);
  const [corner, setCorner]           = useState<Corner>('bottom-right');
  const [scale, setScale]             = useState(100);
  const [hasSig, setHasSig]           = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [done, setDone]               = useState(false);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#a5b4fc';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  };

  useEffect(() => { initCanvas(); }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
  };

  const handlePointerUp = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas();
    setHasSig(false);
  };

  const handleSign = async () => {
    if (!file || !hasSig) return;
    setProcessing(true); setDone(false);
    try {
      const dataUrl = canvasRef.current!.toDataURL('image/png');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('signatureDataUrl', dataUrl);
      fd.append('page', String(page));
      fd.append('position', corner);
      fd.append('scale', String(scale));
      const res = await fetch('/api/pdf-sign', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, '') + '_signed.pdf';
      a.click();
      setDone(true);
      toast.success('PDF signed!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign PDF.');
    } finally { setProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="PDF Sign"
      description="Draw your signature on a canvas and embed it on any page of your PDF."
      icon={<PenLine className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Draw your signature with mouse or touch',
        'Choose any page and corner for placement',
        'Adjust signature scale from 50% to 150%',
        'Signature is permanently embedded as an image',
        'Processed server-side with pdf-lib',
        'Works on all standard PDF files',
      ]}
    >
      <div className="space-y-4">
        {/* Upload */}
        {!file ? (
          <UploadDropzone
            onFiles={(files) => {
              const f = files[0];
              if (!f.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files are supported.'); return; }
              setFile(f); setDone(false);
            }}
            accept=".pdf"
            fileLabel="PDF"
            hint="Drop the PDF you want to sign"
            accentClass="border-indigo-500/60 bg-indigo-500/[0.06] shadow-[0_0_40px_rgba(99,102,241,0.12)]"
            buttonClass="bg-indigo-500 hover:bg-indigo-400 shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
            icon="file"
          />
        ) : (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <PenLine className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setDone(false); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Signature pad */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Signature</p>
            <button onClick={clearCanvas}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={560}
            height={140}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-36 rounded-xl border border-white/[0.08] bg-white/[0.02] cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
          />
          {!hasSig && (
            <p className="text-xs text-white/20 text-center mt-2">Draw your signature above</p>
          )}
        </div>

        {/* Placement options */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Page Number</p>
              <input
                type="number" min={1} value={page}
                onChange={(e) => setPage(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-indigo-500/40"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Scale</p>
                <p className="text-xs font-semibold text-indigo-300">{scale}%</p>
              </div>
              <input type="range" min={50} max={150} value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-indigo-500" />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Position</p>
            <div className="grid grid-cols-2 gap-2">
              {CORNERS.map(({ key, label }) => (
                <button key={key} onClick={() => setCorner(key)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                    corner === key
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSign}
          disabled={isProcessing || !file || !hasSig}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
        >
          {isProcessing
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Embedding signature…</>
            : done
            ? <><Download className="h-4 w-4" /> Download Again</>
            : <><PenLine className="h-4 w-4" /> Sign &amp; Download PDF</>}
        </button>
      </div>
    </ToolPageLayout>
  );
}
