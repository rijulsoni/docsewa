"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FilePlus2, Download, Loader2, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'sheets' | 'stack';

interface FileEntry { file: File; sheetCount: number; status: 'pending' | 'done' | 'error' }

export default function MergeExcelPage() {
  const [files, setFiles]         = useState<FileEntry[]>([]);
  const [mode, setMode]           = useState<Mode>('sheets');
  const [isProcessing, setProcessing] = useState(false);
  const [done, setDone]           = useState(false);

  const onFiles = async (incoming: File[]) => {
    const valid = incoming.filter((f) => f.name.toLowerCase().endsWith('.xlsx'));
    if (!valid.length) { toast.error('Only .xlsx files supported.'); return; }
    const entries: FileEntry[] = [];
    for (const f of valid.slice(0, 20 - files.length)) {
      try {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
        entries.push({ file: f, sheetCount: wb.SheetNames.length, status: 'pending' });
      } catch {
        entries.push({ file: f, sheetCount: 1, status: 'pending' });
      }
    }
    setFiles((prev) => [...prev, ...entries]);
    setDone(false);
  };

  const handleMerge = async () => {
    if (files.length < 2) { toast.error('Upload at least 2 files.'); return; }
    setProcessing(true); setDone(false);
    const updated: FileEntry[] = files.map((e) => ({ ...e, status: 'pending' as FileEntry['status'] }));
    try {
      const fd = new FormData();
      files.forEach((e) => fd.append('files', e.file));
      fd.append('mode', mode);
      const res = await fetch('/api/merge-excel', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      updated.forEach((e) => (e.status = 'done'));
      setFiles([...updated]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'merged.xlsx';
      a.click();
      setDone(true);
      toast.success('Merged workbook downloaded!');
    } catch (err) {
      updated.forEach((e) => (e.status = 'error'));
      setFiles([...updated]);
      toast.error(err instanceof Error ? err.message : 'Merge failed.');
    } finally { setProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Merge Excel"
      description="Combine multiple .xlsx workbooks — each file as its own sheet, or rows stacked together."
      icon={<FilePlus2 className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Merge 2–20 Excel workbooks at once',
        '"Each file as a sheet" keeps all data separate',
        '"Stack rows" combines first sheets vertically',
        'Duplicate sheet names are auto-renamed',
        'Drag to reorder files before merging',
        'Processed server-side with SheetJS',
      ]}
    >
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Merge Mode</p>
          <div className="flex gap-2">
            {([['sheets', 'Each file as a sheet'], ['stack', 'Stack rows on one sheet']] as [Mode, string][]).map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border text-center ${
                  mode === m
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                    : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}>{label}</button>
            ))}
          </div>
          <p className="text-xs text-white/25 mt-2">
            {mode === 'sheets'
              ? 'Each file\'s sheets are added to the output workbook.'
              : 'First sheet from each file is stacked vertically. Header row is taken from the first file only.'}
          </p>
        </div>

        {/* Drop zone */}
        {files.length < 20 && (
          <UploadDropzone
            onFiles={onFiles}
            accept=".xlsx"
            multiple
            fileLabel="Excel files"
            hint={`Drop .xlsx files — up to ${20 - files.length} more`}
            accentClass="border-purple-500/60 bg-purple-500/[0.06] shadow-[0_0_40px_rgba(168,85,247,0.12)]"
            buttonClass="bg-purple-500 hover:bg-purple-400 shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
            icon="file"
          />
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                {files.length} file{files.length > 1 ? 's' : ''}
              </p>
              <button onClick={() => { setFiles([]); setDone(false); }}
                className="text-xs text-white/25 hover:text-red-400 transition-colors">Clear all</button>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-56 overflow-y-auto">
              {files.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <p className="text-sm text-white/60 truncate flex-grow min-w-0">{entry.file.name}</p>
                  <span className="text-xs text-white/25 shrink-0">
                    {entry.sheetCount} sheet{entry.sheetCount > 1 ? 's' : ''}
                  </span>
                  <p className="text-xs text-white/30 shrink-0">{fmt(entry.file.size)}</p>
                  {entry.status === 'done' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {entry.status === 'error' && <span className="text-xs text-red-400 shrink-0">Error</span>}
                  {entry.status === 'pending' && !isProcessing && (
                    <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length >= 2 && (
          <button
            onClick={handleMerge}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Merging…</>
              : done
              ? <><Download className="h-4 w-4" /> Download Again</>
              : <><Download className="h-4 w-4" /> Merge &amp; Download</>}
          </button>
        )}
      </div>
    </ToolPageLayout>
  );
}
