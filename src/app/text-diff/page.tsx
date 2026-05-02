"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { GitCompare } from 'lucide-react';
import { diffLines } from 'diff';

export default function TextDiffPage() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const { parts, additions, deletions } = useMemo(() => {
    if (!textA && !textB) return { parts: [], additions: 0, deletions: 0 };
    const result = diffLines(textA, textB);
    let additions = 0;
    let deletions = 0;
    for (const part of result) {
      if (part.added) additions += part.count ?? 1;
      if (part.removed) deletions += part.count ?? 1;
    }
    return { parts: result, additions, deletions };
  }, [textA, textB]);

  const hasDiff = textA !== '' || textB !== '';

  return (
    <ToolPageLayout
      title="Text Diff"
      description="Paste two blocks of text to compare them line by line. Additions are highlighted green, removals in red."
      icon={<GitCompare className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'Compare two text blocks line by line',
        'Added lines highlighted in green',
        'Removed lines highlighted in red',
        'Summary of additions and deletions',
        'Live comparison as you type',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Two textareas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Text A</p>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Paste original text here…"
              rows={12}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-red-500/40 resize-none"
            />
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Text B</p>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Paste modified text here…"
              rows={12}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-red-500/40 resize-none"
            />
          </div>
        </div>

        {/* Diff output */}
        {hasDiff && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            {/* Summary badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Diff</p>
              <div className="flex gap-2 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                  +{additions} addition{additions !== 1 ? 's' : ''}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                  -{deletions} deletion{deletions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Scrollable diff view */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 overflow-auto max-h-96 font-mono text-sm leading-relaxed">
              {parts.length === 0 ? (
                <span className="text-white/20">No differences found.</span>
              ) : (
                parts.map((part, i) => {
                  const lines = part.value.replace(/\n$/, '').split('\n');
                  return lines.map((line, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`px-2 py-0.5 rounded ${
                        part.added
                          ? 'bg-green-500/10 text-green-300'
                          : part.removed
                          ? 'bg-red-500/10 text-red-300'
                          : 'text-white/35'
                      }`}
                    >
                      <span className="select-none mr-2 opacity-40">
                        {part.added ? '+' : part.removed ? '-' : ' '}
                      </span>
                      {line || ' '}
                    </div>
                  ));
                })
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
