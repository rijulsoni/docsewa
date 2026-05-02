"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileSpreadsheet, Download, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CsvToExcelPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string[][]>([]);
  const [sheetName, setSheetName]     = useState('Sheet1');
  const [isProcessing, setProcessing] = useState(false);
  const [done, setDone]               = useState(false);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.csv') && f.type !== 'text/csv') {
      toast.error('Only .csv files are supported.'); return;
    }
    setFile(f); setDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      const rows = text.split('\n').slice(0, 5).map((row) => row.split(',').map((c) => c.trim()));
      setPreview(rows.filter((r) => r.some((c) => c)));
    };
    reader.readAsText(f);
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true); setDone(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('sheetName', sheetName || 'Sheet1');
      const res = await fetch('/api/csv-to-excel', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.csv$/i, '') + '.xlsx';
      a.click();
      setDone(true);
      toast.success('Excel file downloaded!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="CSV to Excel"
      description="Convert a CSV file to a formatted .xlsx workbook with a custom sheet name."
      icon={<FileSpreadsheet className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Upload any .csv file — quoted fields handled correctly',
        'Preview the first 5 rows before converting',
        'Set a custom sheet name for the output workbook',
        'Downloads as a standard .xlsx file',
        'Compatible with Excel, Numbers, and Google Sheets',
        'Processed server-side with SheetJS',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".csv,text/csv"
          fileLabel="CSV file"
          hint="Drop a .csv file to convert to Excel"
          accentClass="border-blue-500/60 bg-blue-500/[0.06] shadow-[0_0_40px_rgba(59,130,246,0.12)]"
          buttonClass="bg-blue-500 hover:bg-blue-400 shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setPreview([]); setDone(false); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Options */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Sheet Name</p>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value.slice(0, 31))}
                placeholder="Sheet1"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-blue-500/40"
              />
            </div>

            {preview.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Preview (first {preview.length} rows)</p>
                <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                  <table className="w-full text-xs">
                    {preview.map((row, i) => (
                      <tr key={i} className={i === 0 ? 'bg-white/[0.06]' : 'bg-transparent'}>
                        {row.slice(0, 6).map((cell, j) => (
                          <td key={j} className="px-3 py-1.5 text-white/50 border-b border-r border-white/[0.04] truncate max-w-[100px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
              : done
              ? <><Download className="h-4 w-4" /> Download Again</>
              : <><Download className="h-4 w-4" /> Convert to Excel</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
