"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { FileCode, Copy, Download } from 'lucide-react';
import TurndownService from 'turndown';
import { toast } from 'sonner';

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

export default function HtmlToMarkdownPage() {
  const [html, setHtml] = useState('');
  const [markdown, setMarkdown] = useState('');

  const handleConvert = () => {
    if (!html.trim()) {
      toast.error('Please enter some HTML first.');
      return;
    }
    try {
      const result = td.turndown(html);
      setMarkdown(result);
    } catch {
      toast.error('Failed to parse HTML. Please check your input.');
    }
  };

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    toast.success('Markdown copied to clipboard!');
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded output.md');
  };

  return (
    <ToolPageLayout
      title="HTML to Markdown"
      description="Paste HTML and convert it to clean Markdown. Handles headings, lists, links, code blocks, and tables."
      icon={<FileCode className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Paste HTML, get clean Markdown output',
        'Handles headings, lists, links, code, tables',
        'Copy result to clipboard',
        'Download as .md file',
        'Uses TurndownService library',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* HTML input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">HTML Input</p>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={"<h1>Hello World</h1>\n<p>Paste your <strong>HTML</strong> here…</p>"}
            rows={10}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 resize-none font-mono"
          />
          <div className="pt-1">
            <button
              onClick={handleConvert}
              disabled={!html.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Convert
            </button>
          </div>
        </div>

        {/* Markdown output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Markdown Output</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!markdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!markdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> Download .md
              </button>
            </div>
          </div>
          <textarea
            value={markdown}
            readOnly
            placeholder="Converted Markdown will appear here…"
            rows={10}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none font-mono select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
