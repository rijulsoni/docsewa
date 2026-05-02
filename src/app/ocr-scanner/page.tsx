"use client"
import { useState, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Button } from '@/components/ui/button';
import { Upload, Copy, Download, X, ScanText, Loader2, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'hin', label: 'Hindi' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'spa', label: 'Spanish' },
  { code: 'por', label: 'Portuguese' },
  { code: 'ita', label: 'Italian' },
  { code: 'rus', label: 'Russian' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'kor', label: 'Korean' },
  { code: 'ara', label: 'Arabic' },
];

export default function OCRScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('');
  const [lang, setLang] = useState('eng');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setText('');
    setProgress(0);
    setStatus('');
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const runOCR = async () => {
    if (!file) return;
    setProcessing(true);
    setText('');
    setProgress(0);
    setStatus('Loading OCR engine…');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          setStatus(m.status);
          setProgress(Math.round((m.progress || 0) * 100));
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setText(data.text);
      setStatus('Done');
      toast.success('Text extracted successfully');
    } catch {
      toast.error('OCR failed. Try a clearer image.');
      setStatus('');
    } finally {
      setProcessing(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${file?.name.replace(/\.[^.]+$/, '') ?? 'ocr-result'}.txt`;
    a.click();
  };

  return (
    <ToolPageLayout
      title="OCR Scanner"
      description="Extract text from scanned documents, images, and photos. Supports 40+ languages — runs entirely in your browser."
      icon={<ScanText className="h-6 w-6" />}
      accentColor="rgba(20,184,166,0.35)"
    >
      <div className="space-y-5">
        {/* Language selector */}
        <div className="flex items-center gap-3">
          <Languages className="h-4 w-4 text-white/40 shrink-0" />
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-teal-500/40"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} className="bg-[#0d0d0f]">{l.label}</option>
            ))}
          </select>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            file ? 'border-teal-500/30 bg-teal-500/[0.04]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              {preview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="preview" className="h-20 rounded-lg object-cover" />
                : <ScanText className="h-10 w-10 text-teal-400" />}
              <div className="text-left">
                <p className="text-sm font-medium text-white/80">{file.name}</p>
                <p className="text-xs text-white/35 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); setPreview(''); setText(''); }}
                className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">Drop an image or PDF here</p>
              <p className="text-xs text-white/25 mt-1">JPG, PNG, WebP, BMP, TIFF, PDF</p>
            </>
          )}
        </div>

        {/* Progress */}
        {processing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span className="capitalize">{status}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Extract button */}
        <Button
          onClick={runOCR}
          disabled={!file || processing}
          className="w-full bg-teal-500 hover:bg-teal-400 text-white border-0 shadow-[0_4px_16px_rgba(20,184,166,0.35)] h-11"
        >
          {processing
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Extracting…</>
            : <><ScanText className="h-4 w-4 mr-2" />Extract Text</>}
        </Button>

        {/* Result */}
        {text && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Extracted Text</p>
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button
                  onClick={download}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download .txt
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={14}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white/75 leading-relaxed focus:outline-none focus:border-teal-500/30 resize-none"
            />
            <p className="text-xs text-white/25">{text.split(/\s+/).filter(Boolean).length} words · {text.length} characters · editable</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
