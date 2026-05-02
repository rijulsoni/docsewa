"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Table2, Download, Loader2, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ExcelToCsvPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [sheetNames, setSheetNames]   = useState<string[]>([]);
  const [selected, setSelected]       = useState('');
  const [isProcessing, setProcessing] = useState(false);
  const [done, setDone]               = useState(false);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    const n = f.name.toLowerCase();
    if (!n.endsWith('.xlsx') && !n.endsWith('.xls')) {
      toast.error('Only .xlsx and .xls files are supported.'); return;
    }
    setFile(f); setDone(false);
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
    setProcessing(true); setDone(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('sheetName', selected);
      const res = await fetch('/api/excel-to-csv', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      const sheetLabel = res.headers.get('X-Sheet-Name') ?? selected;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${sheetLabel}.csv`;
      a.click();
      setDone(true);
      toast.success('CSV downloaded!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Excel to CSV"
      description="Export any sheet from an Excel workbook as a clean comma-separated CSV file."
      icon={<Table2 className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Upload .xlsx or .xls Excel workbooks',
        'Sheet names detected instantly in your browser',
        'Select exactly which sheet to export',
        'Output is standard CSV compatible with all apps',
        'Processed server-side with SheetJS',
        'Data types and cell values preserved',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".xlsx,.xls"
          fileLabel="Excel file"
          hint="Drop an .xlsx or .xls workbook"
          accentClass="border-green-500/60 bg-green-500/[0.06] shadow-[0_0_40px_rgba(34,197,94,0.12)]"
          buttonClass="bg-green-500 hover:bg-green-400 shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <Table2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setSheetNames([]); setSelected(''); setDone(false); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Sheet selector */}
          {sheetNames.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Sheet</p>
                <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">
                  {sheetNames.length} sheet{sheetNames.length > 1 ? 's' : ''}
                </span>
              </div>
              {sheetNames.length === 1 ? (
                <p className="text-sm text-white/70 font-medium">{sheetNames[0]}</p>
              ) : (
                <div className="relative">
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-green-500/40 pr-9"
                  >
                    {sheetNames.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
              : done
              ? <><Download className="h-4 w-4" /> Download Again</>
              : <><Download className="h-4 w-4" /> Export as CSV</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
