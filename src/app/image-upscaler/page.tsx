"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { ZoomIn, Download, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

type Scale = 2 | 4;

interface Dimensions { w: number; h: number }

async function upscale(file: File, scale: Scale): Promise<{ blob: Blob; dims: Dimensions }> {
  const orig = await createImageBitmap(file);
  const origW = orig.width;
  const origH = orig.height;
  const targetW = origW * scale;
  const targetH = origH * scale;

  // Progressive upscaling: multiple small steps beat one big jump quality-wise.
  // Each step magnifies by the (1/steps)-th root of the total scale.
  const steps = scale === 2 ? 4 : 8;

  let srcCanvas = document.createElement('canvas');
  srcCanvas.width  = origW;
  srcCanvas.height = origH;
  srcCanvas.getContext('2d')!.drawImage(orig, 0, 0);
  orig.close();

  for (let i = 1; i <= steps; i++) {
    const factor = Math.pow(scale, i / steps);
    const dstW = Math.round(origW * factor);
    const dstH = Math.round(origH * factor);
    const dst  = document.createElement('canvas');
    dst.width  = dstW;
    dst.height = dstH;
    const ctx  = dst.getContext('2d')!;
    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = 'high';
    ctx.drawImage(srcCanvas, 0, 0, dstW, dstH);
    srcCanvas = dst;
  }

  // Final exact-target pass with a subtle contrast boost for perceived sharpness.
  const out = document.createElement('canvas');
  out.width  = targetW;
  out.height = targetH;
  const outCtx = out.getContext('2d')!;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.filter = 'contrast(1.06)';
  outCtx.drawImage(srcCanvas, 0, 0, targetW, targetH);

  const blob = await new Promise<Blob>((res) =>
    out.toBlob((b) => res(b!), 'image/png')
  );
  return { blob, dims: { w: targetW, h: targetH } };
}

export default function ImageUpscalerPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [origDims, setOrigDims]       = useState<Dimensions | null>(null);
  const [scale, setScale]             = useState<Scale>(2);
  const [isProcessing, setProcessing] = useState(false);
  const [result, setResult]           = useState<{ url: string; dims: Dimensions; size: number } | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    const bm = await createImageBitmap(f);
    setOrigDims({ w: bm.width, h: bm.height });
    bm.close();
    setFile(f); setResult(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpscale = async () => {
    if (!file) return;
    setProcessing(true); setResult(null);
    try {
      const { blob, dims } = await upscale(file, scale);
      setResult({ url: URL.createObjectURL(blob), dims, size: blob.size });
      toast.success(`Upscaled to ${dims.w} × ${dims.h}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upscaling failed.');
    } finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = file.name.replace(/\.[^.]+$/, '') + `_${scale}x.png`;
    a.click();
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setOrigDims(null); };
  const fmt   = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Image Upscaler"
      description="Enlarge low-resolution or pixelated images to 2× or 4× their original size with smooth progressive upscaling."
      icon={<ZoomIn className="h-7 w-7" />}
      accentColor="rgba(14,165,233,0.35)"
      features={[
        'Progressive multi-step upscaling for smoother results',
        '2× and 4× scale options',
        'Subtle contrast pass to improve perceived sharpness',
        'Outputs lossless PNG — no compression artefacts',
        'Runs entirely in your browser — no server',
        'Works on photos, illustrations, logos and screenshots',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="image/*"
          fileLabel="image"
          hint="JPG, PNG, WebP — any raster image"
          accentClass="border-sky-500/60 bg-sky-500/[0.06] shadow-[0_0_40px_rgba(14,165,233,0.12)]"
          buttonClass="bg-sky-500 hover:bg-sky-400 shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
          icon="image"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            {preview && <img src={preview} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/[0.06]" />}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">
                {fmt(file.size)}{origDims ? ` · ${origDims.w} × ${origDims.h} px` : ''}
              </p>
            </div>
            <button onClick={reset} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scale selector */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Scale Factor</p>
            <div className="flex gap-3">
              {([2, 4] as Scale[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    scale === s
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                      : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  {s}×
                  {origDims && (
                    <span className="block text-[10px] font-normal mt-0.5 opacity-60">
                      {origDims.w * s} × {origDims.h * s} px
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/30 mb-2">
                    Original{origDims ? ` · ${origDims.w}×${origDims.h}` : ''}
                  </p>
                  <img src={preview!} alt="original" className="w-full rounded-xl object-contain max-h-44 bg-white/[0.02] border border-white/[0.06]" />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-2">
                    {scale}× · {result.dims.w}×{result.dims.h} · {fmt(result.size)}
                  </p>
                  <img src={result.url} alt="upscaled" className="w-full rounded-xl object-contain max-h-44 bg-white/[0.02] border border-white/[0.06]" />
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download {scale}× PNG
              </button>
            </div>
          )}

          <button
            onClick={handleUpscale}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Upscaling…</>
              : <><ZoomIn className="h-4 w-4" /> Upscale {scale}×</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
