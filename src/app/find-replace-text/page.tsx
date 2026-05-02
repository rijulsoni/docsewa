"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Search, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

function downloadTxt(content: string, filename = 'replaced.txt') {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function FindReplaceTextPage() {
  const [document, setDocument] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regexMode, setRegexMode] = useState(false);
  const [output, setOutput] = useState('');
  const [regexError, setRegexError] = useState('');

  const buildRegex = (flags?: string): RegExp | null => {
    if (!find) return null;
    try {
      setRegexError('');
      const f = flags ?? (caseSensitive ? 'g' : 'gi');
      if (regexMode) {
        const pattern = wholeWord ? `\\b(?:${find})\\b` : find;
        return new RegExp(pattern, f);
      } else {
        const escaped = escapeRegex(find);
        const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
        return new RegExp(pattern, f);
      }
    } catch (e) {
      setRegexError(e instanceof Error ? e.message : 'Invalid pattern');
      return null;
    }
  };

  const matchCount = useMemo(() => {
    if (!find || !document) return 0;
    const re = buildRegex();
    if (!re) return 0;
    return (document.match(re) || []).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [find, document, caseSensitive, wholeWord, regexMode]);

  const preview = useMemo(() => {
    if (!find || !document) return escapeHtml(document);
    const re = buildRegex();
    if (!re) return escapeHtml(document);
    const parts: string[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    const src = document;
    const reWithG = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    while ((m = reWithG.exec(src)) !== null) {
      parts.push(escapeHtml(src.slice(last, m.index)));
      parts.push(`<mark class="bg-amber-400/30 text-amber-200 rounded px-0.5">${escapeHtml(m[0])}</mark>`);
      last = m.index + m[0].length;
      if (m[0].length === 0) reWithG.lastIndex++;
    }
    parts.push(escapeHtml(src.slice(last)));
    return parts.join('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [find, document, caseSensitive, wholeWord, regexMode]);

  const handleReplaceAll = () => {
    const re = buildRegex();
    if (!re) return;
    const result = document.replace(re, replace);
    setOutput(result);
    toast.success(`Replaced ${matchCount} occurrence${matchCount !== 1 ? 's' : ''}`);
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const toggleOptions = [
    { label: 'Case sensitive', value: caseSensitive, set: setCaseSensitive },
    { label: 'Whole word', value: wholeWord, set: setWholeWord },
    { label: 'Regex mode', value: regexMode, set: setRegexMode },
  ];

  return (
    <ToolPageLayout
      title="Find & Replace Text"
      description="Find and replace text in any document with support for regex, case sensitivity, and whole-word matching."
      icon={<Search className="h-7 w-7" />}
      accentColor="rgba(245,158,11,0.35)"
      features={[
        'Find and replace text in any document',
        'Case-sensitive and whole-word options',
        'Regex pattern support',
        'Live match highlighting',
        'Replace all occurrences at once',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Find / Replace inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Find &amp; Replace</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-white/30">Find</label>
              <input
                value={find}
                onChange={(e) => setFind(e.target.value)}
                placeholder="Search term or regex…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40"
              />
              {regexError && <p className="text-xs text-red-400">{regexError}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/30">Replace with</label>
              <input
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Replacement text…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4 pt-1">
            {toggleOptions.map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  role="switch"
                  aria-checked={value}
                  onClick={() => set(!value)}
                  className={`relative w-9 h-5 rounded-full transition-colors border ${value ? 'bg-amber-500/30 border-amber-500/50' : 'bg-white/[0.04] border-white/[0.08]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : ''}`} />
                </button>
                <span className="text-sm text-white/50">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Document input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Document</p>
            {find && matchCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                {matchCount} match{matchCount !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
          <textarea
            value={document}
            onChange={(e) => { setDocument(e.target.value); setOutput(''); }}
            placeholder="Paste your document here…"
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 resize-none"
          />
        </div>

        {/* Live highlight preview */}
        {find && document && (
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Match Preview</p>
            <div
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 min-h-[80px] whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        )}

        {/* Replace All button */}
        <div className="flex justify-end">
          <button
            onClick={handleReplaceAll}
            disabled={!find || !document || !!regexError}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Replace All
          </button>
        </div>

        {/* Output */}
        {output && (
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button
                  onClick={() => downloadTxt(output)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> .txt
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              rows={8}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none resize-none select-all"
            />
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
