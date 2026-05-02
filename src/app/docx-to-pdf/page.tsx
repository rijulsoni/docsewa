"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileOutput, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DocxToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.docx')) { toast.error('Only .docx files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleConvert = async () => {
    if (!file) { toast.error('Please select a DOCX file.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/docx-to-pdf', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Converted to PDF!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="DOCX to PDF"
      description="Convert a Word document to a clean, downloadable PDF — headings, paragraphs and lists all preserved."
      icon={<FileOutput className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'Converts headings (H1/H2/H3), paragraphs, lists',
        'Auto-paginates long documents onto A4 pages',
        'No Microsoft Office or LibreOffice required',
        'Text is selectable in the output PDF',
        'Processed server-side with mammoth + pdf-lib',
        'Works on any standard .docx file',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx"
          fileLabel="DOCX"
          hint="Drop a Word document — convert it to a PDF"
          accentClass="border-red-500/60 bg-red-500/[0.06] shadow-[0_0_40px_rgba(239,68,68,0.12)]"
          buttonClass="bg-red-500 hover:bg-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
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
                <p className="text-sm font-semibold text-emerald-300">PDF ready</p>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = file!.name.replace(/\.docx$/i, '') + '.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</> : <><FileOutput className="h-4 w-4" /> Convert to PDF</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
