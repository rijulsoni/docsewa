"use client"
import React, { useState, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Hash, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'encode' | 'decode';
type EncodeMode = 'text' | 'file';

function encodeText(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

function decodeText(input: string): string {
  return decodeURIComponent(escape(atob(input.trim())));
}

export default function Base64Page() {
  const [tab, setTab] = useState<Tab>('encode');
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('text');
  const [encodeInput, setEncodeInput] = useState('');
  const [encodeOutput, setEncodeOutput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeOutput, setDecodeOutput] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleEncode = () => {
    try {
      setEncodeOutput(encodeText(encodeInput));
    } catch (e) {
      toast.error(`Encode error: ${(e as Error).message}`);
    }
  };

  const handleDecode = () => {
    setDecodeError(null);
    try {
      setDecodeOutput(decodeText(decodeInput));
    } catch (e) {
      setDecodeError(`Invalid Base64: ${(e as Error).message}`);
      setDecodeOutput('');
    }
  };

  const handleFileEncode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is a data URL like "data:...;base64,<data>"
      const base64 = result.split(',')[1] ?? result;
      setEncodeOutput(base64);
    };
    reader.readAsDataURL(file);
  };

  const copyEncode = () => {
    if (!encodeOutput) return;
    navigator.clipboard.writeText(encodeOutput);
    toast.success('Copied to clipboard!');
  };

  const copyDecode = () => {
    if (!decodeOutput) return;
    navigator.clipboard.writeText(decodeOutput);
    toast.success('Copied to clipboard!');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'encode', label: 'Encode' },
    { id: 'decode', label: 'Decode' },
  ];

  return (
    <ToolPageLayout
      title="Base64 Encoder / Decoder"
      description="Encode text or files to Base64, or decode Base64 strings back to plain text — Unicode-safe and fully in-browser."
      icon={<Hash className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Encode text or files to Base64',
        'Decode Base64 back to text',
        'Handles Unicode characters correctly',
        'File-to-Base64 encoding',
        'Copy result to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Tab bar */}
        <div className="glass-card rounded-2xl p-1.5 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'encode' && (
          <>
            {/* Sub-mode toggle */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Mode</p>
              <div className="flex gap-2">
                {(['text', 'file'] as EncodeMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setEncodeMode(m); setEncodeOutput(''); }}
                    className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all border ${
                      encodeMode === m
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                        : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    {m === 'text' ? 'Text' : 'File'}
                  </button>
                ))}
              </div>
            </div>

            {encodeMode === 'text' ? (
              <div className="glass-card rounded-2xl p-5 space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
                <textarea
                  value={encodeInput}
                  onChange={(e) => setEncodeInput(e.target.value)}
                  placeholder="Type or paste text to encode…"
                  rows={5}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 resize-none"
                />
                <button
                  onClick={handleEncode}
                  disabled={!encodeInput.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Encode to Base64
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">File</p>
                <div
                  className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] transition-all"
                  onClick={() => fileRef.current?.click()}
                >
                  <p className="text-sm text-white/30">Click to select a file</p>
                  <p className="text-xs text-white/20">Any file type supported</p>
                  <input ref={fileRef} type="file" className="hidden" onChange={handleFileEncode} />
                </div>
              </div>
            )}

            {/* Output */}
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Base64 Output</p>
                <button
                  onClick={copyEncode}
                  disabled={!encodeOutput}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <textarea
                value={encodeOutput}
                readOnly
                placeholder="Base64 encoded output will appear here…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none font-mono select-all"
              />
            </div>
          </>
        )}

        {tab === 'decode' && (
          <>
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Base64 Input</p>
              <textarea
                value={decodeInput}
                onChange={(e) => { setDecodeInput(e.target.value); setDecodeError(null); }}
                placeholder="Paste Base64 string to decode…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 resize-none font-mono"
              />
              <button
                onClick={handleDecode}
                disabled={!decodeInput.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Decode from Base64
              </button>
              {decodeError && (
                <p className="text-xs text-red-400/90 font-mono">{decodeError}</p>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Decoded Output</p>
                <button
                  onClick={copyDecode}
                  disabled={!decodeOutput}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <textarea
                value={decodeOutput}
                readOnly
                placeholder="Decoded text will appear here…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all"
              />
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
