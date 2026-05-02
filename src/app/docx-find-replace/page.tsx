"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Search, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DocxFindReplacePage() {
  const [file, setFile] = useState<File | null>(null);
  const [find, setFind]       = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [replaceCount, setReplaceCount] = useState<number | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.docx')) { toast.error('Only .docx files are supported.'); return; }
    setFile(f); setResultUrl(null); setReplaceCount(null);
  };

  const handleProcess = async () => {
    if (!file) { toast.error('Please select a DOCX file.'); return; }
    if (!find.trim()) { toast.error('Enter the text to find.'); return; }
    setIsProcessing(true); setResultUrl(null); setReplaceCount(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('find', find);
      fd.append('replace', replace);
      fd.append('caseSensitive', String(caseSensitive));
      const res = await fetch('/api/docx-find-replace', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const count = Number(res.headers.get('X-Replace-Count') ?? 0);
      setReplaceCount(count);
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success(count > 0 ? `Replaced ${count} occurrence${count !== 1 ? 's' : ''}!` : 'No matches found.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Processing failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Find & Replace"
      description="Bulk-replace any text string in a Word document — case-sensitive or case-insensitive."
      icon={<Search className="h-7 w-7" />}
      accentColor="rgba(245,158,11,0.35)"
      features={[
        'Replaces all occurrences in the document body',
        'Optional case-sensitive matching',
        'Replace with empty string to delete text',
        'Shows count of replacements made',
        'Processed server-side with JSZip',
        'Works on any standard .docx file',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx"
          fileLabel="DOCX"
          hint="Drop a Word document — find and replace text inside it"
          accentClass="border-amber-500/60 bg-amber-500/[0.06] shadow-[0_0_40px_rgba(245,158,11,0.12)]"
          buttonClass="bg-amber-500 hover:bg-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setResultUrl(null); setReplaceCount(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-white/70">Search & Replace</p>

            <div>
              <p className="text-xs text-white/40 mb-1.5">Find</p>
              <input
                type="text" value={find} onChange={e => setFind(e.target.value)} placeholder="Text to search for…"
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1.5">Replace with <span className="text-white/20">— leave blank to delete</span></p>
              <input
                type="text" value={replace} onChange={e => setReplace(e.target.value)} placeholder="Replacement text…"
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              onClick={() => setCaseSensitive(v => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
                caseSensitive
                  ? 'border-amber-500/50 bg-amber-500/[0.10] text-amber-300'
                  : 'border-white/[0.06] text-white/40 hover:border-white/[0.12]'
              )}
            >
              <span className={cn('w-3 h-3 rounded-sm border flex items-center justify-center shrink-0', caseSensitive ? 'bg-amber-500 border-amber-500' : 'border-white/20')}>
                {caseSensitive && <span className="text-[8px] text-white font-bold">✓</span>}
              </span>
              Case sensitive
            </button>
          </div>

          {resultUrl && replaceCount !== null && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-300">
                  {replaceCount > 0 ? `${replaceCount} replacement${replaceCount !== 1 ? 's' : ''} made` : 'No matches found'}
                </p>
              </div>
              {replaceCount > 0 && (
                <button
                  onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = file!.name.replace(/\.docx$/i, '') + '-replaced.docx'; a.click(); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={isProcessing || !find.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><Search className="h-4 w-4" /> Replace All</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
