"use client"
import React, { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { BoxSelect, Download, X } from 'lucide-react';
import { toast } from 'sonner';

type Fmt = 'png' | 'jpg';
type DragType = 'move' | 'tl' | 'tr' | 'bl' | 'br';
interface Crop { x: number; y: number; w: number; h: number }

export default function ImageCropPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [imgSrc, setImgSrc]     = useState<string | null>(null);
  const [natural, setNatural]   = useState({ w: 0, h: 0 });
  const [crop, setCrop]         = useState<Crop>({ x: 0, y: 0, w: 0, h: 0 });
  const [lockAspect, setLock]   = useState(false);
  const [outFmt, setOutFmt]     = useState<Fmt>('png');

  const imgRef      = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState   = useRef<{ type: DragType; startX: number; startY: number; crop: Crop } | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Upload an image file.'); return; }
    setFile(f);
    setImgSrc(URL.createObjectURL(f));
  };

  const initCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img || img.naturalWidth === 0) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    const dw = img.offsetWidth;
    const dh = img.offsetHeight;
    setCrop({ x: 0, y: 0, w: dw, h: dh });
  }, []);

  const scale = imgRef.current && natural.w > 0
    ? imgRef.current.offsetWidth / natural.w
    : 1;

  const clamp = (c: Crop, dw: number, dh: number): Crop => ({
    x: Math.max(0, Math.min(c.x, dw - 4)),
    y: Math.max(0, Math.min(c.y, dh - 4)),
    w: Math.max(4, Math.min(c.w, dw - c.x)),
    h: Math.max(4, Math.min(c.h, dh - c.y)),
  });

  const onPointerDown = (e: React.PointerEvent, type: DragType) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { type, startX: e.clientX, startY: e.clientY, crop: { ...crop } };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current || !imgRef.current) return;
    const { type, startX, startY, crop: c0 } = dragState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const dw = imgRef.current.offsetWidth;
    const dh = imgRef.current.offsetHeight;
    const aspect = lockAspect ? c0.w / c0.h : null;

    let next: Crop = { ...c0 };
    if (type === 'move') {
      next = { ...c0, x: c0.x + dx, y: c0.y + dy };
    } else {
      if (type === 'tl')       { next = { x: c0.x + dx, y: c0.y + dy, w: c0.w - dx, h: c0.h - dy }; }
      else if (type === 'tr')  { next = { x: c0.x,       y: c0.y + dy, w: c0.w + dx, h: c0.h - dy }; }
      else if (type === 'bl')  { next = { x: c0.x + dx,  y: c0.y,      w: c0.w - dx, h: c0.h + dy }; }
      else if (type === 'br')  { next = { x: c0.x,       y: c0.y,      w: c0.w + dx, h: c0.h + dy }; }
      if (aspect) next.h = next.w / aspect;
    }
    setCrop(clamp(next, dw, dh));
  };

  const onPointerUp = () => { dragState.current = null; };

  const handleCrop = async () => {
    if (!imgRef.current || !file) return;
    const displayScale = imgRef.current.offsetWidth / natural.w;
    const natX = crop.x / displayScale;
    const natY = crop.y / displayScale;
    const natW = crop.w / displayScale;
    const natH = crop.h / displayScale;

    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(natW);
    canvas.height = Math.round(natH);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, natX, natY, natW, natH, 0, 0, natW, natH);
    const mime = outFmt === 'jpg' ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, 0.92));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, `_crop.${outFmt}`);
    a.click();
    toast.success(`Cropped to ${Math.round(natW)}×${Math.round(natH)} px`);
  };

  const handleWidthChange = (v: number) => {
    if (!imgRef.current) return;
    const dw = imgRef.current.offsetWidth;
    const newW = Math.max(4, Math.min(v * scale, dw - crop.x));
    setCrop((c) => ({ ...c, w: newW, h: lockAspect ? newW / (c.w / c.h) : c.h }));
  };

  const handleHeightChange = (v: number) => {
    if (!imgRef.current) return;
    const dh = imgRef.current.offsetHeight;
    const newH = Math.max(4, Math.min(v * scale, dh - crop.y));
    setCrop((c) => ({ ...c, h: newH, w: lockAspect ? newH * (c.w / c.h) : c.w }));
  };

  const natCropW = Math.round(crop.w / scale);
  const natCropH = Math.round(crop.h / scale);

  const hStyle = 'absolute w-3 h-3 bg-white rounded-sm border-2 border-indigo-400 cursor-pointer z-10 -translate-x-1/2 -translate-y-1/2';

  return (
    <ToolPageLayout
      title="Image Crop & Resize"
      description="Drag crop handles to select any region, lock aspect ratio, and download the result."
      icon={<BoxSelect className="h-7 w-7" />}
      accentColor="rgba(251,146,60,0.35)"
      features={[
        'Draggable corner handles for interactive cropping',
        'Move the crop region by dragging the center',
        'Lock aspect ratio while resizing',
        'Type exact pixel dimensions for precise crops',
        'Download as PNG or JPG',
        'Runs entirely in your browser — no uploads',
      ]}
    >
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
              <BoxSelect className="h-5 w-5 text-orange-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{natural.w > 0 ? `${natural.w}×${natural.h} px` : ''}</p>
            </div>
            <button onClick={() => { setFile(null); setImgSrc(null); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Crop canvas */}
          {imgSrc && (
            <div
              ref={containerRef}
              className="relative select-none glass-card rounded-2xl overflow-hidden"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="crop source"
                onLoad={initCrop}
                className="w-full h-auto block"
                draggable={false}
              />
              {/* Dark mask outside crop */}
              {crop.w > 0 && (
                <>
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: `linear-gradient(to right, rgba(0,0,0,0.55) ${crop.x}px, transparent ${crop.x}px, transparent ${crop.x + crop.w}px, rgba(0,0,0,0.55) ${crop.x + crop.w}px)`,
                  }} />
                  <div className="absolute pointer-events-none" style={{
                    top: 0, left: crop.x, width: crop.w,
                    height: crop.y, background: 'rgba(0,0,0,0.55)',
                  }} />
                  <div className="absolute pointer-events-none" style={{
                    top: crop.y + crop.h, left: crop.x, width: crop.w,
                    bottom: 0, background: 'rgba(0,0,0,0.55)',
                  }} />
                  {/* Crop box border */}
                  <div
                    className="absolute border-2 border-orange-400/70 cursor-move"
                    style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                    onPointerDown={(e) => onPointerDown(e, 'move')}
                  />
                  {/* Corner handles */}
                  <div className={hStyle} style={{ left: crop.x, top: crop.y }}           onPointerDown={(e) => onPointerDown(e, 'tl')} />
                  <div className={hStyle} style={{ left: crop.x + crop.w, top: crop.y }}  onPointerDown={(e) => onPointerDown(e, 'tr')} />
                  <div className={hStyle} style={{ left: crop.x, top: crop.y + crop.h }}  onPointerDown={(e) => onPointerDown(e, 'bl')} />
                  <div className={hStyle} style={{ left: crop.x + crop.w, top: crop.y + crop.h }} onPointerDown={(e) => onPointerDown(e, 'br')} />
                </>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-1.5">Width (px)</p>
                <input type="number" min={1} value={natCropW}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-orange-500/40" />
              </div>
              <span className="pb-2 text-white/20">×</span>
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-1.5">Height (px)</p>
                <input type="number" min={1} value={natCropH}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-orange-500/40" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={lockAspect} onChange={(e) => setLock(e.target.checked)}
                  className="accent-orange-500 w-4 h-4" />
                <span className="text-xs text-white/40">Lock aspect ratio</span>
              </label>
              <div className="flex gap-2">
                {(['png', 'jpg'] as Fmt[]).map((f) => (
                  <button key={f} onClick={() => setOutFmt(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      outFmt === f
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                        : 'border-white/[0.08] text-white/40 hover:bg-white/[0.04]'
                    }`}>{f.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleCrop}
            disabled={!imgSrc || crop.w < 2}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(251,146,60,0.3)]"
          >
            <Download className="h-4 w-4" /> Crop &amp; Download
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
