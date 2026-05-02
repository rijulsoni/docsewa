"use client"
import React, { useState, useCallback, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Table2, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Align = 'left' | 'center' | 'right';

function alignSep(a: Align) {
  if (a === 'center') return ':---:';
  if (a === 'right')  return '---:';
  return '---';
}

function buildMarkdown(cells: string[][], alignments: Align[]): string {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return '';

  // Compute column widths
  const widths = Array.from({ length: cols }, (_, ci) => {
    const sepWidth = alignSep(alignments[ci] ?? 'left').length;
    const maxCell = Math.max(...cells.map((row) => row[ci]?.length ?? 0));
    return Math.max(sepWidth, maxCell, 3);
  });

  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));

  const renderRow = (row: string[]) =>
    '| ' + row.map((cell, ci) => pad(cell, widths[ci])).join(' | ') + ' |';

  const sepRow = '| ' + alignments.map((a, ci) => pad(alignSep(a), widths[ci])).join(' | ') + ' |';

  const lines: string[] = [];
  lines.push(renderRow(cells[0]));
  lines.push(sepRow);
  for (let r = 1; r < rows; r++) lines.push(renderRow(cells[r]));
  return lines.join('\n');
}

const MAX = 10;
const MIN = 1;

function makeGrid(rows: number, cols: number, old: string[][]): string[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => old[r]?.[c] ?? '')
  );
}

export default function MarkdownTableGeneratorPage() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [cells, setCells] = useState<string[][]>(() =>
    Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => r === 0 ? `Column ${c + 1}` : '')
    )
  );
  const [alignments, setAlignments] = useState<Align[]>(() => Array(3).fill('left'));

  const resize = (newRows: number, newCols: number) => {
    const r = Math.max(MIN, Math.min(MAX, newRows));
    const c = Math.max(MIN, Math.min(MAX, newCols));
    setCells((old) => makeGrid(r, c, old));
    setAlignments((old) => Array.from({ length: c }, (_, i) => old[i] ?? 'left'));
    setRows(r);
    setCols(c);
  };

  const updateCell = useCallback((r: number, c: number, val: string) => {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
  }, []);

  const setAlign = (ci: number, a: Align) => {
    setAlignments((prev) => {
      const next = [...prev];
      next[ci] = a;
      return next;
    });
  };

  const markdown = useMemo(() => buildMarkdown(cells, alignments), [cells, alignments]);

  const copy = () => {
    navigator.clipboard.writeText(markdown);
    toast.success('Markdown copied to clipboard!');
  };

  const ALIGN_OPTIONS: { value: Align; label: string }[] = [
    { value: 'left',   label: 'L' },
    { value: 'center', label: 'C' },
    { value: 'right',  label: 'R' },
  ];

  return (
    <ToolPageLayout
      title="Markdown Table Generator"
      description="Build Markdown tables visually. Set column alignments, resize up to 10×10, and copy the formatted Markdown instantly."
      icon={<Table2 className="h-7 w-7" />}
      accentColor="rgba(251,146,60,0.35)"
      features={[
        'Visual table builder for Markdown',
        'Set alignment per column (left/center/right)',
        'Resize up to 10×10 cells',
        'Live Markdown preview',
        'Copy formatted Markdown to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Size controls */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Table Size</p>
          <div className="flex flex-wrap gap-6">
            {[
              { label: 'Rows', value: rows, key: 'rows' },
              { label: 'Columns', value: cols, key: 'cols' },
            ].map(({ label, value, key }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-white/50 w-16">{label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => key === 'rows' ? resize(rows - 1, cols) : resize(rows, cols - 1)}
                    disabled={value <= MIN}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-30 text-lg font-bold leading-none"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-mono text-white/70">{value}</span>
                  <button
                    onClick={() => key === 'rows' ? resize(rows + 1, cols) : resize(rows, cols + 1)}
                    disabled={value >= MAX}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-30 text-lg font-bold leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alignment row */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Column Alignment</p>
          <div className="flex gap-2 flex-wrap">
            {alignments.map((align, ci) => (
              <div key={ci} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-white/30">Col {ci + 1}</span>
                <div className="flex border border-white/[0.08] rounded-lg overflow-hidden">
                  {ALIGN_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setAlign(ci, value)}
                      className={`px-2.5 py-1.5 text-xs font-bold transition-all ${
                        align === value
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-white/[0.02] text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table grid editor */}
        <div className="glass-card rounded-2xl p-5 space-y-3 overflow-x-auto">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Table Data</p>
          <table className="w-full border-collapse">
            <tbody>
              {cells.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-1">
                      <input
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        placeholder={ri === 0 ? `Col ${ci + 1}` : ''}
                        className={`w-full min-w-[80px] bg-white/[0.04] border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none transition-colors ${
                          ri === 0
                            ? 'border-orange-500/20 text-white/80 font-semibold focus:border-orange-500/40 placeholder:text-white/15'
                            : 'border-white/[0.08] text-white/60 focus:border-white/[0.15] placeholder:text-white/10'
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Markdown preview */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Markdown Output</p>
            <button
              onClick={copy}
              disabled={!markdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-orange-300 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Markdown
            </button>
          </div>
          <textarea
            value={markdown}
            readOnly
            rows={rows + 3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none resize-none select-all font-mono"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
