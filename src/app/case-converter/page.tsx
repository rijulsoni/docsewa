"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { CaseSensitive, Copy } from 'lucide-react';
import { toast } from 'sonner';

type CaseType = 'UPPER' | 'lower' | 'Title' | 'Sentence' | 'camelCase' | 'snake_case';

function toUpperCase(t: string) { return t.toUpperCase(); }
function toLowerCase(t: string) { return t.toLowerCase(); }
function toTitleCase(t: string) { return t.replace(/\b\w/g, (c) => c.toUpperCase()); }
function toSentenceCase(t: string) {
  const lower = t.toLowerCase();
  return lower.replace(/(^|[.!?]\s+)(\w)/g, (_, pre, char) => pre + char.toUpperCase());
}
function toCamelCase(t: string) {
  const words = t.trim().split(/[\s_-]+/);
  return words
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}
function toSnakeCase(t: string) {
  return t.trim().split(/[\s-]+/).map((w) => w.toLowerCase()).join('_');
}

const transforms: { label: string; type: CaseType; fn: (t: string) => string }[] = [
  { label: 'UPPERCASE',    type: 'UPPER',     fn: toUpperCase },
  { label: 'lowercase',    type: 'lower',     fn: toLowerCase },
  { label: 'Title Case',   type: 'Title',     fn: toTitleCase },
  { label: 'Sentence case',type: 'Sentence',  fn: toSentenceCase },
  { label: 'camelCase',    type: 'camelCase', fn: toCamelCase },
  { label: 'snake_case',   type: 'snake_case',fn: toSnakeCase },
];

export default function CaseConverterPage() {
  const [input, setInput]       = useState('');
  const [activeCase, setActive] = useState<CaseType | null>(null);
  const [output, setOutput]     = useState('');

  const applyTransform = (type: CaseType, fn: (t: string) => string) => {
    setActive(type);
    setOutput(fn(input));
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (activeCase) {
      const t = transforms.find((t) => t.type === activeCase);
      if (t) setOutput(t.fn(val));
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  return (
    <ToolPageLayout
      title="Case Converter"
      description="Transform your text between uppercase, lowercase, title case, sentence case, camelCase, and snake_case instantly."
      icon={<CaseSensitive className="h-7 w-7" />}
      accentColor="rgba(251,191,36,0.35)"
      features={[
        '6 case transforms in one tool',
        'UPPER, lower, Title, Sentence, camelCase, snake_case',
        'Instant transformation — no button press needed',
        'Copy result to clipboard in one click',
        'Handles multi-line text',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type or paste your text here…"
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-yellow-500/40 resize-none"
          />
        </div>

        {/* Transform buttons */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Transform</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {transforms.map(({ label, type, fn }) => (
              <button
                key={type}
                onClick={() => applyTransform(type, fn)}
                disabled={!input.trim()}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${
                  activeCase === type
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
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
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-yellow-300 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Transformed text will appear here…"
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
