"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Braces, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const prettify = () => {
    clearError();
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      setOutput('');
    }
  };

  const minify = () => {
    clearError();
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      setOutput('');
    }
  };

  const validate = () => {
    clearError();
    try {
      JSON.parse(input);
      toast.success('Valid JSON!');
      setOutput('');
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
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
      title="JSON Formatter"
      description="Prettify, minify, and validate your JSON instantly — all in your browser, no data leaves your machine."
      icon={<Braces className="h-7 w-7" />}
      accentColor="rgba(245,158,11,0.35)"
      features={[
        'Prettify with 2-space indentation',
        'Minify JSON to a single line',
        'Validate and show exact error location',
        'Copy result to clipboard',
        'Handles any valid JSON input',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); clearError(); }}
            placeholder='Paste your JSON here… e.g. {"name":"DocSewa"}'
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 resize-none font-mono"
          />
        </div>

        {/* Actions */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={prettify}
              disabled={!input.trim()}
              className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prettify
            </button>
            <button
              onClick={minify}
              disabled={!input.trim()}
              className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Minify
            </button>
            <button
              onClick={validate}
              disabled={!input.trim()}
              className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Validate
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-400/90 font-mono mt-1">{error}</p>
          )}
        </div>

        {/* Output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here…"
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none font-mono select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
