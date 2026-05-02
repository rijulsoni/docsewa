"use client"
import React, { useState, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Film, X, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface FrameEntry {
  file: File;
  previewUrl: string;
}

export default function GifMakerPage() {
  const [frames, setFrames]           = useState<FrameEntry[]>([]);
  const [frameDelay, setFrameDelay]   = useState(300);
  const [outputWidth, setOutputWidth] = useState(320);
  const [isEncoding, setEncoding]     = useState(false);
  const [progress, setProgress]       = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => f.type.startsWith('image/'));
    if (!valid.length) { toast.error('Only PNG, JPG, or WebP images are supported.'); return; }
    const toAdd = valid.slice(0, 20 - frames.length).map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setFrames((prev) => [...prev, ...toAdd]);
  };

  const removeFrame = (index: number) => {
    setFrames((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreate = async () => {
    if (frames.length < 2) { toast.error('Add at least 2 frames.'); return; }
    setEncoding(true);
    setProgress('Loading frames…');

    const canvas = canvasRef.current;
    if (!canvas) { setEncoding(false); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { setEncoding(false); return; }

    try {
      // @ts-expect-error — gifenc has no type declarations
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

      // Load first image to determine height
      const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = src;
        });

      const firstImg = await loadImage(frames[0].previewUrl);
      const w = outputWidth;
      const h = Math.round((firstImg.naturalHeight / firstImg.naturalWidth) * w);
      canvas.width = w;
      canvas.height = h;

      const gif = GIFEncoder();

      for (let i = 0; i < frames.length; i++) {
        setProgress(`Encoding frame ${i + 1} / ${frames.length}…`);
        const img = await loadImage(frames[i].previewUrl);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const rgba = imageData.data as unknown as Uint8ClampedArray;
        const palette = quantize(rgba, 256);
        const index = applyPalette(rgba, palette);
        gif.writeFrame(index, w, h, { palette, delay: frameDelay });
      }

      setProgress('Finalizing…');
      gif.finish();
      const bytes = gif.bytes() as Uint8Array;
      const blob = new Blob([bytes], { type: 'image/gif' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'output.gif';
      a.click();
      toast.success('GIF downloaded!');
      setProgress('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'GIF creation failed.');
      setProgress('');
    } finally {
      setEncoding(false);
    }
  };

  return (
    <ToolPageLayout
      title="GIF Maker"
      description="Combine up to 20 images into an animated GIF — control frame delay and output width."
      icon={<Film className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Combine up to 20 images into an animated GIF',
        'Control frame delay from 100ms to 1 second',
        'Set output width from 128 to 512 pixels',
        'Drag to reorder frames before encoding',
        'Download the final .gif directly',
        'Runs entirely in your browser',
      ]}
    >
      {/* hidden canvas for frame rendering */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-4">
        {/* Settings */}
        <div className="glass-card rounded-2xl p-5 space-y-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Settings</p>

          {/* Frame delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/60">Frame Delay</label>
              <span className="text-sm font-bold text-teal-300">{frameDelay} ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={frameDelay}
              onChange={(e) => setFrameDelay(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-xs text-white/25">
              <span>100 ms (fast)</span>
              <span>1000 ms (slow)</span>
            </div>
          </div>

          {/* Output width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/60">Output Width</label>
              <span className="text-sm font-bold text-teal-300">{outputWidth} px</span>
            </div>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={outputWidth}
              onChange={(e) => setOutputWidth(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-xs text-white/25">
              <span>128 px</span>
              <span>512 px</span>
            </div>
          </div>
        </div>

        {/* Upload zone */}
        {frames.length < 20 && (
          <UploadDropzone
            onFiles={onFiles}
            accept="image/png,image/jpeg,image/webp"
            multiple
            fileLabel="images"
            hint={`PNG, JPG, WebP — up to ${20 - frames.length} more frames`}
            accentClass="border-teal-500/60 bg-teal-500/[0.06] shadow-[0_0_40px_rgba(20,184,166,0.12)]"
            buttonClass="bg-teal-500 hover:bg-teal-400 shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
            icon="image"
          />
        )}

        {/* Frame list */}
        {frames.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                {frames.length} frame{frames.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => { frames.forEach((f) => URL.revokeObjectURL(f.previewUrl)); setFrames([]); }}
                className="text-xs text-white/25 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-3 p-4 max-h-64 overflow-y-auto">
              {frames.map((frame, i) => (
                <div key={i} className="relative group shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frame.previewUrl}
                    alt={`Frame ${i + 1}`}
                    className="w-20 h-16 object-cover rounded-lg border border-white/[0.08]"
                  />
                  <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeFrame(i)}
                      className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white/70 bg-black/50 rounded px-1">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {isEncoding && progress && (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-teal-400 shrink-0" />
            <p className="text-sm text-white/60">{progress}</p>
          </div>
        )}

        {/* Create button */}
        {frames.length >= 2 && (
          <button
            onClick={handleCreate}
            disabled={isEncoding}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
          >
            {isEncoding
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Encoding…</>
              : <><Download className="h-4 w-4" /> Create GIF</>}
          </button>
        )}
      </div>
    </ToolPageLayout>
  );
}
