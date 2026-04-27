"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Layers, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function FlattenPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fieldCount, setFieldCount] = useState<number | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null); setFieldCount(null);
  };

  const handleFlatten = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/flatten-pdf', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const count = Number(res.headers.get('X-Field-Count') ?? 0);
      setFieldCount(count);
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success(count > 0 ? `${count} form field${count !== 1 ? 's' : ''} flattened!` : 'PDF saved — no form fields found.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Flatten failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Flatten PDF Forms"
      description="Convert interactive form fields into static content — locks answers in permanently."
      icon={<Layers className="h-7 w-7" />}
      accentColor="rgba(245,158,11,0.35)"
      features={[
        'Bakes all filled-in form values into the page',
        'Removes interactivity — fields can no longer be edited',
        'Works with text fields, checkboxes, radio buttons',
        'Processed server-side with pdf-lib',
        'Safe to share or print after flattening',
        'Reports how many fields were flattened',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF with form fields — they'll be baked into the page"
          accentClass="border-amber-500/60 bg-amber-500/[0.06] shadow-[0_0_40px_rgba(245,158,11,0.12)]"
          buttonClass="bg-amber-500 hover:bg-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
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
            <button onClick={() => { setFile(null); setResultUrl(null); setFieldCount(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Info banner */}
          <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
            <Layers className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/40 leading-relaxed">
              Flattening permanently converts form fields to static text. This action cannot be undone — the fields will no longer be editable after download.
            </p>
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">
                    {fieldCount !== null && fieldCount > 0
                      ? `${fieldCount} field${fieldCount !== 1 ? 's' : ''} flattened`
                      : 'PDF saved — no form fields'}
                  </p>
                  <p className="text-xs text-emerald-400/60">Ready to download</p>
                </div>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'flattened.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleFlatten}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Flattening…</> : <><Layers className="h-4 w-4" /> Flatten Form Fields</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
