"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileCode, Download, Loader2, CheckCircle2, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function DocxToMarkdownPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const onFiles = (files: File[]) => {
    const f = files[0];
    const name = f.name.toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.doc')) {
      toast.error('Only .docx and .doc files are supported.'); return;
    }
    setFile(f); setMarkdown(null);
  };

  const handleConvert = async () => {
    if (!file) { toast.error('Please select a DOCX file.'); return; }
    setIsProcessing(true); setMarkdown(null);
    try {
      const mammoth = await import('mammoth');
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
      const TurndownService = (await import('turndown')).default;
      const md = new TurndownService().turndown(html);
      const words = md.trim() ? md.trim().split(/\s+/).length : 0;
      setMarkdown(md);
      setWordCount(words);
      toast.success('Converted to Markdown!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setIsProcessing(false); }
  };

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!markdown || !file) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name.replace(/\.docx?$/i, '') + '.md';
    a.click();
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="DOCX to Markdown"
      description="Convert Word documents to clean Markdown — runs entirely in your browser."
      icon={<FileCode className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Convert Word documents to clean Markdown',
        'Preserves headings, lists, bold and italic',
        'Powered by Mammoth + Turndown — runs in browser',
        'Copy result or download as .md file',
        'Compatible with .docx and .doc files',
        'No server upload — file stays local',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx,.doc"
          fileLabel="DOCX"
          hint="Drop a Word document — convert it to Markdown instantly"
          accentClass="border-indigo-500/60 bg-indigo-500/[0.06] shadow-[0_0_40px_rgba(99,102,241,0.12)]"
          buttonClass="bg-indigo-500 hover:bg-indigo-400 shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FileCode className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button
              onClick={() => { setFile(null); setMarkdown(null); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {markdown !== null && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-white/80">Markdown ready</p>
                </div>
                <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg">{wordCount.toLocaleString()} words</span>
              </div>

              <textarea
                readOnly
                value={markdown}
                className="w-full h-64 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/60 font-mono resize-none focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-white/[0.08] hover:bg-white/[0.05] text-white/60 hover:text-white/80 text-sm font-semibold rounded-xl transition-all"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <Download className="h-4 w-4" /> Download .md
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
              : <><FileCode className="h-4 w-4" /> Convert to Markdown</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
