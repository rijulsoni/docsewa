"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { SlidersHorizontal, Download, Loader2, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'compress' | 'resize';

interface FileEntry {
  file: File;
  status: 'pending' | 'done' | 'error';
  newSize?: number;
}

export default function BatchCompressPage() {
  const [files, setFiles]         = useState<FileEntry[]>([]);
  const [mode, setMode]           = useState<Mode>('compress');
  const [quality, setQuality]     = useState(80);
  const [width, setWidth]         = useState(1920);
  const [height, setHeight]       = useState(1080);
  const [keepAspect, setKeepAspect] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [done, setDone]           = useState(false);

  const onFiles = (incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) { toast.error('No image files found.'); return; }
    setFiles((prev) => [
      ...prev,
      ...imgs.slice(0, 100 - prev.length).map((f) => ({ file: f, status: 'pending' as const })),
    ]);
    setDone(false);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleProcess = async () => {
    if (!files.length) return;
    setProcessing(true); setDone(false);

    const [{ default: JSZip }, { default: imageCompression }] = await Promise.all([
      import('jszip'),
      import('browser-image-compression'),
    ]);

    const zip = new JSZip();
    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      const entry = updated[i];
      try {
        let resultBlob: Blob;

        if (mode === 'compress') {
          resultBlob = await imageCompression(entry.file, {
            initialQuality: quality / 100,
            useWebWorker: true,
          });
        } else if (keepAspect) {
          resultBlob = await imageCompression(entry.file, {
            maxWidthOrHeight: Math.max(width, height),
            useWebWorker: true,
          });
        } else {
          const bm = await createImageBitmap(entry.file);
          const canvas = document.createElement('canvas');
          canvas.width  = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(bm, 0, 0, width, height);
          bm.close();
          resultBlob = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), 'image/jpeg', quality / 100)
          );
        }

        const base = entry.file.name.replace(/\.[^.]+$/, '');
        const ext  = (entry.file.name.split('.').pop() ?? 'jpg');
        zip.file(`${base}_processed.${ext}`, resultBlob);
        updated[i] = { ...entry, status: 'done', newSize: resultBlob.size };
      } catch {
        updated[i] = { ...entry, status: 'error' };
      }
      setFiles([...updated]);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = 'processed_images.zip';
    a.click();

    setProcessing(false); setDone(true);
    const ok = updated.filter((f) => f.status === 'done').length;
    toast.success(`${ok} image${ok > 1 ? 's' : ''} processed!`);
  };

  const savings = (entry: FileEntry) => {
    if (!entry.newSize) return null;
    const pct = Math.round((1 - entry.newSize / entry.file.size) * 100);
    return pct > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`;
  };
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Batch Compressor & Resizer"
      description="Drop up to 100 images and resize by exact pixel dimensions or compress by quality percentage."
      icon={<SlidersHorizontal className="h-7 w-7" />}
      accentColor="rgba(139,92,246,0.35)"
      features={[
        'Batch process up to 100 images at once',
        'Compress by quality percentage (10–100%)',
        'Resize to a max dimension (aspect ratio preserved)',
        'Or force exact pixel dimensions — stretches to fill',
        'All results zipped for one-click download',
        'Runs entirely in your browser — no uploads',
      ]}
    >
      <div className="space-y-4">
        {/* Mode + settings card */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex gap-2">
            {(['compress', 'resize'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border capitalize ${
                  mode === m
                    ? 'bg-violet-500/10 border-violet-500/40 text-violet-300'
                    : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                {m === 'compress' ? 'Compress' : 'Resize'}
              </button>
            ))}
          </div>

          {mode === 'compress' && (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-xs text-white/40">Quality</p>
                <p className="text-xs font-semibold text-violet-300">{quality}%</p>
              </div>
              <input
                type="range" min={10} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>Smallest file</span><span>Best quality</span>
              </div>
            </div>
          )}

          {mode === 'resize' && (
            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-1.5">Width (px)</p>
                  <input
                    type="number" min={1} value={width}
                    onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-violet-500/40"
                  />
                </div>
                <span className="pb-2 text-white/20 text-sm">×</span>
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-1.5">Height (px)</p>
                  <input
                    type="number" min={1} value={height}
                    onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-violet-500/40"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox" checked={keepAspect}
                  onChange={(e) => setKeepAspect(e.target.checked)}
                  className="accent-violet-500 w-4 h-4"
                />
                <span className="text-xs text-white/40">
                  {keepAspect ? 'Maintain aspect ratio (larger dimension as max)' : 'Force exact dimensions (may stretch)'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Drop zone (only while under limit) */}
        {files.length < 100 && (
          <UploadDropzone
            onFiles={onFiles}
            accept="image/*"
            multiple
            fileLabel="images"
            hint={`Drop up to ${100 - files.length} images — JPG, PNG, WebP`}
            accentClass="border-violet-500/60 bg-violet-500/[0.06] shadow-[0_0_40px_rgba(139,92,246,0.12)]"
            buttonClass="bg-violet-500 hover:bg-violet-400 shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
            icon="image"
          />
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                {files.length} image{files.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => { setFiles([]); setDone(false); }}
                className="text-xs text-white/25 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-56 overflow-y-auto">
              {files.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <p className="text-sm text-white/60 truncate flex-grow min-w-0">{entry.file.name}</p>
                  <p className="text-xs text-white/30 shrink-0">{fmt(entry.file.size)}</p>
                  {entry.status === 'done' && (
                    <>
                      <p className={`text-xs shrink-0 ${Number(savings(entry)?.replace('%','')) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {savings(entry)}
                      </p>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    </>
                  )}
                  {entry.status === 'error' && (
                    <span className="text-xs text-red-400 shrink-0">Error</span>
                  )}
                  {entry.status === 'pending' && !isProcessing && (
                    <button onClick={() => removeFile(i)} className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              : done
              ? <><Download className="h-4 w-4" /> Download ZIP Again</>
              : <><Download className="h-4 w-4" /> Process &amp; Download ZIP</>}
          </button>
        )}
      </div>
    </ToolPageLayout>
  );
}
