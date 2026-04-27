"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { FileText, X, Loader2, CheckCircle2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ExtractTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setExtractedText('');
  };

  const extractText = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    setIsProcessing(true); setProgress(0); setExtractedText('');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const totalPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        let pageText = '';
        let lastY: number | undefined;
        for (const item of content.items) {
          if (!('str' in item)) continue;
          const { str, transform } = item as { str: string; transform: number[] };
          const y = transform[5];
          if (lastY !== undefined && Math.abs(y - lastY) > 5) pageText += '\n';
          pageText += str;
          lastY = y;
        }
        if (pageText.trim()) fullText += `--- Page ${i} ---\n${pageText.trim()}\n\n`;
        setProgress(Math.round((i / totalPages) * 100));
      }

      if (!fullText.trim()) {
        toast.error('No text found. This PDF may contain only images.');
        return;
      }
      setExtractedText(fullText.trim());
      toast.success('Text extracted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Extraction failed. Please ensure the file is a valid PDF.');
    } finally {
      setIsProcessing(false); setProgress(0);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed — please select and copy manually.');
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, '') || 'extracted'}-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0;
  const formatSize = (bytes: number) =>
    bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="Extract Text"
      description="Pull all readable text content from any PDF — runs locally, nothing is uploaded."
      icon={<FileText className="h-7 w-7" />}
      accentColor="rgba(249,115,22,0.35)"
      features={[
        'Extracts text from all pages at once',
        'Preserves line breaks and page structure',
        'Copy to clipboard with one click',
        'Download extracted content as .txt',
        'Works entirely in your browser',
        'Word count shown after extraction',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — text extracted entirely in your browser"
          accentClass="border-orange-500/60 bg-orange-500/[0.06] shadow-[0_0_40px_rgba(249,115,22,0.12)]"
          buttonClass="bg-orange-500 hover:bg-orange-400 shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
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
              onClick={() => { setFile(null); setExtractedText(''); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isProcessing && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
                <p className="text-sm text-white/60">Extracting text… {progress}%</p>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {extractedText && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-sm font-semibold text-white/80">Text extracted</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/35 border border-white/[0.06]">
                    ~{wordCount.toLocaleString()} words
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white/40 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                  <button
                    onClick={downloadTxt}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-400 rounded-lg transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> .txt
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={extractedText}
                className="w-full h-64 p-3 text-xs font-mono text-white/60 bg-white/[0.03] border border-white/[0.06] rounded-xl resize-none focus:outline-none focus:border-orange-500/30 leading-relaxed"
              />
            </div>
          )}

          <button
            onClick={extractText}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</> : <><FileText className="h-4 w-4" /> Extract Text</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
