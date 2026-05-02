"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Braces, Download, Loader2, X, Copy, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ExcelToJsonPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [sheetNames, setSheetNames]   = useState<string[]>([]);
  const [selected, setSelected]       = useState('');
  const [useKeys, setUseKeys]         = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [json, setJson]               = useState<unknown[] | null>(null);
  const [rowCount, setRowCount]       = useState(0);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    const n = f.name.toLowerCase();
    if (!n.endsWith('.xlsx') && !n.endsWith('.xls')) {
      toast.error('Only .xlsx and .xls files are supported.'); return;
    }
    setFile(f); setJson(null);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
      setSheetNames(wb.SheetNames);
      setSelected(wb.SheetNames[0]);
    } catch {
      setSheetNames([]); setSelected('');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true); setJson(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('sheetName', selected);
      fd.append('useFirstRowAsKeys', String(useKeys));
      const res = await fetch('/api/excel-to-json', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json() as unknown[];
      setJson(data);
      setRowCount(Number(res.headers.get('X-Row-Count') ?? data.length));
      toast.success(`${data.length} rows converted!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setProcessing(false); }
  };

  const handleCopy = () => {
    if (!json) return;
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!json || !file) return;
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name.replace(/\.[^.]+$/, '') + '.json';
    a.click();
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const preview = json ? JSON.stringify(json.slice(0, 3), null, 2) : '';

  return (
    <ToolPageLayout
      title="Excel to JSON"
      description="Export spreadsheet rows as a JSON array — preview results before downloading."
      icon={<Braces className="h-7 w-7" />}
      accentColor="rgba(245,158,11,0.35)"
      features={[
        'Upload .xlsx or .xls Excel files',
        'Select which sheet to export',
        'First row used as object keys (toggleable)',
        'Preview first 3 rows before downloading',
        'Copy JSON directly to clipboard',
        'Processed server-side with SheetJS',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".xlsx,.xls"
          fileLabel="Excel file"
          hint="Drop an .xlsx or .xls workbook to convert to JSON"
          accentClass="border-amber-500/60 bg-amber-500/[0.06] shadow-[0_0_40px_rgba(245,158,11,0.12)]"
          buttonClass="bg-amber-500 hover:bg-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Braces className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setSheetNames([]); setSelected(''); setJson(null); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Options */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            {sheetNames.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Sheet</p>
                <div className="relative">
                  <select value={selected} onChange={(e) => setSelected(e.target.value)}
                    className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-amber-500/40 pr-9">
                    {sheetNames.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                </div>
              </div>
            )}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={useKeys} onChange={(e) => setUseKeys(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded" />
              <span className="text-sm text-white/50">Use first row as object keys</span>
            </label>
          </div>

          {/* JSON preview */}
          {json && (
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Preview · {rowCount} rows
                </p>
                {json.length > 3 && (
                  <span className="text-[10px] text-white/25">… {json.length - 3} more rows in download</span>
                )}
              </div>
              <pre className="text-xs text-white/50 font-mono bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 overflow-auto max-h-48">
                {preview}
              </pre>
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-white/[0.08] hover:bg-white/[0.05] text-white/60 hover:text-white/80 text-sm font-semibold rounded-xl transition-all">
                  <Copy className="h-4 w-4" /> Copy JSON
                </button>
                <button onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all">
                  <Download className="h-4 w-4" /> Download .json
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
              : <><Braces className="h-4 w-4" /> Convert to JSON</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
