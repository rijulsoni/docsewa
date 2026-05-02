"use client"
import React, { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Globe, Upload, Download, X } from 'lucide-react';
import { toast } from 'sonner';

const SIZES = [16, 32, 48, 64, 128, 192, 512];

interface FaviconPreview {
  size: number;
  dataUrl: string;
}

export default function FaviconGeneratorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<FaviconPreview[]>([]);
  const [generating, setGenerating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }
    setImageFile(file);
    setPreviews([]);
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadImage(file);
  };

  const generate = () => {
    if (!imageSrc) return;
    setGenerating(true);
    const img = new Image();
    img.onload = () => {
      const results: FaviconPreview[] = SIZES.map((size) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, size, size);
        return { size, dataUrl: canvas.toDataURL('image/png') };
      });
      setPreviews(results);
      setGenerating(false);
      toast.success('Favicons generated successfully!');
    };
    img.onerror = () => {
      toast.error('Failed to load image.');
      setGenerating(false);
    };
    img.src = imageSrc;
  };

  const downloadOne = (preview: FaviconPreview) => {
    const a = document.createElement('a');
    a.href = preview.dataUrl;
    a.download = `favicon-${preview.size}x${preview.size}.png`;
    a.click();
  };

  const reset = () => {
    setImageSrc(null);
    setImageFile(null);
    setPreviews([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <ToolPageLayout
      title="Favicon Generator"
      description="Upload any image and instantly generate favicon PNG files at 7 standard sizes — preview and download each one."
      icon={<Globe className="h-7 w-7" />}
      accentColor="rgba(251,146,60,0.35)"
      features={[
        'Generate favicon PNG files at 7 standard sizes',
        '16×16, 32×32, 48×48, 64×64, 128×128, 192×192, 512×512',
        'Preview each size before downloading',
        'Download any size as PNG',
        'Works with any image format',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Upload zone */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Source Image</p>
          {!imageSrc ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-12 cursor-pointer transition-all ${dragging ? 'border-orange-400/60 bg-orange-500/[0.06]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'}`}
            >
              <Upload className="h-8 w-8 text-white/30" />
              <p className="text-sm text-white/40">Drop image here or <span className="text-orange-400/80 underline">browse</span></p>
              <p className="text-xs text-white/20">PNG, JPG, WebP, GIF, SVG</p>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={imageSrc} alt="preview" className="w-16 h-16 object-contain rounded-xl border border-white/[0.08] bg-white/[0.04]" />
                  <div>
                    <p className="text-sm text-white/70 font-medium truncate max-w-[200px]">{imageFile?.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">{imageFile ? (imageFile.size / 1024).toFixed(1) + ' KB' : ''}</p>
                  </div>
                </div>
                <button onClick={reset} className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={generate}
                disabled={generating}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 transition-all disabled:opacity-50"
              >
                {generating ? 'Generating…' : 'Generate Favicons'}
              </button>
            </div>
          )}
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Generated Favicons</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {previews.map((p) => (
                <div key={p.size} className="flex flex-col items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
                  <div className="flex items-center justify-center w-full" style={{ minHeight: 72 }}>
                    <img
                      src={p.dataUrl}
                      alt={`${p.size}x${p.size}`}
                      style={{ width: Math.min(p.size, 64), height: Math.min(p.size, 64) }}
                      className="rounded"
                    />
                  </div>
                  <p className="text-xs text-white/50">{p.size}×{p.size}</p>
                  <button
                    onClick={() => downloadOne(p)}
                    className="flex items-center gap-1.5 text-xs text-orange-300/80 hover:text-orange-300 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
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
