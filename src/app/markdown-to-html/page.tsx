"use client"
import React, { useState, useEffect, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Code, Copy, Download } from 'lucide-react';
import { marked } from 'marked';
import { toast } from 'sonner';

export default function MarkdownToHtmlPage() {
  const [markdown, setMarkdown] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const result = marked(markdown) as string;
    setHtmlOutput(result);
  }, [markdown]);

  const srcdoc = `<html><head><style>body{background:#fff;font-family:sans-serif;padding:16px;margin:0;font-size:14px;line-height:1.6;color:#111;}pre{background:#f4f4f4;padding:12px;border-radius:6px;overflow:auto;}code{background:#f0f0f0;padding:2px 4px;border-radius:3px;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #ddd;padding:8px;}</style></head><body>${htmlOutput}</body></html>`;

  const handleCopy = () => {
    if (!htmlOutput) return;
    navigator.clipboard.writeText(htmlOutput);
    toast.success('HTML copied to clipboard!');
  };

  const handleDownload = () => {
    if (!htmlOutput) return;
    const full = `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><style>body{font-family:sans-serif;padding:16px;max-width:800px;margin:0 auto;}</style></head>\n<body>\n${htmlOutput}\n</body>\n</html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded output.html');
  };

  return (
    <ToolPageLayout
      title="Markdown to HTML"
      description="Paste Markdown on the left and see live rendered HTML in the preview pane. Copy or download the raw HTML."
      icon={<Code className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Paste Markdown, see rendered HTML instantly',
        'Live split-pane preview',
        'Copy raw HTML to clipboard',
        'Download as .html file',
        'Supports headings, lists, tables, code blocks',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Side-by-side editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Markdown input */}
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Markdown Input</p>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={"# Hello World\n\nWrite your **markdown** here…"}
              rows={16}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 resize-none font-mono"
            />
          </div>

          {/* Preview */}
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Preview</p>
            <iframe
              ref={iframeRef}
              sandbox=""
              srcDoc={srcdoc}
              className="w-full rounded-xl border border-white/[0.08] bg-white"
              style={{ height: '380px' }}
              title="Markdown preview"
            />
          </div>
        </div>

        {/* Raw HTML output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">HTML Output</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!htmlOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-teal-300 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Copy className="h-3.5 w-3.5" /> Copy HTML
              </button>
              <button
                onClick={handleDownload}
                disabled={!htmlOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-teal-300 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> Download .html
              </button>
            </div>
          </div>
          <textarea
            value={htmlOutput}
            readOnly
            placeholder="HTML output will appear here…"
            rows={8}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none font-mono select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
