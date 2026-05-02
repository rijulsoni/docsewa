"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Code, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'js-escape' | 'js-unescape' | 'py-escape' | 'py-unescape';

function jsEscape(input: string): string {
  return JSON.stringify(input).slice(1, -1);
}

function jsUnescape(input: string): string {
  return JSON.parse('"' + input + '"');
}

function pyEscape(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/[\x00-\x1f\x7f]/g, (c) => {
      const hex = c.charCodeAt(0).toString(16).padStart(2, '0');
      return `\\x${hex}`;
    });
}

function pyUnescape(input: string): string {
  return input
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\\\/g, '\\');
}

const MODES: { label: string; mode: Mode }[] = [
  { label: 'JS Escape', mode: 'js-escape' },
  { label: 'JS Unescape', mode: 'js-unescape' },
  { label: 'Python Escape', mode: 'py-escape' },
  { label: 'Python Unescape', mode: 'py-unescape' },
];

export default function StringEscapePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeMode, setActiveMode] = useState<Mode | null>(null);
  const [error, setError] = useState('');

  const apply = (mode: Mode) => {
    setActiveMode(mode);
    setError('');
    try {
      let result = '';
      if (mode === 'js-escape') result = jsEscape(input);
      else if (mode === 'js-unescape') result = jsUnescape(input);
      else if (mode === 'py-escape') result = pyEscape(input);
      else result = pyUnescape(input);
      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input');
      setOutput('');
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  return (
    <ToolPageLayout
      title="String Escape / Unescape"
      description="Escape and unescape strings for JavaScript or Python. Handles newlines, tabs, quotes, and Unicode escape sequences."
      icon={<Code className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Escape strings for JavaScript or Python',
        'Unescape escaped string literals',
        'Handles newlines, tabs, quotes and Unicode escapes',
        'Copy result to clipboard',
        'Prevents copy-paste string bugs',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); setError(''); setActiveMode(null); }}
            placeholder="Paste your string here..."
            rows={7}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 resize-none font-mono"
          />
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Mode</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODES.map(({ label, mode }) => (
              <button
                key={mode}
                onClick={() => apply(mode)}
                disabled={!input}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${
                  activeMode === mode
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                    : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-teal-300 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Escaped / unescaped result will appear here..."
            rows={7}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all font-mono"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
