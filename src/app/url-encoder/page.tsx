"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Link, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'encode' | 'decode';

export default function UrlEncoderPage() {
  const [tab, setTab] = useState<Tab>('encode');
  const [encodeInput, setEncodeInput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const encodeOutput = encodeInput ? encodeURIComponent(encodeInput) : '';

  const getDecodeOutput = (): string => {
    if (!decodeInput) return '';
    try {
      return decodeURIComponent(decodeInput);
    } catch {
      return '';
    }
  };

  const handleDecodeChange = (val: string) => {
    setDecodeInput(val);
    setDecodeError(null);
    if (val) {
      try {
        decodeURIComponent(val);
      } catch (e) {
        setDecodeError(`Decode error: ${(e as Error).message}`);
      }
    }
  };

  const decodeOutput = getDecodeOutput();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'encode', label: 'Encode' },
    { id: 'decode', label: 'Decode' },
  ];

  const copyOutput = () => {
    const val = tab === 'encode' ? encodeOutput : decodeOutput;
    if (!val) return;
    navigator.clipboard.writeText(val);
    toast.success('Copied to clipboard!');
  };

  return (
    <ToolPageLayout
      title="URL Encoder / Decoder"
      description="Encode URLs to percent-encoded format or decode them back to plain text — live conversion as you type, fully in-browser."
      icon={<Link className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Encode URLs to percent-encoded format',
        'Decode percent-encoded URLs to plain text',
        'Live conversion as you type',
        'Copy result to clipboard',
        'Handles special characters correctly',
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
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'encode' && (
          <>
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
              <textarea
                value={encodeInput}
                onChange={(e) => setEncodeInput(e.target.value)}
                placeholder="Type or paste a URL or text to encode…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 resize-none"
              />
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Encoded Output</p>
                <button
                  onClick={copyOutput}
                  disabled={!encodeOutput}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <textarea
                value={encodeOutput}
                readOnly
                placeholder="Percent-encoded output will appear here…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none font-mono select-all"
              />
            </div>
          </>
        )}

        {tab === 'decode' && (
          <>
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
              <textarea
                value={decodeInput}
                onChange={(e) => handleDecodeChange(e.target.value)}
                placeholder="Paste a percent-encoded URL to decode…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 resize-none font-mono"
              />
              {decodeError && (
                <p className="text-xs text-red-400/90 font-mono">{decodeError}</p>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Decoded Output</p>
                <button
                  onClick={copyOutput}
                  disabled={!decodeOutput}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <textarea
                value={decodeOutput}
                readOnly
                placeholder="Decoded URL will appear here…"
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
