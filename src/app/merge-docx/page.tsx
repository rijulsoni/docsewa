"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Files, FileText, Download, Loader2, CheckCircle2, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function MergeDocxPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (incoming: File[]) => {
    const valid = incoming.filter(f => f.name.toLowerCase().endsWith('.docx'));
    if (valid.length !== incoming.length) toast.warning('Only .docx files are accepted — others skipped.');
    setFiles(prev => [...prev, ...valid]);
    setResultUrl(null);
  };

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setResultUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) { toast.error('Upload at least 2 DOCX files.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      const res = await fetch('/api/merge-docx', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success(`${files.length} documents merged!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Merge failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Merge DOCX"
      description="Combine multiple Word documents into one — each document starts on a new page."
      icon={<Files className="h-7 w-7" />}
      accentColor="rgba(16,185,129,0.35)"
      features={[
        'Combine 2 or more .docx files into one',
        'Each source document starts on a new page',
        'Styles and layout from the first file are used',
        'Upload files in the order you want them merged',
        'Processed server-side with JSZip',
        'Works on any standard .docx files',
      ]}
    >
      <div className="space-y-4">
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx"
          multiple
          fileLabel="DOCX files"
          hint="Drop multiple Word documents — they will be merged in order"
          accentClass="border-emerald-500/60 bg-emerald-500/[0.06] shadow-[0_0_40px_rgba(16,185,129,0.12)]"
          buttonClass="bg-emerald-500 hover:bg-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
          icon="file"
        />

        {files.length > 0 && (
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
              Merge order — {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <GripVertical className="h-4 w-4 text-white/20 shrink-0" />
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-white/70 truncate">{f.name}</p>
                  <p className="text-xs text-white/25">{fmt(f.size)}</p>
                </div>
                <span className="text-xs text-white/20 mr-1">#{i + 1}</span>
                <button onClick={() => removeFile(i)} className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {resultUrl && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-sm font-semibold text-emerald-300">{files.length} files merged</p>
            </div>
            <button
              onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'merged.docx'; a.click(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        )}

        <button
          onClick={handleMerge}
          disabled={isProcessing || files.length < 2}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
        >
          {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Merging…</> : <><Files className="h-4 w-4" /> Merge {files.length > 0 ? `${files.length} Files` : 'Files'}</>}
        </button>
      </div>
    </ToolPageLayout>
  );
}
