"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileOutput, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function PdfToDocxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleConvert = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/pdf-to-docx', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setPageCount(Number(res.headers.get('X-Page-Count') ?? 0));
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Converted to DOCX!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="PDF to DOCX"
      description="Extract text from a PDF and produce an editable Word document you can open in any Office app."
      icon={<FileOutput className="h-7 w-7" />}
      accentColor="rgba(14,165,233,0.35)"
      features={[
        'Extracts all readable text from the PDF',
        'Auto-detects headings from formatting heuristics',
        'Produces a fully editable .docx file',
        'Best results on text-based (non-scanned) PDFs',
        'Processed server-side with pdf-parse + docx',
        'Works on any standard PDF',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — convert it to an editable Word document"
          accentClass="border-sky-500/60 bg-sky-500/[0.06] shadow-[0_0_40px_rgba(14,165,233,0.12)]"
          buttonClass="bg-sky-500 hover:bg-sky-400 shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
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
                  <p className="text-sm font-semibold text-emerald-300">DOCX ready</p>
                  {pageCount > 0 && <p className="text-xs text-white/30">{pageCount} page{pageCount !== 1 ? 's' : ''} converted</p>}
                </div>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = file!.name.replace(/\.pdf$/i, '') + '.docx'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download DOCX
              </button>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</> : <><FileOutput className="h-4 w-4" /> Convert to DOCX</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
