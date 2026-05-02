"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { GitCompare, Download, Loader2 } from 'lucide-react';
import { diffLines, Change } from 'diff';
import { toast } from 'sonner';

interface DiffSummary {
  added: number;
  removed: number;
  unchanged: number;
  changes: Change[];
}

export default function CsvDiffPage() {
  const [fileA, setFileA]     = useState<File | null>(null);
  const [fileB, setFileB]     = useState<File | null>(null);
  const [diff, setDiff]       = useState<DiffSummary | null>(null);
  const [isRunning, setRunning] = useState(false);

  const onFileA = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.csv')) { toast.error('File A must be a .csv file.'); return; }
    setFileA(f);
    setDiff(null);
  };

  const onFileB = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.csv')) { toast.error('File B must be a .csv file.'); return; }
    setFileB(f);
    setDiff(null);
  };

  const handleDiff = async () => {
    if (!fileA || !fileB) { toast.error('Upload both files first.'); return; }
    setRunning(true);
    try {
      const [textA, textB] = await Promise.all([fileA.text(), fileB.text()]);
      const changes = diffLines(textA, textB);
      let added = 0; let removed = 0; let unchanged = 0;
      for (const c of changes) {
        const count = c.count ?? 0;
        if (c.added)   added   += count;
        else if (c.removed) removed += count;
        else unchanged += count;
      }
      setDiff({ added, removed, unchanged, changes });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Diff failed.');
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = () => {
    if (!diff) return;
    const lines: string[] = [];
    for (const c of diff.changes) {
      const prefix = c.added ? '+ ' : c.removed ? '- ' : '  ';
      const value = c.value.replace(/\n$/, '');
      value.split('\n').forEach((line) => lines.push(prefix + line));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diff.txt';
    a.click();
    toast.success('Diff downloaded!');
  };

  const dropzoneShared = {
    accept: '.csv',
    multiple: false,
    fileLabel: 'CSV file',
    icon: 'file' as const,
  };

  return (
    <ToolPageLayout
      title="CSV Diff"
      description="Upload two CSV files and compare them line by line — added, removed, and unchanged lines highlighted."
      icon={<GitCompare className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'Upload two CSV files and compare line by line',
        'Added lines highlighted in green',
        'Removed lines highlighted in red',
        'Download diff as a text file',
        'Summary of changes at a glance',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Two upload zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">File A (original)</p>
            {fileA ? (
              <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3">
                <p className="text-sm text-white/60 truncate min-w-0">{fileA.name}</p>
                <button
                  onClick={() => { setFileA(null); setDiff(null); }}
                  className="text-xs text-white/25 hover:text-red-400 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <UploadDropzone
                {...dropzoneShared}
                onFiles={onFileA}
                hint="Drop File A here"
                accentClass="border-red-500/60 bg-red-500/[0.06] shadow-[0_0_40px_rgba(239,68,68,0.12)]"
                buttonClass="bg-red-500 hover:bg-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
              />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">File B (modified)</p>
            {fileB ? (
              <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3">
                <p className="text-sm text-white/60 truncate min-w-0">{fileB.name}</p>
                <button
                  onClick={() => { setFileB(null); setDiff(null); }}
                  className="text-xs text-white/25 hover:text-red-400 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <UploadDropzone
                {...dropzoneShared}
                onFiles={onFileB}
                hint="Drop File B here"
                accentClass="border-red-500/60 bg-red-500/[0.06] shadow-[0_0_40px_rgba(239,68,68,0.12)]"
                buttonClass="bg-red-500 hover:bg-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
              />
            )}
          </div>
        </div>

        {/* Compare button */}
        {fileA && fileB && (
          <button
            onClick={handleDiff}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
          >
            {isRunning
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Comparing…</>
              : <><GitCompare className="h-4 w-4" /> Compare Files</>}
          </button>
        )}

        {/* Diff result */}
        {diff && (
          <>
            {/* Summary */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Summary</p>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download .txt
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                  +{diff.added} added
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 font-semibold">
                  -{diff.removed} removed
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40">
                  {diff.unchanged} unchanged
                </span>
              </div>
            </div>

            {/* Diff viewer */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Diff</p>
              </div>
              <div className="max-h-96 overflow-y-auto font-mono text-xs">
                {diff.changes.map((change, ci) => {
                  const lines = change.value.replace(/\n$/, '').split('\n');
                  return lines.map((line, li) => (
                    <div
                      key={`${ci}-${li}`}
                      className={`px-4 py-0.5 flex gap-2 ${
                        change.added
                          ? 'bg-emerald-500/[0.08] text-emerald-300'
                          : change.removed
                          ? 'bg-red-500/[0.08] text-red-300'
                          : 'text-white/35'
                      }`}
                    >
                      <span className="shrink-0 w-3 select-none">
                        {change.added ? '+' : change.removed ? '-' : ' '}
                      </span>
                      <span className="truncate">{line}</span>
                    </div>
                  ));
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
