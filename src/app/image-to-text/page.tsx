"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { ScanText, Copy, Download, Loader2, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'hin', label: 'Hindi' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
];

export default function ImageToTextPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [lang, setLang]               = useState('eng');
  const [isProcessing, setProcessing] = useState(false);
  const [progress, setProgress]       = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [text, setText]               = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    setFile(f); setText(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true); setText(null); setProgress(0);
    setProgressLabel('Loading OCR engine…');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setProgressLabel('Recognising text…');
          } else if (m.status.includes('load')) {
            setProgressLabel('Loading language data…');
          }
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setText(data.text.trim());
      setProgressLabel('');
      toast.success('Text extracted!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'OCR failed.');
      setProgressLabel('');
    } finally { setProcessing(false); }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!text || !file) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name.replace(/\.[^.]+$/, '') + '_text.txt';
    a.click();
  };

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Image to Text (OCR)"
      description="Extract all readable text from photos, screenshots, and scanned images using AI."
      icon={<ScanText className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'OCR powered by Tesseract.js WASM engine',
        'Supports English, Spanish, French, German, Hindi, Chinese',
        'Runs entirely in your browser — image stays local',
        'Live progress bar shows recognition status',
        'Copy extracted text or download as .txt',
        'Works on photos, screenshots, and scanned documents',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="image/*"
          fileLabel="image"
          hint="Photo, screenshot, or scanned document — any image format"
          accentClass="border-teal-500/60 bg-teal-500/[0.06] shadow-[0_0_40px_rgba(20,184,166,0.12)]"
          buttonClass="bg-teal-500 hover:bg-teal-400 shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
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
            <button onClick={() => { setFile(null); setPreview(null); setText(null); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Language selector */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(({ code, label }) => (
                <button key={code} onClick={() => setLang(code)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                    lang === code
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                      : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {isProcessing && (
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-teal-400 animate-spin shrink-0" />
                <p className="text-sm text-white/50">{progressLabel}</p>
                {progress > 0 && <span className="ml-auto text-xs text-teal-400 font-semibold">{progress}%</span>}
              </div>
              {progress > 0 && (
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {text !== null && (
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-white/80">Text extracted</p>
                </div>
                <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg">{wordCount.toLocaleString()} words</span>
              </div>
              <textarea
                readOnly value={text}
                className="w-full h-52 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/60 font-mono resize-none focus:outline-none"
              />
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-white/[0.08] hover:bg-white/[0.05] text-white/60 hover:text-white/80 text-sm font-semibold rounded-xl transition-all">
                  <Copy className="h-4 w-4" /> Copy
                </button>
                <button onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all">
                  <Download className="h-4 w-4" /> Download .txt
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</>
              : <><ScanText className="h-4 w-4" /> Extract Text</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
