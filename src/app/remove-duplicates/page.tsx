"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Filter, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

function downloadTxt(content: string, filename = 'deduped-lines.txt') {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RemoveDuplicatesPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimWS, setTrimWS] = useState(false);
  const [keepOrder, setKeepOrder] = useState(true);
  const [stats, setStats] = useState<{ removed: number; remaining: number } | null>(null);

  const process = () => {
    const lines = input.split('\n');
    const normalize = (s: string) => {
      let v = trimWS ? s.trim() : s;
      if (ignoreCase) v = v.toLowerCase();
      return v;
    };

    const seen = new Set<string>();
    const unique: string[] = [];

    for (const line of lines) {
      const key = normalize(line);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(trimWS ? line.trim() : line);
      }
    }

    const result = keepOrder ? unique : [...unique].sort((a, b) => a.localeCompare(b));
    const removed = lines.length - unique.length;
    setOutput(result.join('\n'));
    setStats({ removed, remaining: unique.length });
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const toggleOptions = [
    { label: 'Ignore case', value: ignoreCase, set: setIgnoreCase },
    { label: 'Trim whitespace', value: trimWS, set: setTrimWS },
    { label: 'Keep original order', value: keepOrder, set: setKeepOrder },
  ];

  return (
    <ToolPageLayout
      title="Remove Duplicates"
      description="Remove duplicate lines from any block of text. Supports case-insensitive matching and whitespace trimming."
      icon={<Filter className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'Remove duplicate lines from any text',
        'Case-insensitive matching option',
        'Trim whitespace before comparing',
        'Shows how many duplicates were removed',
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
            onChange={(e) => { setInput(e.target.value); setStats(null); setOutput(''); }}
            placeholder="Paste your text here, one item per line…"
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-red-500/40 resize-none"
          />
        </div>

        {/* Options + action */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Options</p>
          <div className="flex flex-wrap gap-4">
            {toggleOptions.map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  role="switch"
                  aria-checked={value}
                  onClick={() => set(!value)}
                  className={`relative w-9 h-5 rounded-full transition-colors border ${value ? 'bg-red-500/30 border-red-500/50' : 'bg-white/[0.04] border-white/[0.08]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : ''}`} />
                </button>
                <span className="text-sm text-white/50">{label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={process}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Remove Duplicates
          </button>

          {stats && (
            <div className="flex gap-4 text-sm">
              <span className="text-red-400/80">
                <span className="font-bold">{stats.removed}</span> duplicate{stats.removed !== 1 ? 's' : ''} removed
              </span>
              <span className="text-white/40">
                <span className="font-bold text-white/60">{stats.remaining}</span> lines remaining
              </span>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
            <div className="flex gap-2">
              <button
                onClick={copy}
                disabled={!output}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button
                onClick={() => downloadTxt(output)}
                disabled={!output}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> .txt
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Deduplicated lines will appear here…"
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
