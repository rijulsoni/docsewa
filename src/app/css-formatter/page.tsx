"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Code2, Copy } from 'lucide-react';
import { toast } from 'sonner';

function prettifyCSS(css: string): string {
  // Remove block comments
  let s = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Normalize whitespace around special chars
  s = s.replace(/\s*{\s*/g, ' {\n').replace(/;\s*/g, ';\n').replace(/\s*}\s*/g, '\n}\n');
  return s.split('\n').map((line) => {
    const t = line.trim();
    if (!t) return '';
    if (t === '{' || t === '}') return t;
    if (t.endsWith('{')) return t;
    if (t === '}') return '}';
    // property lines
    if (t.includes(':') && !t.endsWith('{')) return '  ' + t;
    return t;
  }).filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n').trim();
}

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export default function CssFormatterPage() {
  const [input, setInput]   = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode]     = useState<'prettify' | 'minify' | null>(null);

  const run = (m: 'prettify' | 'minify') => {
    setMode(m);
    setOutput(m === 'prettify' ? prettifyCSS(input) : minifyCSS(input));
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied!');
  };

  return (
    <ToolPageLayout
      title="CSS Formatter"
      description="Prettify CSS with consistent indentation or minify it for production in one click."
      icon={<Code2 className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Prettify CSS with consistent 2-space indentation',
        'Minify CSS for production use',
        'Removes comments during processing',
        'Copy result to clipboard',
        'Handles multi-rule stylesheets',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">CSS Input</p>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setMode(null); setOutput(''); }}
            placeholder={'.button{background:#5E6AD2;color:#fff;padding:8px 16px;border-radius:8px;}'}
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 resize-none"
          />
        </div>

        <div className="flex gap-2">
          {([['prettify', 'Prettify'], ['minify', 'Minify']] as ['prettify' | 'minify', string][]).map(([m, label]) => (
            <button key={m} onClick={() => run(m)} disabled={!input.trim()}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border disabled:opacity-30 disabled:cursor-not-allowed ${
                mode === m ? 'bg-teal-500/10 border-teal-500/40 text-teal-300' : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >{label}</button>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
            <button onClick={copy} disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-teal-300 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea value={output} readOnly placeholder="Output will appear here…" rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none resize-none" />
        </div>
      </div>
    </ToolPageLayout>
  );
}
