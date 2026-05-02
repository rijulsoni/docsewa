"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Braces, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Preview {
  rowCount: number;
  columns: string[];
}

export default function JsonToExcelPage() {
  const [json, setJson]             = useState('');
  const [preview, setPreview]       = useState<Preview | null>(null);
  const [isConverting, setConverting] = useState(false);

  const parseJson = (value: string): unknown[] | null => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return null;
      return parsed as unknown[];
    } catch {
      return null;
    }
  };

  const handleChange = (value: string) => {
    setJson(value);
    setPreview(null);
    if (!value.trim()) return;
    const data = parseJson(value);
    if (!data) return;
    if (data.length === 0) { setPreview({ rowCount: 0, columns: [] }); return; }
    const first = data[0];
    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      setPreview({ rowCount: data.length, columns: Object.keys(first as Record<string, unknown>) });
    }
  };

  const handleConvert = async () => {
    if (!json.trim()) { toast.error('Paste some JSON first.'); return; }
    const data = parseJson(json);
    if (data === null) { toast.error('Input is not a valid JSON array.'); return; }
    if (data.length === 0) { toast.error('Array is empty — nothing to convert.'); return; }

    // Flatten nested values to strings
    const flat = data.map((row) => {
      if (typeof row !== 'object' || row === null || Array.isArray(row)) {
        return { value: typeof row === 'object' ? JSON.stringify(row) : String(row) };
      }
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
        rec[k] = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
      }
      return rec;
    });

    setConverting(true);
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(flat);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'output.xlsx';
      a.click();
      toast.success('Excel file downloaded!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <ToolPageLayout
      title="JSON to Excel"
      description="Paste a JSON array and instantly download a formatted .xlsx workbook — no server needed."
      icon={<Braces className="h-7 w-7" />}
      accentColor="rgba(245,158,11,0.35)"
      features={[
        'Paste a JSON array and download .xlsx instantly',
        'Uses first object as column headers',
        'Preview row count and column names',
        'Download as formatted Excel workbook',
        'Handles nested values by stringifying',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">JSON Input</p>
          <textarea
            value={json}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={'[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob",   "age": 25 }\n]'}
            rows={10}
            spellCheck={false}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-yellow-500/40 resize-none font-mono"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Preview</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-semibold">
                {preview.rowCount} row{preview.rowCount !== 1 ? 's' : ''}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50">
                {preview.columns.length} column{preview.columns.length !== 1 ? 's' : ''}
              </span>
            </div>
            {preview.columns.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preview.columns.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-white/50 font-mono"
                  >
                    {col}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Convert button */}
        <button
          onClick={handleConvert}
          disabled={isConverting || !json.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
        >
          {isConverting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
            : <><Download className="h-4 w-4" /> Convert &amp; Download .xlsx</>}
        </button>
      </div>
    </ToolPageLayout>
  );
}
