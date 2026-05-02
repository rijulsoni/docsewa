"use client"
export const dynamic = 'force-dynamic';
import { useState, useRef, useEffect } from 'react';
import { Upload, Send, Bot, User, Loader2, FileText, X, Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Navbar from '@/components/pages/Navbar';
import Footer from '@/components/pages/Footer';
import ScrollToTop from '@/components/pages/ScrollToTop';

interface Message { role: 'user' | 'assistant'; content: string; }

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= Math.min(pdf.numPages, 100); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
  }
  return text.trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
}

export default function ChatWithPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docText, setDocText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleFile = async (f: File) => {
    setFile(f);
    setMessages([]);
    setDocText('');
    setExtracting(true);
    try {
      let text = '';
      if (f.type === 'application/pdf') text = await extractTextFromPDF(f);
      else if (f.name.endsWith('.docx')) text = await extractTextFromDocx(f);
      else if (f.type === 'text/plain') text = await f.text();
      else { toast.error('Unsupported file type'); setExtracting(false); return; }
      if (!text.trim()) { toast.error('Could not extract text from this file'); setExtracting(false); return; }
      setDocText(text);
      toast.success('Document loaded — generating summary…');
      await autoSummarise(text);
    } catch {
      toast.error('Failed to read file');
    } finally {
      setExtracting(false);
    }
  };

  const autoSummarise = async (text: string) => {
    setSummarising(true);
    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([assistantMsg]);
    try {
      const res = await fetch('/api/chat-with-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, messages: [], mode: 'summary' }),
      });
      if (!res.ok) { toast.error('Summary failed'); setSummarising(false); return; }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages([{ role: 'assistant', content: full }]);
      }
    } catch { toast.error('Summary failed'); }
    finally { setSummarising(false); }
  };

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || streaming || !docText) return;
    setInput('');
    const next: Message[] = [...messages, { role: 'user', content: q }, { role: 'assistant', content: '' }];
    setMessages(next);
    setStreaming(true);
    try {
      const res = await fetch('/api/chat-with-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: docText,
          messages: next.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          mode: 'chat',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string }).error ?? 'Request failed';
        toast.error(msg);
        // Remove the empty assistant placeholder
        setMessages(prev => prev.slice(0, -1));
        setStreaming(false);
        return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: full };
          return updated;
        });
      }
    } catch { toast.error('Request failed'); }
    finally { setStreaming(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.4)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Chat with Document</h1>
          </div>
          <p className="text-sm text-white/40 ml-12">Upload a PDF, DOCX, or TXT — get an instant summary and ask anything about it.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 h-[calc(100vh-260px)] min-h-[500px]">

          {/* Left — file panel */}
          <div className="flex flex-col gap-4">
            {/* Upload zone */}
            <div
              onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e => e.preventDefault()}
              className="relative"
            >
              <label className={cn(
                'flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
                file ? 'border-violet-500/30 bg-violet-500/[0.04]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
              )}>
                <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {extracting ? (
                  <><Loader2 className="h-7 w-7 text-violet-400 animate-spin" /><p className="text-xs text-white/50">Extracting text…</p></>
                ) : file ? (
                  <>
                    <FileText className="h-7 w-7 text-violet-400" />
                    <div className="text-center">
                      <p className="text-xs font-medium text-white/70 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{(file.size / 1024).toFixed(0)} KB · {docText.split(/\s+/).length.toLocaleString()} words</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-7 w-7 text-white/20" />
                    <div className="text-center">
                      <p className="text-xs text-white/50">Drop PDF, DOCX, or TXT</p>
                      <p className="text-[10px] text-white/25 mt-0.5">Up to 100 pages</p>
                    </div>
                  </>
                )}
              </label>
              {file && !extracting && (
                <button
                  onClick={() => { setFile(null); setDocText(''); setMessages([]); }}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/30 hover:text-white/70 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Suggested questions */}
            {docText && !summarising && messages.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-1">Try asking</p>
                {['What are the main conclusions?', 'List all key dates or deadlines', 'What action items are mentioned?'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-white/55 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {!file && (
              <div className="text-center px-4 py-6 rounded-2xl border border-white/[0.05] bg-white/[0.015]">
                <Sparkles className="h-8 w-8 text-violet-400/40 mx-auto mb-3" />
                <p className="text-xs text-white/30 leading-relaxed">Upload a document to get an AI-powered summary and chat with its contents.</p>
              </div>
            )}
          </div>

          {/* Right — chat panel */}
          <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="h-10 w-10 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/25">Upload a document to start</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    m.role === 'assistant' ? 'bg-violet-500/20' : 'bg-indigo-500/20'
                  )}>
                    {m.role === 'assistant'
                      ? <Bot className="h-4 w-4 text-violet-400" />
                      : <User className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <div className={cn(
                    'group max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative',
                    m.role === 'assistant'
                      ? 'bg-white/[0.04] text-white/80'
                      : 'bg-indigo-500/15 text-white/85'
                  )}>
                    {m.content
                      ? <p className="whitespace-pre-wrap">{m.content}</p>
                      : <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />}
                    {m.content && m.role === 'assistant' && (
                      <button
                        onClick={() => { navigator.clipboard.writeText(m.content); toast.success('Copied'); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white/[0.08] text-white/40 hover:text-white/70 transition-all"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-white/[0.06] p-3 flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={docText ? 'Ask anything about the document…' : 'Upload a document first'}
                disabled={!docText || streaming || summarising}
                rows={1}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-violet-500/30 resize-none disabled:opacity-40 max-h-32 overflow-y-auto"
                style={{ minHeight: '42px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming || !docText || summarising}
                className="p-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(139,92,246,0.3)] shrink-0"
              >
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </main>
      <ScrollToTop />
      <Footer />
    </div>
  );
}
