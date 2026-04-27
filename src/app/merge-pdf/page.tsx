"use client"
import React, { useState, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Files, X, GripVertical, Download, Loader2, CheckCircle2, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PdfFile { id: string; file: File; }

export default function MergePdfPage() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const addRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: File[]) => {
    const pdfsOnly = files.filter((f) => f.type === 'application/pdf');
    if (pdfsOnly.length < files.length) toast.error('Only PDF files accepted.');
    if (!pdfsOnly.length) return;
    setPdfs((p) => [...p, ...pdfsOnly.map((f) => ({ id: crypto.randomUUID(), file: f }))]);
    setResultUrl(null);
  };

  const remove = (id: string) => { setPdfs((p) => p.filter((x) => x.id !== id)); setResultUrl(null); };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleItemDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    setDragOverId(id);
    setPdfs((prev) => {
      const from = prev.findIndex((p) => p.id === draggedId);
      const to   = prev.findIndex((p) => p.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev]; const [item] = next.splice(from, 1); next.splice(to, 0, item);
      return next;
    });
  };

  const merge = async () => {
    if (pdfs.length < 2) { toast.error('Add at least 2 PDFs.'); return; }
    setIsConverting(true); setResultUrl(null);
    try {
      const fd = new FormData(); pdfs.forEach(({ file }) => fd.append('files', file));
      const res = await fetch('/api/merge-pdf', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('PDFs merged!');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Merge failed.'); }
    finally { setIsConverting(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Merge PDF"
      description="Combine multiple PDFs into one document. Drag rows to set the final page order."
      icon={<Files className="h-7 w-7" />}
      accentColor="rgba(52,211,153,0.35)"
      features={[
        'Merge 2 or more PDF files at once',
        'Drag rows to reorder before merging',
        'All pages from each file are preserved',
        'Processed server-side with pdf-lib',
        'Result downloads as a single PDF',
        'No page count or file size limits',
      ]}
    >
      {pdfs.length === 0 ? (
        <UploadDropzone
          onFiles={addFiles}
          accept="application/pdf"
          multiple
          fileLabel="PDFs"
          hint="Drop 2 or more PDF files — drag to reorder before merging"
          accentClass="border-emerald-500/60 bg-emerald-500/[0.06] shadow-[0_0_40px_rgba(52,211,153,0.12)]"
          buttonClass="bg-emerald-500 hover:bg-emerald-400 shadow-[0_4px_16px_rgba(52,211,153,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/80">{pdfs.length} file{pdfs.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-white/30">Drag rows to reorder · × to remove</p>
            </div>
            <button onClick={() => addRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-lg transition-all">
              <Plus className="h-3.5 w-3.5" /> Add more
            </button>
            <input ref={addRef} type="file" multiple accept="application/pdf" className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-2">
            {pdfs.map((pdf, idx) => (
              <div key={pdf.id} draggable onDragStart={() => handleDragStart(pdf.id)} onDragOver={(e) => handleItemDragOver(e, pdf.id)} onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab ${draggedId === pdf.id ? 'opacity-30' : ''} ${dragOverId === pdf.id && draggedId !== pdf.id ? 'border-emerald-500/40 bg-emerald-500/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                <GripVertical className="h-4 w-4 text-white/20 shrink-0" />
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0"><FileText className="h-4 w-4 text-red-400" /></div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-white/70 truncate">{pdf.file.name}</p>
                  <p className="text-xs text-white/25">{fmt(pdf.file.size)}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/20 shrink-0">{idx + 1}</div>
                <button onClick={() => remove(pdf.id)} className="w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all shrink-0"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><p className="text-sm font-semibold text-emerald-300">Merged PDF ready</p></div>
              <button onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'merged.pdf'; a.click(); }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setPdfs([]); setResultUrl(null); }} className="px-4 py-2.5 text-sm text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-all">Clear all</button>
            <button onClick={merge} disabled={isConverting || pdfs.length < 2} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(52,211,153,0.3)]">
              {isConverting ? <><Loader2 className="h-4 w-4 animate-spin" />Merging…</> : <><Files className="h-4 w-4" />Merge {pdfs.length} PDFs</>}
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
