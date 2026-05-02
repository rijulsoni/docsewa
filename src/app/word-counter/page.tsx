"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { AlignLeft } from 'lucide-react';

interface Stats {
  words: number;
  chars: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMin: number;
  speakingMin: number;
}

function computeStats(text: string): Stats {
  const trimmed = text.trim();
  const words = trimmed === '' ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed === '' ? 0 : (trimmed.match(/[^.!?]*[.!?]+/g) ?? []).length;
  const paragraphs = trimmed === '' ? 0 : trimmed.split(/\n{2,}/).filter((p) => p.trim() !== '').length;
  const readingMin = Math.max(1, Math.round(words / 200));
  const speakingMin = Math.max(1, Math.round(words / 130));
  return { words, chars, charsNoSpaces, sentences, paragraphs, readingMin, speakingMin };
}

const STATS_CONFIG = [
  { key: 'words' as const,         label: 'Words',                format: (v: number) => v.toLocaleString() },
  { key: 'chars' as const,         label: 'Characters',           format: (v: number) => v.toLocaleString() },
  { key: 'charsNoSpaces' as const, label: 'Chars (no spaces)',    format: (v: number) => v.toLocaleString() },
  { key: 'sentences' as const,     label: 'Sentences',            format: (v: number) => v.toLocaleString() },
  { key: 'paragraphs' as const,    label: 'Paragraphs',           format: (v: number) => v.toLocaleString() },
  { key: 'readingMin' as const,    label: 'Reading time',         format: (v: number) => `${v} min read` },
  { key: 'speakingMin' as const,   label: 'Speaking time',        format: (v: number) => `${v} min` },
] as const;

export default function WordCounterPage() {
  const [input, setInput] = useState('');
  const stats = computeStats(input);

  return (
    <ToolPageLayout
      title="Word Counter"
      description="Paste or type your text to instantly count words, characters, sentences, paragraphs, and estimate reading and speaking time."
      icon={<AlignLeft className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Real-time counting as you type',
        'Words, characters, sentences & paragraphs',
        'Reading and speaking time estimates',
        'No upload needed — just paste and go',
        'Handles multi-line text blocks',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Textarea */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Your Text</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here…"
            rows={10}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 resize-none"
          />
        </div>

        {/* Stats grid */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Statistics</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {STATS_CONFIG.map(({ key, label, format }) => (
              <div
                key={key}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 flex flex-col gap-1"
              >
                <span className="text-[11px] text-white/30 font-medium uppercase tracking-wider">{label}</span>
                <span className="text-xl font-bold text-white/80">{format(stats[key])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
