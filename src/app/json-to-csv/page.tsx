"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Table2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

function jsonToCsv(data: Record<string, unknown>[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...data.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
}

export default function JsonToCsvPage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const parsed = useMemo(() => {
    if (!input.trim()) { setError(''); return null; }
    try {
      const data = JSON.parse(input);
      if (!Array.isArray(data)) { setError('Input must be a JSON array.'); return null; }
      if (data.length === 0)    { setError('Array is empty.'); return null; }
      if (typeof data[0] !== 'object' || data[0] === null) { setError('Array items must be objects.'); return null; }
      setError('');
      return data as Record<string, unknown>[];
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      return null;
    }
  }, [input]);

  const csv = useMemo(() => parsed ? jsonToCsv(parsed) : '', [parsed]);

  const download = () => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'output.csv';
    a.click();
    toast.success('CSV downloaded!');
  };

  const copy = () => {
    navigator.clipboard.writeText(csv);
    toast.success('CSV copied!');
  };

  const headers = parsed ? Object.keys(parsed[0]) : [];
  const preview = parsed ? parsed.slice(0, 5) : [];

  return (
    <ToolPageLayout
      title="JSON to CSV"
      description="Paste a JSON array of objects and download it as a clean CSV file."
      icon={<Table2 className="h-7 w-7" />}
      accentColor="rgba(245,158,11,0.35)"
      features={[
        'Paste a JSON array and get a CSV instantly',
        'Column headers from first object keys',
        'Nested values are stringified',
        'Preview first 5 rows before downloading',
        'Copy to clipboard or download as .csv',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">JSON Input</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob",   "age": 25 }\n]'}
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 resize-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {parsed && (
          <>
            {/* Preview table */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Preview ({parsed.length} rows, {headers.length} columns)
                </p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-white/50 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {preview.map((row, i) => (
                      <tr key={i}>
                        {headers.map((h) => (
                          <td key={h} className="px-3 py-2 text-white/40 max-w-[120px] truncate">{String(row[h] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsed.length > 5 && <p className="text-xs text-white/25">Showing 5 of {parsed.length} rows</p>}
            </div>

            <div className="flex gap-2">
              <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04] text-sm font-semibold rounded-xl transition-all">
                <Copy className="h-4 w-4" /> Copy CSV
              </button>
              <button onClick={download} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)]">
                <Download className="h-4 w-4" /> Download .csv
              </button>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
