"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Code, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DocxToHtmlPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    const name = f.name.toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.doc')) {
      toast.error('Only .docx files are supported.'); return;
    }
    setFile(f); setHtmlUrl(null); setPreviewHtml(null);
  };

  const handleConvert = async () => {
    if (!file) { toast.error('Please select a DOCX file.'); return; }
    setIsProcessing(true); setHtmlUrl(null); setPreviewHtml(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/docx-to-html', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const html = await res.text();
      setPreviewHtml(html);
      const blob = new Blob([html], { type: 'text/html' });
      setHtmlUrl(URL.createObjectURL(blob));
      toast.success('Converted to HTML!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="DOCX to HTML"
      description="Convert a Word document to clean HTML — preserving headings, lists, tables, and bold/italic formatting."
      icon={<Code className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Converts headings, paragraphs, lists, and tables',
        'Bold, italic, and underline preserved',
        'Outputs a complete, styled HTML file',
        'Live preview rendered in the browser',
        'Processed server-side with mammoth',
        'Works on any standard .docx file',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx,.doc"
          fileLabel="DOCX"
          hint="Drop a Word document — convert it to styled HTML"
          accentClass="border-purple-500/60 bg-purple-500/[0.06] shadow-[0_0_40px_rgba(168,85,247,0.12)]"
          buttonClass="bg-purple-500 hover:bg-purple-400 shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setHtmlUrl(null); setPreviewHtml(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {previewHtml && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-white/80">HTML preview</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white overflow-hidden" style={{ height: 300 }}>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                  title="HTML preview"
                />
              </div>

              <a
                href={htmlUrl!}
                download={file.name.replace(/\.docx?$/i, '') + '.html'}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download .html
              </a>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</> : <><Code className="h-4 w-4" /> Convert to HTML</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
