"use client"
import React, { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Scaling, Download, X } from 'lucide-react';
import { toast } from 'sonner';

type OutFmt = 'png' | 'jpg' | 'webp';
const MIME: Record<OutFmt, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

export default function ImageResizePage() {
  const [file, setFile]         = useState<File | null>(null);
  const [imgSrc, setImgSrc]     = useState<string | null>(null);
  const [natural, setNatural]   = useState({ w: 0, h: 0 });
  const [outW, setOutW]         = useState(0);
  const [outH, setOutH]         = useState(0);
  const [lockAspect, setLock]   = useState(true);
  const [outFmt, setOutFmt]     = useState<OutFmt>('png');

  const imgRef = useRef<HTMLImageElement>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Upload an image file.'); return; }
    setFile(f);
    setImgSrc(URL.createObjectURL(f));
  };

  const onLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    setOutW(img.naturalWidth);
    setOutH(img.naturalHeight);
  }, []);

  const handleWidthChange = (v: number) => {
    const n = Math.max(1, v);
    setOutW(n);
    if (lockAspect && natural.w > 0) setOutH(Math.round(n * natural.h / natural.w));
  };

  const handleHeightChange = (v: number) => {
    const n = Math.max(1, v);
    setOutH(n);
    if (lockAspect && natural.h > 0) setOutW(Math.round(n * natural.w / natural.h));
  };

  const handleResize = async () => {
    if (!imgRef.current || !file) return;
    const canvas = document.createElement('canvas');
    canvas.width  = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imgRef.current, 0, 0, outW, outH);
    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), MIME[outFmt], outFmt === 'png' ? undefined : 0.92)
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, `_${outW}x${outH}.${outFmt}`);
    a.click();
    toast.success(`Resized to ${outW}×${outH} px`);
  };

  const reset = () => { setFile(null); setImgSrc(null); setNatural({ w: 0, h: 0 }); };

  return (
    <ToolPageLayout
      title="Image Resize"
      description="Set exact pixel dimensions, lock aspect ratio, and download in PNG, JPG, or WebP."
      icon={<Scaling className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Set exact output pixel dimensions',
        'Lock aspect ratio to prevent distortion',
        'Supports PNG, JPG and WebP output formats',
        'Runs entirely in your browser — no uploads',
        'Works on any raster image format',
        'Shows before and after dimensions',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="image/*"
          fileLabel="image"
          hint="JPG, PNG, WebP — any raster image"
          accentClass="border-blue-400/60 bg-blue-400/[0.06] shadow-[0_0_40px_rgba(59,130,246,0.12)]"
          buttonClass="bg-blue-500 hover:bg-blue-400 shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          icon="image"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            {imgSrc && (
              <img src={imgSrc} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/[0.06]" />
            )}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">
                {natural.w > 0 ? `Original: ${natural.w}×${natural.h} px` : 'Loading…'}
              </p>
            </div>
            <button
              onClick={reset}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hidden image for natural dimensions */}
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="resize source"
              onLoad={onLoad}
              className="hidden"
            />
          )}

          {/* Controls */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output Dimensions</p>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-1.5">Width (px)</p>
                <input
                  type="number"
                  min={1}
                  value={outW || ''}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-blue-500/40"
                />
              </div>
              <span className="pb-2 text-white/20">×</span>
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-1.5">Height (px)</p>
                <input
                  type="number"
                  min={1}
                  value={outH || ''}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-blue-500/40"
                />
              </div>
            </div>

            {natural.w > 0 && (outW !== natural.w || outH !== natural.h) && (
              <p className="text-xs text-blue-400/70">
                {natural.w}×{natural.h} → {outW}×{outH} px
              </p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLock(e.target.checked)}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-xs text-white/40">Lock aspect ratio</span>
              </label>

              <div className="flex gap-2">
                {(['png', 'jpg', 'webp'] as OutFmt[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOutFmt(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      outFmt === f
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                        : 'border-white/[0.08] text-white/40 hover:bg-white/[0.04]'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleResize}
            disabled={!imgSrc || outW < 1 || outH < 1}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          >
            <Download className="h-4 w-4" /> Resize &amp; Download
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
