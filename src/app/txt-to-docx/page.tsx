"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { FilePlus, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TxtToDocxPage() {
  const [text, setText] = useState('');
  const [useHeading, setUseHeading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const wordCount = useMemo(() => {
    const t = text.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [text]);

  const charCount = text.length;

  const handleConvert = async () => {
    if (!text.trim()) { toast.error('Please enter some text first.'); return; }
    setIsProcessing(true);
    try {
      const { Document, Paragraph, HeadingLevel, Packer } = await import('docx');
      const lines = text.split('\n');
      const children = lines.map((line, i) =>
        i === 0 && useHeading
          ? new Paragraph({ text: line, heading: HeadingLevel.HEADING_1 })
          : new Paragraph({ text: line })
      );
      const doc = new Document({ sections: [{ properties: {}, children }] });
      const blob = await Packer.toBlob(doc);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'document.docx';
      a.click();
      toast.success('Downloaded document.docx!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed.');
    } finally { setIsProcessing(false); }
  };

  return (
    <ToolPageLayout
      title="Text to DOCX"
      description="Paste plain text and download it as a Word document instantly — no Office required."
      icon={<FilePlus className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Paste plain text or Markdown to create a Word document',
        'First line can become a heading automatically',
        'Uses the docx package — no server needed',
        'Download as .docx compatible with Word, LibreOffice',
        'Live character and word count',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Your text</p>
            <div className="flex gap-2">
              <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg">{wordCount.toLocaleString()} words</span>
              <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-1 rounded-lg">{charCount.toLocaleString()} chars</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here…"
            className="w-full h-64 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/70 font-mono resize-none focus:outline-none focus:border-emerald-500/40 placeholder:text-white/20"
          />
        </div>

        <div className="glass-card rounded-2xl p-5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useHeading}
              onChange={(e) => setUseHeading(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 rounded"
            />
            <span className="text-sm text-white/50">Use first line as Heading 1</span>
          </label>
        </div>

        <button
          onClick={handleConvert}
          disabled={isProcessing || !text.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
        >
          {isProcessing
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Converting…</>
            : <><Download className="h-4 w-4" /> Convert &amp; Download</>}
        </button>
      </div>
    </ToolPageLayout>
  );
}
