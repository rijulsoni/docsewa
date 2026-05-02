"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Wand2, Download, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function BackgroundRemoverPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [resultUrl, setResultUrl]     = useState<string | null>(null);
  const [isProcessing, setProcessing] = useState(false);
  const [progress, setProgress]       = useState('');

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    setFile(f); setResultUrl(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleRemove = async () => {
    if (!file) return;
    setProcessing(true); setResultUrl(null);
    setProgress('Loading AI model…');
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setProgress('Analysing image…');
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (key.includes('fetch') && total > 0)
            setProgress(`Downloading model… ${Math.round((current / total) * 100)}%`);
          else if (key.includes('infer'))
            setProgress('Removing background…');
        },
      });
      setResultUrl(URL.createObjectURL(blob));
      setProgress('');
      toast.success('Background removed!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Background removal failed.');
      setProgress('');
    } finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = file.name.replace(/\.[^.]+$/, '') + '_no-bg.png';
    a.click();
  };

  const reset = () => { setFile(null); setPreview(null); setResultUrl(null); };
  const fmt   = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="AI Background Remover"
      description="Instantly strip backgrounds to pure transparency — faces and features stay completely unaltered."
      icon={<Wand2 className="h-7 w-7" />}
      accentColor="rgba(16,185,129,0.35)"
      features={[
        'AI-powered — detects subjects with pixel precision',
        'Outputs clean transparent PNG (no white fill)',
        'Preserves faces, hair, and fine edges',
        'Runs entirely in your browser — no server uploads',
        'Model downloads once and is cached for reuse',
        'Works on photos, headshots, products and objects',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="image/jpeg,image/png,image/webp"
          fileLabel="image"
          hint="JPG, PNG or WebP — AI removes the background precisely"
          accentClass="border-emerald-500/60 bg-emerald-500/[0.06] shadow-[0_0_40px_rgba(16,185,129,0.12)]"
          buttonClass="bg-emerald-500 hover:bg-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
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

          {/* Progress indicator */}
          {isProcessing && progress && (
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-emerald-400 animate-spin shrink-0" />
              <p className="text-sm text-white/50">{progress}</p>
            </div>
          )}

          {/* Before / after comparison */}
          {resultUrl && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/30 mb-2">Original</p>
                  <img
                    src={preview!}
                    alt="original"
                    className="w-full rounded-xl object-contain max-h-48 border border-white/[0.06]"
                  />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-2">Background removed</p>
                  {/* checkerboard pattern shows the transparency clearly */}
                  <div
                    className="w-full rounded-xl overflow-hidden"
                    style={{
                      backgroundImage:
                        'repeating-conic-gradient(#1c1c1e 0% 25%, #111113 0% 50%)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    <img src={resultUrl} alt="no background" className="w-full object-contain max-h-48" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download PNG (transparent)
              </button>
            </div>
          )}

          <button
            onClick={handleRemove}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> {progress || 'Processing…'}</>
              : <><Wand2 className="h-4 w-4" /> Remove Background</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
