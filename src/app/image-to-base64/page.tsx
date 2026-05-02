"use client"
import React, { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Hash, Upload, Copy, Download, X } from 'lucide-react';
import { toast } from 'sonner';

type OutputMode = 'dataurl' | 'base64only';

export default function ImageToBase64Page() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [mode, setMode] = useState<OutputMode>('dataurl');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }
    setImageFile(file);
    setDimensions(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
      const img = new Image();
      img.onload = () => setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = dataUrl;
    };
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

  const reset = () => {
    setImageSrc(null);
    setImageFile(null);
    setDimensions(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const outputValue = imageSrc
    ? mode === 'dataurl'
      ? imageSrc
      : imageSrc.split(',')[1] ?? ''
    : '';

  const copyToClipboard = async () => {
    if (!outputValue) return;
    try {
      await navigator.clipboard.writeText(outputValue);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const downloadTxt = () => {
    if (!outputValue) return;
    const blob = new Blob([outputValue], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${imageFile?.name ?? 'image'}-base64.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Downloaded!');
  };

  const base64Size = outputValue ? new Blob([outputValue]).size : 0;

  return (
    <ToolPageLayout
      title="Image to Base64"
      description="Convert any image to a Base64 data URL — copy or download the encoded string for use in CSS, HTML, or code."
      icon={<Hash className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Convert any image to a Base64 data URL',
        'Shows full data URL or raw Base64',
        'Displays original and encoded sizes',
        'Copy to clipboard or download as .txt',
        'Supports PNG, JPG, WebP, GIF, SVG',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Upload */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Upload Image</p>
          {!imageSrc ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-12 cursor-pointer transition-all ${dragging ? 'border-indigo-400/60 bg-indigo-500/[0.06]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'}`}
            >
              <Upload className="h-8 w-8 text-white/30" />
              <p className="text-sm text-white/40">Drop image here or <span className="text-indigo-400/80 underline">browse</span></p>
              <p className="text-xs text-white/20">PNG, JPG, WebP, GIF, SVG</p>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={imageSrc} alt="preview" className="w-14 h-14 object-contain rounded-xl border border-white/[0.08] bg-white/[0.04]" />
                <div>
                  <p className="text-sm text-white/70 font-medium truncate max-w-[180px]">{imageFile?.name}</p>
                  {dimensions && <p className="text-xs text-white/30 mt-0.5">{dimensions.w}×{dimensions.h}px</p>}
                </div>
              </div>
              <button onClick={reset} className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {imageSrc && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Format', value: imageFile?.type.split('/')[1]?.toUpperCase() ?? '—' },
                { label: 'Dimensions', value: dimensions ? `${dimensions.w}×${dimensions.h}` : '—' },
                { label: 'Original Size', value: imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : '—' },
                { label: 'Encoded Size', value: `${(base64Size / 1024).toFixed(1)} KB` },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-xl p-3 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">{s.label}</p>
                  <p className="text-sm font-semibold text-white/70 mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Mode toggle */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output Mode</p>
              <div className="flex gap-2">
                {([['dataurl', 'Full Data URL'], ['base64only', 'Base64 Only']] as [OutputMode, string][]).map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${mode === m ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
                    {label}
                  </button>
                ))}
              </div>

              <textarea
                readOnly
                value={outputValue}
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white/50 font-mono focus:outline-none resize-none"
              />

              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-all">
                  <Copy className="h-4 w-4" /> Copy
                </button>
                <button onClick={downloadTxt} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                  <Download className="h-4 w-4" /> Download .txt
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
