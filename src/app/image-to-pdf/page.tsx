"use client"
import React, { useState, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileImage, X, GripVertical, Download, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ImageFile { id: string; file: File; preview: string; }

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (imgs.length < files.length) toast.error('Some files skipped — only images accepted.');
    if (!imgs.length) return;
    setImages((p) => [...p, ...imgs.map((f) => ({ id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f) }))]);
    setResultUrl(null);
  };

  const remove = (id: string) => {
    setImages((p) => { const i = p.find((x) => x.id === id); if (i) URL.revokeObjectURL(i.preview); return p.filter((x) => x.id !== id); });
    setResultUrl(null);
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    setDragOverId(id);
    setImages((prev) => {
      const from = prev.findIndex((i) => i.id === draggedId);
      const to   = prev.findIndex((i) => i.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev]; const [item] = next.splice(from, 1); next.splice(to, 0, item);
      return next;
    });
  };

  const convert = async () => {
    if (!images.length) { toast.error('Add at least one image.'); return; }
    setIsConverting(true); setResultUrl(null);
    try {
      const fd = new FormData();
      images.forEach(({ file }) => fd.append('files', file));
      const res = await fetch('/api/image-to-pdf', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('PDF created!');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Conversion failed.'); }
    finally { setIsConverting(false); }
  };

  return (
    <ToolPageLayout
      title="Image to PDF"
      description="Convert JPG, PNG and WebP images into a single PDF. Drag thumbnails to reorder pages before converting."
      icon={<FileImage className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.4)"
      features={[
        'Supports JPG, PNG, WebP, BMP, and GIF',
        'Each image becomes one page in the PDF',
        'Drag thumbnails to set the page order',
        'Processed on our server — result downloaded instantly',
        'No file size limits on standard images',
        'Original image dimensions are preserved',
      ]}
    >
      {images.length === 0 ? (
        <UploadDropzone
          onFiles={addFiles}
          accept="image/*"
          multiple
          fileLabel="images"
          hint="JPG, PNG, WebP, BMP supported — multiple files OK"
          accentClass="border-blue-500/60 bg-blue-500/[0.06] shadow-[0_0_40px_rgba(59,130,246,0.15)]"
          buttonClass="bg-blue-500 hover:bg-blue-400 shadow-[0_4px_16px_rgba(59,130,246,0.4)]"
          icon="image"
        />
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/80">{images.length} image{images.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-white/30">Drag to reorder · × to remove</p>
            </div>
            <button onClick={() => addInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-lg transition-all">
              <Plus className="h-3.5 w-3.5" /> Add more
            </button>
            <input ref={addInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
          </div>

          {/* Thumbnail grid */}
          <div className="glass-card rounded-2xl p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} draggable onDragStart={() => handleDragStart(img.id)} onDragOver={(e) => handleDragOver(e, img.id)} onDragEnd={handleDragEnd}
                  className={`relative group rounded-xl overflow-hidden border-2 aspect-square cursor-grab transition-all ${draggedId === img.id ? 'opacity-30 scale-95' : ''} ${dragOverId === img.id && draggedId !== img.id ? 'border-blue-500/70 scale-[1.03]' : 'border-transparent'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt={img.file.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold shadow">{idx + 1}</div>
                  <button onClick={() => remove(img.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-white transition-all">
                    <X className="h-3 w-3" />
                  </button>
                  <GripVertical className="absolute bottom-1 right-1 h-3.5 w-3.5 text-white/40 opacity-0 group-hover:opacity-80" />
                </div>
              ))}
            </div>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><p className="text-sm font-semibold text-emerald-300">PDF ready to download</p></div>
              <button onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'converted.pdf'; a.click(); }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { images.forEach((i) => URL.revokeObjectURL(i.preview)); setImages([]); setResultUrl(null); }} className="px-4 py-2.5 text-sm text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-all">Clear all</button>
            <button onClick={convert} disabled={isConverting} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(59,130,246,0.4)]">
              {isConverting ? <><Loader2 className="h-4 w-4 animate-spin" />Converting…</> : <><FileImage className="h-4 w-4" />Convert to PDF</>}
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
