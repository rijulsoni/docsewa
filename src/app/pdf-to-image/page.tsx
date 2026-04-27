"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileImage, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

interface RenderedPage { pageNum: number; dataUrl: string; }
type ImageFormat = 'image/png' | 'image/jpeg';
type QualityPreset = 'low' | 'medium' | 'high';
const QUALITY_SCALES: Record<QualityPreset, number> = { low: 1, medium: 1.5, high: 2.5 };

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>('image/png');
  const [quality, setQuality] = useState<QualityPreset>('medium');
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Please select a PDF file.'); return; }
    setFile(f); setRenderedPages([]);
  };

  const parseRange = useCallback((rangeStr: string, total: number): number[] => {
    if (!rangeStr.trim()) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [];
    for (const part of rangeStr.split(',')) {
      const t = part.trim();
      if (t.includes('-')) {
        const [s, e] = t.split('-').map(Number);
        for (let i = Math.max(1, s); i <= Math.min(total, e); i++) pages.push(i);
      } else {
        const n = Number(t);
        if (n >= 1 && n <= total) pages.push(n);
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b);
  }, []);

  const convertToImages = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    setIsProcessing(true); setProgress(0); setRenderedPages([]);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const totalPages = pdf.numPages;
      const pagesToRender = parseRange(pageRange, totalPages);
      const results: RenderedPage[] = [];
      const scale = QUALITY_SCALES[quality];
      const jpegQ = quality === 'high' ? 0.95 : quality === 'medium' ? 0.85 : 0.7;

      for (let i = 0; i < pagesToRender.length; i++) {
        const page = await pdf.getPage(pagesToRender[i]);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        results.push({
          pageNum: pagesToRender[i],
          dataUrl: format === 'image/jpeg' ? canvas.toDataURL('image/jpeg', jpegQ) : canvas.toDataURL('image/png'),
        });
        setProgress(Math.round(((i + 1) / pagesToRender.length) * 100));
      }

      setRenderedPages(results);
      toast.success(`${results.length} page${results.length !== 1 ? 's' : ''} converted!`);
    } catch (err) {
      console.error(err);
      toast.error('Conversion failed. Please ensure the file is a valid PDF.');
    } finally {
      setIsProcessing(false); setProgress(0);
    }
  };

  const downloadImage = (page: RenderedPage) => {
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const a = document.createElement('a');
    a.href = page.dataUrl; a.download = `page-${page.pageNum}.${ext}`; a.click();
  };

  const formatSize = (bytes: number) =>
    bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="PDF to Image"
      description="Convert PDF pages to high-quality PNG or JPG images — processed locally in your browser."
      icon={<FileImage className="h-7 w-7" />}
      accentColor="rgba(139,92,246,0.4)"
      features={[
        'Converts each page to PNG or JPG',
        'Three quality presets — Low, Medium, High',
        'Extract a custom page range',
        'Processed entirely in your browser',
        'Download all images with one click',
        'No file uploaded to any server',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — each page becomes an image"
          accentClass="border-violet-500/60 bg-violet-500/[0.06] shadow-[0_0_40px_rgba(139,92,246,0.15)]"
          buttonClass="bg-violet-500 hover:bg-violet-400 shadow-[0_4px_16px_rgba(139,92,246,0.35)]"
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
              <p className="text-xs text-white/30">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={() => { setFile(null); setRenderedPages([]); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-5">
            <p className="text-sm font-semibold text-white/70">Conversion options</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-2">Output format</p>
                <div className="flex gap-2">
                  {(['image/png', 'image/jpeg'] as ImageFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        format === f
                          ? 'border-violet-500/50 bg-violet-500/[0.10] text-violet-300'
                          : 'border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60'
                      }`}
                    >
                      {f === 'image/png' ? 'PNG' : 'JPG'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 mb-2">Quality</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as QualityPreset[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-2 px-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                        quality === q
                          ? 'border-violet-500/50 bg-violet-500/[0.10] text-violet-300'
                          : 'border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-white/40 mb-2">
                  Page range <span className="text-white/20">(blank = all pages)</span>
                </p>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 7-9"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                />
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                <p className="text-sm text-white/60">Converting pages… {progress}%</p>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {renderedPages.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-sm font-semibold text-white/80">
                    {renderedPages.length} image{renderedPages.length !== 1 ? 's' : ''} ready
                  </p>
                </div>
                {renderedPages.length > 1 && (
                  <button
                    onClick={() => renderedPages.forEach((p, i) => setTimeout(() => downloadImage(p), i * 200))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> Download all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {renderedPages.map((page) => (
                  <div key={page.pageNum} className="relative group rounded-xl overflow-hidden border border-white/[0.06]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={page.dataUrl} alt={`Page ${page.pageNum}`} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <button
                        onClick={() => downloadImage(page)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-900 text-xs font-semibold rounded-lg transition-all"
                      >
                        <Download className="h-3.5 w-3.5" /> Page {page.pageNum}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={convertToImages}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(139,92,246,0.35)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</> : <><FileImage className="h-4 w-4" /> Convert to Images</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
