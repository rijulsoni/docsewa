"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Repeat2, Download, Loader2, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type OutputFormat = 'png' | 'jpg' | 'webp';

const MIME: Record<OutputFormat, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const EXT: Record<OutputFormat, string>  = { png: '.png',       jpg: '.jpg',       webp: '.webp' };

export default function ImageFormatConverterPage() {
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [outFmt, setOutFmt]         = useState<OutputFormat>('png');
  const [isProcessing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl]   = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  const onFiles = (files: File[]) => {
    const f = files[0];
    setFile(f); setResultUrl(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true); setResultUrl(null);
    try {
      let bitmap: ImageBitmap;
      const name = file.name.toLowerCase();
      if (name.endsWith('.heic') || name.endsWith('.heif')) {
        const heic2any = (await import('heic2any')).default;
        const blob = await heic2any({ blob: file, toType: 'image/png' }) as Blob;
        bitmap = await createImageBitmap(blob);
      } else {
        bitmap = await createImageBitmap(file);
      }

      const canvas = document.createElement('canvas');
      canvas.width  = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), MIME[outFmt], outFmt === 'png' ? undefined : 0.92)
      );
      setResultSize(blob.size);
      setResultUrl(URL.createObjectURL(blob));
      toast.success(`Converted to ${outFmt.toUpperCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = file.name.replace(/\.[^.]+$/, '') + EXT[outFmt];
    a.click();
  };

  const reset = () => { setFile(null); setPreview(null); setResultUrl(null); };
  const fmt   = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Image Format Converter"
      description="Convert between HEIC, WebP, SVG, JPG, and PNG formats instantly in your browser."
      icon={<Repeat2 className="h-7 w-7" />}
      accentColor="rgba(236,72,153,0.35)"
      features={[
        'Supports HEIC/HEIF (Apple photos), WebP, SVG, JPG, PNG as input',
        'Output to PNG, JPG, or WebP',
        'Runs entirely in your browser — no uploads',
        'Preserves original dimensions',
        'SVG to raster conversion included',
        'High-quality JPEG output at 92% quality',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="image/*,.heic,.heif,.svg"
          fileLabel="image"
          hint="HEIC, WebP, SVG, JPG or PNG — any common format"
          accentClass="border-pink-500/60 bg-pink-500/[0.06] shadow-[0_0_40px_rgba(236,72,153,0.12)]"
          buttonClass="bg-pink-500 hover:bg-pink-400 shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
          icon="image"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            {preview && <img src={preview} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/[0.06]" />}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={reset} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Format selector */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Output Format</p>
            <div className="flex gap-2">
              {(['png', 'jpg', 'webp'] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOutFmt(f)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    outFmt === f
                      ? 'bg-pink-500/10 border-pink-500/40 text-pink-300'
                      : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Before / after */}
          {resultUrl && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/30 mb-2">Original · {fmt(file.size)}</p>
                  <img src={preview!} alt="original" className="w-full rounded-xl object-contain max-h-44 bg-white/[0.02] border border-white/[0.06]" />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-2">{outFmt.toUpperCase()} · {fmt(resultSize)}</p>
                  <img src={resultUrl} alt="converted" className="w-full rounded-xl object-contain max-h-44 bg-white/[0.02] border border-white/[0.06]" />
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download {outFmt.toUpperCase()}
              </button>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-pink-500 hover:bg-pink-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
              : <><RefreshCw className="h-4 w-4" /> Convert to {outFmt.toUpperCase()}</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
