"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileText, Download, Loader2, CheckCircle2, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function DocxToTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const onFiles = (files: File[]) => {
    const f = files[0];
    const name = f.name.toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.doc')) {
      toast.error('Only .docx files are supported.'); return;
    }
    setFile(f); setText(null);
  };

  const handleExtract = async () => {
    if (!file) { toast.error('Please select a DOCX file.'); return; }
    setIsProcessing(true); setText(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/docx-to-text', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const wc = Number(res.headers.get('X-Word-Count') ?? 0);
      const cc = Number(res.headers.get('X-Char-Count') ?? 0);
      setWordCount(wc);
      setCharCount(cc);
      setText(await res.text());
      toast.success('Text extracted!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Extraction failed.');
    } finally { setIsProcessing(false); }
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file!.name.replace(/\.docx?$/i, '') + '.txt';
    a.click();
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="DOCX to Text"
      description="Extract all readable text from a Word document — no Office required."
      icon={<FileText className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Extracts all paragraphs, headings, and lists',
        'No Microsoft Office required',
        'Copy text directly or download as .txt',
        'Shows word and character counts',
        'Processed server-side with mammoth',
        'Works on any standard .docx file',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".docx,.doc"
          fileLabel="DOCX"
          hint="Drop a Word document — extract all its text content"
          accentClass="border-blue-500/60 bg-blue-500/[0.06] shadow-[0_0_40px_rgba(59,130,246,0.12)]"
          buttonClass="bg-blue-500 hover:bg-blue-400 shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setText(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {text !== null && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-white/80">Text extracted</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg">{wordCount.toLocaleString()} words</span>
                  <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg">{charCount.toLocaleString()} chars</span>
                </div>
              </div>

              <textarea
                readOnly
                value={text}
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
                  <Download className="h-4 w-4" /> Download .txt
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</> : <><FileText className="h-4 w-4" /> Extract Text</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
