"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { BarChart3, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  words: number;
  chars: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
}

const STAT_CARDS: { label: string; key: keyof Stats; unit: string }[] = [
  { label: 'Words',            key: 'words',         unit: 'words'   },
  { label: 'Characters',       key: 'chars',         unit: 'chars'   },
  { label: 'Chars (no spaces)',key: 'charsNoSpaces', unit: 'chars'   },
  { label: 'Sentences',        key: 'sentences',     unit: 'sent.'   },
  { label: 'Paragraphs',       key: 'paragraphs',    unit: 'para.'   },
  { label: 'Reading Time',     key: 'readingTime',   unit: 'min'     },
  { label: 'Speaking Time',    key: 'speakingTime',  unit: 'min'     },
];

export default function DocxWordCountPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    const name = f.name.toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.doc')) {
      toast.error('Only .docx and .doc files are supported.'); return;
    }
    setFile(f); setStats(null);
  };

  const handleAnalyse = async () => {
    if (!file) { toast.error('Please select a DOCX file.'); return; }
    setIsProcessing(true); setStats(null);
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      const words       = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars       = text.length;
      const charsNoSpaces = text.replace(/\s/g, '').length;
      const sentences   = text.trim() ? text.trim().split(/[.!?]+/).filter(Boolean).length : 0;
      const paragraphs  = text.trim() ? text.trim().split(/\n\n+/).filter(Boolean).length : 0;
      const readingTime  = Math.ceil(words / 200);
      const speakingTime = Math.ceil(words / 130);
      setStats({ words, chars, charsNoSpaces, sentences, paragraphs, readingTime, speakingTime });
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="DOCX Word Count"
      description="Get a detailed breakdown of words, characters, sentences, and reading time from any Word document."
      icon={<BarChart3 className="h-7 w-7" />}
      accentColor="rgba(14,165,233,0.35)"
      features={[
        'Word, character and paragraph count',
        'Estimated reading time at 200 words/min',
        'Estimated speaking time at 130 words/min',
        'Sentence detection included',
        'Runs entirely in your browser',
        'Works on .docx and .doc files',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx,.doc"
          fileLabel="DOCX"
          hint="Drop a Word document — get a full text statistics breakdown"
          accentClass="border-sky-500/60 bg-sky-500/[0.06] shadow-[0_0_40px_rgba(14,165,233,0.12)]"
          buttonClass="bg-sky-500 hover:bg-sky-400 shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-sky-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button
              onClick={() => { setFile(null); setStats(null); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {stats && (
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Results</p>
              <div className="grid grid-cols-2 gap-3">
                {STAT_CARDS.map(({ label, key, unit }) => (
                  <div
                    key={key}
                    className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 flex flex-col gap-0.5"
                  >
                    <span className="text-[11px] text-white/35 font-medium">{label}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white/80">{stats[key].toLocaleString()}</span>
                      <span className="text-xs text-white/30">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyse}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>
              : <><BarChart3 className="h-4 w-4" /> Analyse</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
