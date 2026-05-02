"use client"
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Button } from '@/components/ui/button';
import { Upload, Download, X, Languages, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese (Simplified)' },
  { code: 'ar', label: 'Arabic' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'tr', label: 'Turkish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' },
  { code: 'fi', label: 'Finnish' },
  { code: 'no', label: 'Norwegian' },
  { code: 'uk', label: 'Ukrainian' },
];

async function translateChunk(text: string, targetLang: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus === 200) return data.responseData.translatedText;
  throw new Error('Translation failed');
}

async function translateText(text: string, targetLang: string, onProgress: (p: number) => void): Promise<string> {
  const CHUNK = 400;
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > CHUNK && current) { chunks.push(current.trim()); current = s; }
    else current += s;
  }
  if (current.trim()) chunks.push(current.trim());

  const results: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    results.push(await translateChunk(chunks[i], targetLang));
    onProgress(Math.round(((i + 1) / chunks.length) * 100));
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 300));
  }
  return results.join(' ');
}

async function extractPDFText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  let text = '';
  for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((x) => ('str' in x ? x.str : '')).join(' ') + '\n\n';
  }
  return text.trim();
}

async function buildTranslatedPDF(translatedText: string, originalName: string): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import('@cantoo/pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const margin = 50;
  const lineHeight = 16;

  const words = translatedText.split(' ');
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const w = font.widthOfTextAtSize(test, fontSize);
    if (w > 595 - margin * 2) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);

  const linesPerPage = Math.floor((842 - margin * 2) / lineHeight);
  for (let p = 0; p < Math.ceil(lines.length / linesPerPage); p++) {
    const page = doc.addPage([595, 842]);
    const slice = lines.slice(p * linesPerPage, (p + 1) * linesPerPage);
    slice.forEach((l, i) => {
      page.drawText(l, { x: margin, y: 842 - margin - i * lineHeight, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    });
  }

  // title page header
  const firstPage = doc.getPage(0);
  firstPage.drawText(`Translated: ${originalName}`, {
    x: margin, y: 842 - 20, size: 8, font, color: rgb(0.5, 0.5, 0.5),
  });

  return doc.save();
}

export default function DocumentTranslatorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('fr');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resultText, setResultText] = useState('');

  const handleFile = (f: File) => {
    setFile(f);
    setResultText('');
    setProgress(0);
    setStatus('');
  };

  const translate = async () => {
    if (!file) return;
    setProcessing(true);
    setResultText('');
    setProgress(0);

    try {
      let text = '';
      setStatus('Extracting text…');
      if (file.type === 'application/pdf') {
        text = await extractPDFText(file);
      } else if (file.name.endsWith('.docx')) {
        const mammoth = (await import('mammoth')).default;
        const ab = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: ab });
        text = value;
      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        toast.error('Unsupported file type');
        setProcessing(false);
        return;
      }

      if (!text.trim()) { toast.error('No text found in document'); setProcessing(false); return; }

      setStatus('Translating…');
      const translated = await translateText(text, targetLang, (p) => setProgress(p));
      setResultText(translated);
      setStatus('Done');
      toast.success('Translation complete');
    } catch {
      toast.error('Translation failed. Please try again.');
      setStatus('');
    } finally {
      setProcessing(false);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([resultText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `translated_${file?.name.replace(/\.[^.]+$/, '')}.txt`;
    a.click();
  };

  const downloadPDF = async () => {
    try {
      const bytes = await buildTranslatedPDF(resultText, file?.name ?? 'document');
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `translated_${file?.name.replace(/\.[^.]+$/, '')}.pdf`;
      a.click();
    } catch {
      toast.error('Failed to build PDF');
    }
  };

  return (
    <ToolPageLayout
      title="Document Translator"
      description="Translate PDF, DOCX, or TXT documents into 20+ languages. Powered by MyMemory — free, no sign-up needed."
      icon={<Globe className="h-6 w-6" />}
      accentColor="rgba(14,165,233,0.35)"
    >
      <div className="space-y-5">
        {/* Language selector */}
        <div className="flex items-center gap-3">
          <Languages className="h-4 w-4 text-white/40 shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-white/40">Translate to</span>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-sky-500/40"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-[#0d0d0f]">{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => !file && document.getElementById('translator-input')?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-all',
            file ? 'border-sky-500/30 bg-sky-500/[0.04]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02] cursor-pointer'
          )}
        >
          <input
            id="translator-input"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <Globe className="h-8 w-8 text-sky-400 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-white/80">{file.name}</p>
                <p className="text-xs text-white/35 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); setResultText(''); }}
                className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">Drop a PDF, DOCX, or TXT file</p>
              <p className="text-xs text-white/25 mt-1">Free · up to 10,000 words/day via MyMemory</p>
            </>
          )}
        </div>

        {/* Progress */}
        {processing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={translate}
          disabled={!file || processing}
          className="w-full bg-sky-500 hover:bg-sky-400 text-white border-0 shadow-[0_4px_16px_rgba(14,165,233,0.35)] h-11"
        >
          {processing
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{status}</>
            : <><Globe className="h-4 w-4 mr-2" />Translate Document</>}
        </Button>

        {/* Result */}
        {resultText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Translation</p>
              <div className="flex gap-2">
                <button
                  onClick={downloadTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> .txt
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> .pdf
                </button>
              </div>
            </div>
            <textarea
              value={resultText}
              onChange={e => setResultText(e.target.value)}
              rows={14}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white/75 leading-relaxed focus:outline-none focus:border-sky-500/30 resize-none"
            />
            <p className="text-xs text-white/25">{resultText.split(/\s+/).filter(Boolean).length} words translated · editable</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
