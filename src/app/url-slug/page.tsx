"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Link, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Slug algorithm ────────────────────────────────────────────────────────────
function slugify(
  text: string,
  separator: '-' | '_',
  lowercase: boolean,
  removeNumbers: boolean,
): string {
  let s = text.trim();
  if (lowercase) s = s.toLowerCase();
  if (removeNumbers) s = s.replace(/[0-9]/g, '');
  // replace any non-alphanumeric character with separator
  s = s.replace(/[^a-zA-Z0-9]+/g, separator);
  // collapse consecutive separators
  const escapedSep = separator === '-' ? '-' : '_';
  s = s.replace(new RegExp(`\\${escapedSep}+`, 'g'), separator);
  // trim leading / trailing separators
  s = s.replace(new RegExp(`^\\${escapedSep}+|\\${escapedSep}+$`, 'g'), '');
  return s;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UrlSlugPage() {
  const [input, setInput]         = useState('');
  const [separator, setSeparator] = useState<'-' | '_'>('-');
  const [lowercase, setLowercase] = useState(true);
  const [noNumbers, setNoNumbers] = useState(false);

  const lines   = input.split('\n');
  const slugs   = lines.map((l) => slugify(l, separator, lowercase, noNumbers));
  const output  = slugs.join('\n');
  const hasOutput = output.trim() !== '';

  const copyAll = () => {
    if (!hasOutput) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const ToggleChip = ({
    label,
    active,
    onToggle,
  }: {
    label: string;
    active: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        active
          ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
          : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <ToolPageLayout
      title="URL Slug Generator"
      description="Convert plain text into clean, URL-friendly slugs. Supports multi-line batch conversion."
      icon={<Link className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Convert text to URL-friendly slugs',
        'Works on multiple lines at once',
        'Choose dash or underscore separator',
        'Toggle lowercase and number removal',
        'Copy all results to clipboard',
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
            placeholder={"My Blog Post Title\nAnother Great Article\nHello World 2025"}
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 resize-none font-mono"
          />
          <p className="text-xs text-white/25">One title per line — each line is slugified independently.</p>
        </div>

        {/* Options */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Options</p>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Separator toggle */}
            <div className="flex items-center border border-white/[0.08] rounded-lg overflow-hidden">
              <button
                onClick={() => setSeparator('-')}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  separator === '-'
                    ? 'bg-purple-500/10 text-purple-300'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                dash (-)
              </button>
              <div className="w-px h-5 bg-white/[0.08]" />
              <button
                onClick={() => setSeparator('_')}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  separator === '_'
                    ? 'bg-purple-500/10 text-purple-300'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                underscore (_)
              </button>
            </div>

            <ToggleChip label="Lowercase" active={lowercase} onToggle={() => setLowercase((v) => !v)} />
            <ToggleChip label="Remove numbers" active={noNumbers} onToggle={() => setNoNumbers((v) => !v)} />
          </div>
        </div>

        {/* Output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Slugs</p>
            <button
              onClick={copyAll}
              disabled={!hasOutput}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" /> Copy all
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Slugs will appear here…"
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none font-mono select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
