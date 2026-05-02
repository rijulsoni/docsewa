"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FilePlus2, Download, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface CsvEntry {
  file: File;
  rowCount: number;
}

export default function CsvMergePage() {
  const [files, setFiles]           = useState<CsvEntry[]>([]);
  const [keepHeader, setKeepHeader] = useState(true);
  const [isMerging, setMerging]     = useState(false);

  const onFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => f.name.toLowerCase().endsWith('.csv'));
    if (!valid.length) { toast.error('Only .csv files are supported.'); return; }
    const toAdd = valid.slice(0, 20 - files.length).map((f) => ({
      file: f,
      rowCount: 0, // placeholder — will update after reading
    }));
    // estimate row counts asynchronously
    toAdd.forEach((entry) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const count = Math.max(0, text.split('\n').length - 1);
        setFiles((prev) => {
          const idx = prev.findIndex((p) => p.file === entry.file);
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = { ...updated[idx], rowCount: count };
          return updated;
        });
      };
      reader.readAsText(entry.file);
    });
    setFiles((prev) => [...prev, ...toAdd]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleMerge = async () => {
    if (files.length < 2) { toast.error('Upload at least 2 CSV files.'); return; }
    setMerging(true);
    try {
      const texts = await Promise.all(files.map((e) => e.file.text()));
      const lines: string[] = [];

      texts.forEach((text, idx) => {
        const fileLines = text.split('\n');
        if (idx === 0) {
          // first file: include everything (including header)
          lines.push(...fileLines);
        } else if (keepHeader) {
          // skip first line (header) of subsequent files
          lines.push(...fileLines.slice(1));
        } else {
          lines.push(...fileLines);
        }
      });

      // trim trailing empty lines
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

      const merged = lines.join('\n');
      const blob = new Blob([merged], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'merged.csv';
      a.click();
      toast.success('Merged CSV downloaded!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Merge failed.');
    } finally {
      setMerging(false);
    }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="CSV Merge"
      description="Combine 2–20 CSV files into a single merged.csv — choose whether to keep only the first header row."
      icon={<FilePlus2 className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Merge 2–20 CSV files at once',
        "Optionally keep only the first file's header row",
        'Preview file names and estimated row counts',
        'Download as a single merged.csv',
        'Pure text processing — no server needed',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Options</p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setKeepHeader((v) => !v)}
              className={`relative w-10 h-5.5 rounded-full transition-colors border ${
                keepHeader
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : 'bg-white/[0.04] border-white/[0.08]'
              }`}
              style={{ width: '2.5rem', height: '1.375rem' }}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  keepHeader ? 'left-[calc(100%-1.125rem)] bg-emerald-400' : 'left-0.5 bg-white/20'
                }`}
              />
            </div>
            <span className="text-sm text-white/60">Keep header from first file only</span>
          </label>
          <p className="text-xs text-white/25 mt-2 ml-[calc(2.5rem+0.75rem)]">
            {keepHeader
              ? 'Header row from file #1 is kept; subsequent files\' first lines are skipped.'
              : 'All lines from all files are included as-is.'}
          </p>
        </div>

        {/* Drop zone */}
        {files.length < 20 && (
          <UploadDropzone
            onFiles={onFiles}
            accept=".csv"
            multiple
            fileLabel="CSV files"
            hint={`Drop .csv files — up to ${20 - files.length} more`}
            accentClass="border-emerald-500/60 bg-emerald-500/[0.06] shadow-[0_0_40px_rgba(34,197,94,0.12)]"
            buttonClass="bg-emerald-500 hover:bg-emerald-400 shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
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
              <button
                onClick={() => setFiles([])}
                className="text-xs text-white/25 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-56 overflow-y-auto">
              {files.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xs text-white/25 shrink-0 w-5 text-right">{i + 1}</span>
                  <p className="text-sm text-white/60 truncate flex-grow min-w-0">{entry.file.name}</p>
                  <span className="text-xs text-white/25 shrink-0">
                    {entry.rowCount > 0 ? `~${entry.rowCount} rows` : '…'}
                  </span>
                  <p className="text-xs text-white/30 shrink-0">{fmt(entry.file.size)}</p>
                  {!isMerging && (
                    <button
                      onClick={() => removeFile(i)}
                      className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors shrink-0"
                    >
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
            disabled={isMerging}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
          >
            {isMerging
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Merging…</>
              : <><Download className="h-4 w-4" /> Merge &amp; Download</>}
          </button>
        )}
      </div>
    </ToolPageLayout>
  );
}
