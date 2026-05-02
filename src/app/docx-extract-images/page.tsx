"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { ImageIcon, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DocxExtractImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [imageCount, setImageCount] = useState(0);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.docx')) { toast.error('Only .docx files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleExtract = async () => {
    if (!file) { toast.error('Please select a DOCX file.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/docx-extract-images', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const count = Number(res.headers.get('X-Image-Count') ?? 0);
      setImageCount(count);
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success(`${count} image${count !== 1 ? 's' : ''} extracted!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Extraction failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Extract Images"
      description="Pull all embedded images out of a Word document and download them as a ZIP archive."
      icon={<ImageIcon className="h-7 w-7" />}
      accentColor="rgba(236,72,153,0.35)"
      features={[
        'Extracts PNG, JPG, GIF, WebP, SVG and more',
        'All images bundled into a single ZIP download',
        'Original filenames and formats preserved',
        'Works even on large documents with many images',
        'Processed server-side with JSZip',
        'Works on any standard .docx file',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx"
          fileLabel="DOCX"
          hint="Drop a Word document — extract all its embedded images"
          accentClass="border-pink-500/60 bg-pink-500/[0.06] shadow-[0_0_40px_rgba(236,72,153,0.12)]"
          buttonClass="bg-pink-500 hover:bg-pink-400 shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
          icon="image"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-pink-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setResultUrl(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">{imageCount} image{imageCount !== 1 ? 's' : ''} extracted</p>
                  <p className="text-xs text-white/30">Bundled into a ZIP archive</p>
                </div>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = file!.name.replace(/\.docx$/i, '') + '-images.zip'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download ZIP
              </button>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-pink-500 hover:bg-pink-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</> : <><ImageIcon className="h-4 w-4" /> Extract Images</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
