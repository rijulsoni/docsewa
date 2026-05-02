"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Code2, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Encode / Decode ──────────────────────────────────────────────────────────

function encodeEntities(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (ch === '&')       { out += '&amp;'; }
    else if (ch === '<')  { out += '&lt;'; }
    else if (ch === '>')  { out += '&gt;'; }
    else if (ch === '"')  { out += '&quot;'; }
    else if (ch === "'")  { out += '&#39;'; }
    else if (code > 127)  { out += `&#${code};`; }
    else                  { out += ch; }
  }
  return out;
}

// Named entity decode map (common entities)
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  copy: '©', reg: '®', trade: '™', mdash: '—', ndash: '–', hellip: '…',
  laquo: '«', raquo: '»', ldquo: '"', rdquo: '"', lsquo: '‘', rsquo: '’',
  bull: '•', middot: '·', euro: '€', pound: '£', yen: '¥', cent: '¢',
  deg: '°', plusmn: '±', times: '×', divide: '÷', frac12: '½', frac14: '¼',
  sup2: '²', sup3: '³', infin: '∞', alpha: 'α', beta: 'β', pi: 'π',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (full, name) => NAMED[name] ?? full);
}

// ── Reference table ──────────────────────────────────────────────────────────

const ENTITY_TABLE = [
  { entity: '&amp;',   char: '&',  description: 'Ampersand' },
  { entity: '&lt;',    char: '<',  description: 'Less than' },
  { entity: '&gt;',    char: '>',  description: 'Greater than' },
  { entity: '&quot;',  char: '"',  description: 'Double quote' },
  { entity: '&#39;',   char: "'",  description: 'Single quote' },
  { entity: '&nbsp;',  char: ' ',  description: 'Non-breaking space' },
  { entity: '&copy;',  char: '©',  description: 'Copyright' },
  { entity: '&reg;',   char: '®',  description: 'Registered' },
  { entity: '&trade;', char: '™',  description: 'Trademark' },
  { entity: '&mdash;', char: '—',  description: 'Em dash' },
  { entity: '&ndash;', char: '–',  description: 'En dash' },
  { entity: '&hellip;',char: '…',  description: 'Ellipsis' },
  { entity: '&euro;',  char: '€',  description: 'Euro sign' },
  { entity: '&pound;', char: '£',  description: 'Pound sign' },
  { entity: '&yen;',   char: '¥',  description: 'Yen sign' },
  { entity: '&cent;',  char: '¢',  description: 'Cent sign' },
  { entity: '&deg;',   char: '°',  description: 'Degree sign' },
  { entity: '&plusmn;',char: '±',  description: 'Plus-minus' },
  { entity: '&times;', char: '×',  description: 'Multiplication' },
  { entity: '&divide;',char: '÷',  description: 'Division' },
  { entity: '&frac12;',char: '½',  description: 'One half' },
  { entity: '&frac14;',char: '¼',  description: 'One quarter' },
  { entity: '&laquo;', char: '«',  description: 'Left angle quote' },
  { entity: '&raquo;', char: '»',  description: 'Right angle quote' },
  { entity: '&ldquo;', char: '“', description: 'Left double quote' },
  { entity: '&rdquo;', char: '”', description: 'Right double quote' },
  { entity: '&lsquo;', char: '‘', description: 'Left single quote' },
  { entity: '&rsquo;', char: '’', description: 'Right single quote' },
  { entity: '&bull;',  char: '•',  description: 'Bullet' },
  { entity: '&infin;', char: '∞',  description: 'Infinity' },
];

export default function HtmlEntitiesPage() {
  const [tab, setTab] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const process = () => {
    setOutput(tab === 'encode' ? encodeEntities(input) : decodeEntities(input));
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const copyEntity = (entity: string) => {
    navigator.clipboard.writeText(entity);
    toast.success(`Copied ${entity}`);
  };

  return (
    <ToolPageLayout
      title="HTML Entities"
      description="Encode special characters to HTML entities and decode HTML entities back to readable text."
      icon={<Code2 className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Encode special characters to HTML entities',
        'Decode HTML entities back to text',
        'Handles non-ASCII characters (&#code;)',
        'Quick reference table of common entities',
        'Copy result to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex gap-2">
            {(['encode', 'decode'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setOutput(''); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border capitalize ${
                  tab === t
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                    : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); }}
            placeholder={tab === 'encode' ? 'Paste text with special characters…' : 'Paste HTML with entities like &amp; &lt; &#169;…'}
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 resize-none font-mono"
          />

          <button
            onClick={process}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed capitalize"
          >
            {tab}
          </button>
        </div>

        {/* Output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here…"
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all font-mono"
          />
        </div>

        {/* Reference table */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Common Entities Reference</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ENTITY_TABLE.map(({ entity, char, description }) => (
              <button
                key={entity}
                onClick={() => copyEntity(entity)}
                title={`Copy ${entity}`}
                className="flex items-center gap-3 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all text-left group"
              >
                <span className="w-7 text-center text-base shrink-0">{char}</span>
                <span className="font-mono text-xs text-indigo-300/70 shrink-0">{entity}</span>
                <span className="text-xs text-white/30 truncate">{description}</span>
                <Copy className="h-3 w-3 text-white/10 group-hover:text-indigo-300/50 ml-auto shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
