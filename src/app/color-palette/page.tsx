"use client"
import React, { useState, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Palette, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SwatchColor {
  hex: string;
  r: number;
  g: number;
  b: number;
}

const quantize = (v: number) => Math.round(v / 16) * 16;

function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export default function ColorPalettePage() {
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colorCount, setColorCount] = useState(8);
  const [palette, setPalette]       = useState<SwatchColor[]>([]);
  const [isExtracting, setExtracting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFile = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    setImageFile(f);
    setPalette([]);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleExtract = () => {
    if (!imageFile || !previewUrl) { toast.error('Upload an image first.'); return; }
    setExtracting(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) { setExtracting(false); return; }
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setExtracting(false); return; }
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Sample every 4th pixel and bucket by quantized RGB
      const freq = new Map<string, number>();
      for (let i = 0; i < width * height; i += 4) {
        const idx = i * 4;
        const r = quantize(data[idx]);
        const g = quantize(data[idx + 1]);
        const b = quantize(data[idx + 2]);
        const a = data[idx + 3];
        if (a < 128) continue; // skip transparent
        const key = `${r},${g},${b}`;
        freq.set(key, (freq.get(key) ?? 0) + 1);
      }

      const sorted = [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount);

      const extracted: SwatchColor[] = sorted.map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b, hex: toHex(r, g, b) };
      });

      setPalette(extracted);
      setExtracting(false);
      toast.success(`${extracted.length} colors extracted!`);
    };
    img.onerror = () => {
      toast.error('Failed to load image.');
      setExtracting(false);
    };
    img.src = previewUrl;
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex}!`);
  };

  return (
    <ToolPageLayout
      title="Color Palette Extractor"
      description="Upload an image and extract its dominant color palette — get HEX and RGB values instantly."
      icon={<Palette className="h-7 w-7" />}
      accentColor="rgba(236,72,153,0.35)"
      features={[
        'Extract dominant colors from any image',
        'Adjust palette size from 4 to 16 colors',
        'See HEX and RGB values for each color',
        'Copy HEX codes to clipboard',
        'Pure canvas-based color quantization',
        'Runs entirely in your browser',
      ]}
    >
      {/* hidden canvas for pixel processing */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-4">
        {/* Upload */}
        {!imageFile ? (
          <UploadDropzone
            onFiles={onFile}
            accept="image/png,image/jpeg,image/webp"
            multiple={false}
            fileLabel="image"
            hint="PNG, JPG, or WebP — drop here"
            accentClass="border-pink-500/60 bg-pink-500/[0.06] shadow-[0_0_40px_rgba(236,72,153,0.12)]"
            buttonClass="bg-pink-500 hover:bg-pink-400 shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
            icon="image"
          />
        ) : (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-white/[0.08] shrink-0" />
            )}
            <p className="text-sm text-white/60 truncate flex-grow min-w-0">{imageFile.name}</p>
            <button
              onClick={() => { setImageFile(null); setPreviewUrl(null); setPalette([]); }}
              className="text-xs text-white/25 hover:text-red-400 transition-colors shrink-0"
            >
              Remove
            </button>
          </div>
        )}

        {/* Color count slider */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Colors to Extract</p>
            <span className="text-sm font-bold text-pink-300">{colorCount}</span>
          </div>
          <input
            type="range"
            min={4}
            max={16}
            value={colorCount}
            onChange={(e) => { setColorCount(Number(e.target.value)); setPalette([]); }}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs text-white/25">
            <span>4</span>
            <span>16</span>
          </div>
        </div>

        {/* Extract button */}
        {imageFile && (
          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-pink-500 hover:bg-pink-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
          >
            {isExtracting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</>
              : <><Palette className="h-4 w-4" /> Extract Palette</>}
          </button>
        )}

        {/* Palette swatches */}
        {palette.length > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Palette</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {palette.map((color) => (
                <div
                  key={color.hex}
                  className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]"
                >
                  <div
                    className="w-full h-16"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-mono font-semibold text-white/70">{color.hex}</p>
                    <p className="text-[10px] text-white/30 font-mono">
                      {color.r}, {color.g}, {color.b}
                    </p>
                    <button
                      onClick={() => copyHex(color.hex)}
                      className="w-full flex items-center justify-center gap-1 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-white/40 hover:text-white/70 transition-colors border border-white/[0.06]"
                    >
                      <Copy className="h-2.5 w-2.5" /> Copy HEX
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
