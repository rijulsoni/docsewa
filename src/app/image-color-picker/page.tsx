"use client"
import React, { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Pipette, Copy, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PickedColor { hex: string; r: number; g: number; b: number }

function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export default function ImageColorPickerPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const [hover, setHover]     = useState<PickedColor | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [picked, setPicked]   = useState<PickedColor[]>([]);
  const [loaded, setLoaded]   = useState(false);

  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current!;
      const maxW = 640;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setLoaded(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) loadImage(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const getColor = useCallback((e: React.MouseEvent<HTMLCanvasElement>): PickedColor | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top)  * scaleY);
    const ctx = canvas.getContext('2d')!;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return { hex: toHex(r, g, b), r, g, b };
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = getColor(e);
    if (c) {
      setHover(c);
      setHoverPos({ x: e.clientX, y: e.clientY });
    }
  };

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = getColor(e);
    if (c) setPicked((prev) => prev.length < 20 ? [c, ...prev] : prev);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`${hex} copied!`);
  };

  return (
    <ToolPageLayout
      title="Image Color Picker"
      description="Upload any image, hover to preview colors, and click any pixel to save its HEX and RGB values."
      icon={<Pipette className="h-7 w-7" />}
      accentColor="rgba(236,72,153,0.35)"
      features={[
        'Upload any image and click to pick colors',
        'Real-time color preview on hover',
        'Save up to 20 picked colors',
        'See HEX and RGB values instantly',
        'Copy any HEX code to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Upload zone */}
        {!loaded && (
          <label
            className="cursor-pointer block"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            <div className="border-2 border-dashed border-white/[0.08] rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-pink-500/40 hover:bg-pink-500/[0.03] transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <Upload className="h-6 w-6 text-white/30" />
              </div>
              <p className="text-sm text-white/50">Drop an image or click to browse</p>
              <p className="text-xs text-white/25">PNG, JPG, WebP, GIF, SVG</p>
            </div>
          </label>
        )}

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={`w-full rounded-2xl cursor-crosshair ${loaded ? 'block' : 'hidden'}`}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setHover(null)}
            onClick={onClick}
          />
          {/* Hover tooltip */}
          {hover && loaded && (
            <div
              className="fixed z-50 pointer-events-none flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d0d0f]/95 border border-white/[0.1] shadow-xl text-xs"
              style={{ left: hoverPos.x + 16, top: hoverPos.y - 16 }}
            >
              <span className="w-5 h-5 rounded-md border border-white/20 shrink-0" style={{ background: hover.hex }} />
              <span className="font-mono text-white/80">{hover.hex}</span>
              <span className="text-white/40">rgb({hover.r},{hover.g},{hover.b})</span>
            </div>
          )}
        </div>

        {loaded && (
          <p className="text-xs text-white/30 text-center">Click any pixel to save its color · {20 - picked.length} slots remaining</p>
        )}

        {/* Picked colors */}
        {picked.length > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Picked Colors ({picked.length})</p>
              <button onClick={() => setPicked([])} className="text-xs text-white/25 hover:text-red-400 transition-colors">Clear all</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {picked.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <span className="w-8 h-8 rounded-lg shrink-0 border border-white/10" style={{ background: c.hex }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-white/70">{c.hex}</p>
                    <p className="text-[10px] text-white/30">rgb({c.r},{c.g},{c.b})</p>
                  </div>
                  <button onClick={() => copyHex(c.hex)} className="p-1 rounded-lg text-white/25 hover:text-pink-400 transition-colors shrink-0">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button onClick={() => setPicked((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 rounded-lg text-white/25 hover:text-red-400 transition-colors shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
