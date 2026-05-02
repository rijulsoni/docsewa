"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { ArrowUpDown, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

type SortMode = 'az' | 'za' | 'shortest' | 'longest' | 'shuffle';

function downloadTxt(content: string, filename = 'sorted-lines.txt') {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SortLinesPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeMode, setActiveMode] = useState<SortMode | null>(null);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimWS, setTrimWS] = useState(false);

  const getLines = () => {
    const lines = input.split('\n');
    return trimWS ? lines.map((l) => l.trim()) : lines;
  };

  const apply = (mode: SortMode) => {
    setActiveMode(mode);
    const lines = getLines();
    let sorted: string[];

    if (mode === 'shuffle') {
      sorted = [...lines];
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
    } else {
      const key = (s: string) => (ignoreCase ? s.toLowerCase() : s);
      sorted = [...lines].sort((a, b) => {
        if (mode === 'az') return key(a).localeCompare(key(b));
        if (mode === 'za') return key(b).localeCompare(key(a));
        if (mode === 'shortest') return a.length - b.length;
        if (mode === 'longest') return b.length - a.length;
        return 0;
      });
    }
    setOutput(sorted.join('\n'));
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const sortButtons: { label: string; mode: SortMode }[] = [
    { label: 'A → Z', mode: 'az' },
    { label: 'Z → A', mode: 'za' },
    { label: 'Shortest first', mode: 'shortest' },
    { label: 'Longest first', mode: 'longest' },
    { label: 'Shuffle', mode: 'shuffle' },
  ];

  return (
    <ToolPageLayout
      title="Sort Lines"
      description="Sort lines of text alphabetically, by length, or shuffle them randomly. Trim whitespace and ignore case as needed."
      icon={<ArrowUpDown className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Sort lines alphabetically or by length',
        'Reverse sort in one click',
        'Shuffle lines randomly',
        'Ignore case and trim whitespace options',
        'Copy result or download as .txt',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste lines of text here, one per line…"
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 resize-none"
          />
        </div>

        {/* Options */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Options</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Ignore case', value: ignoreCase, set: setIgnoreCase },
              { label: 'Trim whitespace', value: trimWS, set: setTrimWS },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  role="switch"
                  aria-checked={value}
                  onClick={() => set(!value)}
                  className={`relative w-9 h-5 rounded-full transition-colors border ${value ? 'bg-blue-500/30 border-blue-500/50' : 'bg-white/[0.04] border-white/[0.08]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : ''}`} />
                </button>
                <span className="text-sm text-white/50">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort buttons */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Sort</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {sortButtons.map(({ label, mode }) => (
              <button
                key={mode}
                onClick={() => apply(mode)}
                disabled={!input.trim()}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${
                  activeMode === mode
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
            <div className="flex gap-2">
              <button
                onClick={copy}
                disabled={!output}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button
                onClick={() => downloadTxt(output)}
                disabled={!output}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> .txt
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Sorted lines will appear here…"
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
