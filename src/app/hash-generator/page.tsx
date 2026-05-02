"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Hash, Copy } from 'lucide-react';
import { toast } from 'sonner';

type HashAlgo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const ALGOS: HashAlgo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function computeHash(algo: HashAlgo, input: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algo, new TextEncoder().encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<HashAlgo, string>>({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': '',
  });
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        ALGOS.map(async (algo) => [algo, await computeHash(algo, input)] as [HashAlgo, string])
      );
      setHashes(Object.fromEntries(results) as Record<HashAlgo, string>);
    } catch (e) {
      toast.error(`Hash error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (algo: HashAlgo) => {
    const h = hashes[algo];
    if (!h) return;
    navigator.clipboard.writeText(h);
    toast.success(`${algo} copied!`);
  };

  return (
    <ToolPageLayout
      title="Hash Generator"
      description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 cryptographic hashes from any text using your browser's native Web Crypto API."
      icon={<Hash className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'SHA-1, SHA-256, SHA-384, SHA-512 hashes',
        'Copy each hash individually',
        'Uses native Web Crypto API',
        'No data ever leaves your browser',
        'Instant computation',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to hash…"
            rows={5}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-red-500/40 resize-none"
          />
          <button
            onClick={generate}
            disabled={!input.trim() || loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating…' : 'Generate Hashes'}
          </button>
        </div>

        {/* Hash results */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Hashes</p>
          {ALGOS.map((algo) => (
            <div key={algo} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{algo}</span>
                <button
                  onClick={() => copyHash(algo)}
                  disabled={!hashes[algo]}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white/60 font-mono break-all min-h-[36px]">
                {hashes[algo] || <span className="text-white/20">—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  );
}
