"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Search } from 'lucide-react';

type Flag = 'g' | 'i' | 'm' | 's';

const FLAG_LIST: { flag: Flag; label: string }[] = [
  { flag: 'g', label: 'g — global' },
  { flag: 'i', label: 'i — ignore case' },
  { flag: 'm', label: 'm — multiline' },
  { flag: 's', label: 's — dot-all' },
];

interface MatchInfo {
  index: number;
  value: string;
  groups: string[];
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<Set<Flag>>(new Set(['g']));
  const [testStr, setTestStr] = useState('');

  const toggleFlag = (f: Flag) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(f)) { next.delete(f); } else { next.add(f); }
      return next;
    });
  };

  const { regex, regexError, matches, highlighted } = useMemo<{
    regex: RegExp | null;
    regexError: string | null;
    matches: MatchInfo[];
    highlighted: string;
  }>(() => {
    if (!pattern) {
      return { regex: null, regexError: null, matches: [], highlighted: testStr };
    }
    let re: RegExp;
    try {
      const flagStr = Array.from(flags).join('');
      re = new RegExp(pattern, flagStr);
    } catch (e) {
      return {
        regex: null,
        regexError: `Invalid regex: ${(e as Error).message}`,
        matches: [],
        highlighted: testStr,
      };
    }

    const found: MatchInfo[] = [];
    // Ensure global flag for findAll; use a copy with 'g' if not already set
    const globalRe = flags.has('g') ? re : new RegExp(re.source, re.flags + 'g');
    let m: RegExpExecArray | null;
    while ((m = globalRe.exec(testStr)) !== null) {
      found.push({
        index: m.index,
        value: m[0],
        groups: m.slice(1),
      });
      // Prevent infinite loop on zero-length matches
      if (m[0].length === 0) { globalRe.lastIndex++; }
    }

    // Build highlighted HTML
    let lastIdx = 0;
    let html = '';
    const escHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    for (const match of found) {
      html += escHtml(testStr.slice(lastIdx, match.index));
      html += `<mark class="bg-amber-400/30 text-amber-200 rounded-sm">${escHtml(match.value)}</mark>`;
      lastIdx = match.index + match.value.length;
    }
    html += escHtml(testStr.slice(lastIdx));

    return { regex: re, regexError: null, matches: found, highlighted: html };
  }, [pattern, flags, testStr]);

  return (
    <ToolPageLayout
      title="Regex Tester"
      description="Test regular expressions live with real-time match highlighting, match list, and captured groups — fully in-browser."
      icon={<Search className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Test regular expressions live',
        'Supports g, i, m, s flags',
        'Highlights all matches in the text',
        'Shows match index and captured groups',
        'Real-time feedback as you type',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Pattern + flags */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Pattern</p>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-lg font-mono select-none">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \b\w+@\w+\.\w+\b"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 font-mono"
            />
            <span className="text-white/30 text-lg font-mono select-none">/</span>
            <span className="text-teal-400/70 font-mono text-sm min-w-[20px]">
              {Array.from(flags).join('')}
            </span>
          </div>
          {regexError && (
            <p className="text-xs text-red-400/90 font-mono">{regexError}</p>
          )}

          {/* Flag toggles */}
          <div className="flex flex-wrap gap-2">
            {FLAG_LIST.map(({ flag, label }) => (
              <label
                key={flag}
                className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none ${
                  flags.has(flag)
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                    : 'border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={flags.has(flag)}
                  onChange={() => toggleFlag(flag)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Test string */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Test String</p>
          <textarea
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            placeholder="Type or paste the text to test against…"
            rows={5}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 resize-none"
          />
        </div>

        {/* Highlighted result */}
        {testStr && (
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Match Preview</p>
              {regex && !regexError && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  {matches.length} match{matches.length !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
            <div
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 font-mono whitespace-pre-wrap break-all min-h-[60px]"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        )}

        {/* Match list */}
        {matches.length > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Matches</p>
            <ol className="space-y-2">
              {matches.map((m, i) => (
                <li key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs font-mono">
                  <span className="text-white/30 mr-2">#{i + 1}</span>
                  <span className="text-amber-300/80 mr-3">&quot;{m.value}&quot;</span>
                  <span className="text-white/30">@ index {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="ml-3 text-teal-400/60">
                      groups: [{m.groups.map((g) => g === undefined ? 'undefined' : `"${g}"`).join(', ')}]
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
