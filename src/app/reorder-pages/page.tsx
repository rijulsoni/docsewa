"use client"
import React, { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { ArrowUpDown, FileText, Download, Loader2, CheckCircle2, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface PageThumb {
  index: number;
  dataUrl: string;
}

export default function ReorderPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const onFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f);
    fileRef.current = f;
    setPages([]);
    setResultUrl(null);
    setIsRendering(true);
    setRenderProgress(0);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
      const total = pdf.numPages;
      const thumbs: PageThumb[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        thumbs.push({ index: i - 1, dataUrl: canvas.toDataURL('image/jpeg', 0.7) });
        setRenderProgress(Math.round((i / total) * 100));
      }

      setPages(thumbs);
      toast.success(`${total} pages loaded — drag to reorder`);
    } catch {
      toast.error('Could not render PDF thumbnails.');
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  }, []);

  const handleThumbDragStart = (listIdx: number) => setDraggedIdx(listIdx);
  const handleThumbDragEnd = () => { setDraggedIdx(null); setDragOverIdx(null); };
  const handleThumbDragOver = (e: React.DragEvent, listIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === listIdx) return;
    setDragOverIdx(listIdx);
    setPages((prev) => {
      const next = [...prev];
      const [item] = next.splice(draggedIdx, 1);
      next.splice(listIdx, 0, item);
      setDraggedIdx(listIdx);
      return next;
    });
  };

  const handleApply = async () => {
    if (!fileRef.current || pages.length === 0) { toast.error('Load a PDF first.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const order = pages.map((p) => p.index).join(',');
      const fd = new FormData();
      fd.append('file', fileRef.current);
      fd.append('order', order);
      const res = await fetch('/api/reorder-pages', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Pages reordered!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reorder failed.');
    } finally { setIsProcessing(false); }
  };

  const reset = () => { setFile(null); fileRef.current = null; setPages([]); setResultUrl(null); };
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Reorder Pages"
      description="Drag page thumbnails into the order you want, then download the rebuilt PDF."
      icon={<ArrowUpDown className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.4)"
      features={[
        'Visual thumbnail preview of every page',
        'Drag and drop to rearrange in real time',
        'Shows original page number for reference',
        'Rendered entirely in your browser',
        'Rebuilt PDF processed server-side',
        'Supports PDFs with any number of pages',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — drag thumbnails to set the page order"
          accentClass="border-indigo-500/60 bg-indigo-500/[0.06] shadow-[0_0_40px_rgba(99,102,241,0.15)]"
          buttonClass="bg-indigo-500 hover:bg-indigo-400 shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)} · {pages.length} pages</p>
            </div>
            <button onClick={reset} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {isRendering && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                <p className="text-sm text-white/60">Rendering thumbnails… {renderProgress}%</p>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
          )}

          {pages.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-white/30 mb-3 flex items-center gap-1.5">
                <GripVertical className="h-3.5 w-3.5" /> Drag thumbnails to reorder
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {pages.map((page, listIdx) => (
                  <div
                    key={`${page.index}-${listIdx}`}
                    draggable
                    onDragStart={() => handleThumbDragStart(listIdx)}
                    onDragOver={(e) => handleThumbDragOver(e, listIdx)}
                    onDragEnd={handleThumbDragEnd}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab aspect-[3/4] ${
                      draggedIdx === listIdx ? 'opacity-30 scale-95' : ''
                    } ${dragOverIdx === listIdx && draggedIdx !== listIdx ? 'border-indigo-500/70 scale-[1.03]' : 'border-transparent'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.dataUrl}
                      alt={`Page ${listIdx + 1}`}
                      className="w-full h-full object-cover bg-white/[0.04]"
                      draggable={false}
                    />
                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold shadow">
                      {listIdx + 1}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white/50 text-center py-0.5">
                      orig. {page.index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-300">PDF rebuilt in new order</p>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'reordered.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          {pages.length > 0 && (
            <button
              onClick={handleApply}
              disabled={isProcessing || isRendering}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
            >
              {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Rebuilding PDF…</> : <><ArrowUpDown className="h-4 w-4" /> Apply New Order</>}
            </button>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
