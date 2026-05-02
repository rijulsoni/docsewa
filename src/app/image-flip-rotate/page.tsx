"use client"
import React, { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FlipHorizontal2, Download, X } from 'lucide-react';
import { toast } from 'sonner';

type OutFmt = 'png' | 'jpg';

export default function ImageFlipRotatePage() {
  const [file, setFile]     = useState<File | null>(null);
  const [ready, setReady]   = useState(false);
  const [outFmt, setOutFmt] = useState<OutFmt>('png');

  // Working canvas — holds the current transformed state
  const workRef    = useRef<HTMLCanvasElement>(null);
  // Preview canvas — mirrors workRef for display
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Load the initial image onto the working canvas
  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Upload an image file.'); return; }
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const wc = workRef.current!;
      const pc = previewRef.current!;
      wc.width  = img.naturalWidth;
      wc.height = img.naturalHeight;
      wc.getContext('2d')!.drawImage(img, 0, 0);
      // Mirror to preview
      pc.width  = wc.width;
      pc.height = wc.height;
      pc.getContext('2d')!.drawImage(wc, 0, 0);
      setReady(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const syncPreview = useCallback(() => {
    const wc = workRef.current!;
    const pc = previewRef.current!;
    pc.width  = wc.width;
    pc.height = wc.height;
    pc.getContext('2d')!.drawImage(wc, 0, 0);
  }, []);

  const applyTransform = useCallback((type: 'flipH' | 'flipV' | 'rotCW' | 'rotCCW') => {
    const wc = workRef.current!;
    const srcW = wc.width;
    const srcH = wc.height;

    // Create a temp copy of current state
    const tmp = document.createElement('canvas');
    tmp.width  = srcW;
    tmp.height = srcH;
    tmp.getContext('2d')!.drawImage(wc, 0, 0);

    if (type === 'flipH') {
      const ctx = wc.getContext('2d')!;
      ctx.clearRect(0, 0, srcW, srcH);
      ctx.save();
      ctx.translate(srcW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
    } else if (type === 'flipV') {
      const ctx = wc.getContext('2d')!;
      ctx.clearRect(0, 0, srcW, srcH);
      ctx.save();
      ctx.translate(0, srcH);
      ctx.scale(1, -1);
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
    } else if (type === 'rotCW') {
      // New dimensions: width=srcH, height=srcW
      wc.width  = srcH;
      wc.height = srcW;
      const ctx = wc.getContext('2d')!;
      ctx.save();
      ctx.translate(srcH, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
    } else if (type === 'rotCCW') {
      // New dimensions: width=srcH, height=srcW
      wc.width  = srcH;
      wc.height = srcW;
      const ctx = wc.getContext('2d')!;
      ctx.save();
      ctx.translate(0, srcW);
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
    }

    syncPreview();
  }, [syncPreview]);

  const handleDownload = async () => {
    const wc = workRef.current;
    if (!wc || !file) return;
    const mime = outFmt === 'jpg' ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob>((res) => wc.toBlob((b) => res(b!), mime, 0.92));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, `_transformed.${outFmt}`);
    a.click();
    toast.success('Image downloaded');
  };

  const reset = () => { setFile(null); setReady(false); };

  const btnBase = 'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white/90 hover:border-orange-500/30 active:scale-95';

  return (
    <ToolPageLayout
      title="Image Flip &amp; Rotate"
      description="Flip horizontally or vertically, rotate 90° in either direction. Chain transforms and download."
      icon={<FlipHorizontal2 className="h-7 w-7" />}
      accentColor="rgba(251,146,60,0.35)"
      features={[
        'Flip image horizontally or vertically',
        'Rotate 90° left or right with one click',
        'Chain multiple transforms together',
        'Live preview after each transform',
        'Download as PNG or JPG',
        'Runs entirely in your browser',
      ]}
    >
      {/* Hidden working canvas — never shown directly */}
      <canvas ref={workRef} className="hidden" />

      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="image/*"
          fileLabel="image"
          hint="JPG, PNG, WebP — any raster image"
          accentClass="border-orange-400/60 bg-orange-400/[0.06] shadow-[0_0_40px_rgba(251,146,60,0.12)]"
          buttonClass="bg-orange-500 hover:bg-orange-400 shadow-[0_4px_16px_rgba(251,146,60,0.3)]"
          icon="image"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <FlipHorizontal2 className="h-5 w-5 text-orange-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">
                {ready && workRef.current
                  ? `${workRef.current.width}×${workRef.current.height} px`
                  : 'Loading…'}
              </p>
            </div>
            <button
              onClick={reset}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preview */}
          {ready && (
            <div className="glass-card rounded-2xl p-3 flex items-center justify-center overflow-hidden">
              <canvas
                ref={previewRef}
                className="rounded-xl border border-white/[0.06] object-contain"
                style={{ maxWidth: '100%', maxHeight: 400 }}
              />
            </div>
          )}

          {/* Transform buttons */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Transform</p>
            <div className="flex gap-2">
              <button onClick={() => applyTransform('flipH')} disabled={!ready} className={btnBase}>
                ↔ Flip Horizontal
              </button>
              <button onClick={() => applyTransform('flipV')} disabled={!ready} className={btnBase}>
                ↕ Flip Vertical
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => applyTransform('rotCCW')} disabled={!ready} className={btnBase}>
                ↺ Rotate 90° Left
              </button>
              <button onClick={() => applyTransform('rotCW')} disabled={!ready} className={btnBase}>
                ↻ Rotate 90° Right
              </button>
            </div>
          </div>

          {/* Format + download */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {(['png', 'jpg'] as OutFmt[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOutFmt(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    outFmt === f
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                      : 'border-white/[0.08] text-white/40 hover:bg-white/[0.04]'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={handleDownload}
              disabled={!ready}
              className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(251,146,60,0.3)]"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
