"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Key, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function base64urlDecode(str: string): string {
  const base64 = str
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
  return atob(base64);
}

function parseJwt(token: string): JwtParts {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('JWT must have exactly 3 parts separated by dots.');
  const header = JSON.parse(base64urlDecode(parts[0]));
  const payload = JSON.parse(base64urlDecode(parts[1]));
  return { header, payload, signature: parts[2] };
}

type ExpiryStatus = 'none' | 'expired' | 'valid';

function getExpiryInfo(payload: Record<string, unknown>): { status: ExpiryStatus; label: string } {
  const exp = payload['exp'];
  if (typeof exp !== 'number') return { status: 'none', label: 'No expiry' };
  const now = Math.floor(Date.now() / 1000);
  if (now > exp) return { status: 'expired', label: 'Expired' };
  const date = new Date(exp * 1000);
  return {
    status: 'valid',
    label: `Valid until ${date.toLocaleString()}`,
  };
}

const expiryStyles: Record<ExpiryStatus, string> = {
  none: 'bg-white/[0.06] text-white/40 border-white/[0.08]',
  expired: 'bg-red-500/10 text-red-400 border-red-500/30',
  valid: 'bg-green-500/10 text-green-400 border-green-500/30',
};

export default function JwtDecoderPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<JwtParts | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = () => {
    setError(null);
    setResult(null);
    try {
      setResult(parseJwt(input));
    } catch (e) {
      setError(`Invalid JWT: ${(e as Error).message}`);
    }
  };

  const copyJson = (obj: unknown, label: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    toast.success(`${label} copied!`);
  };

  const expiry = result ? getExpiryInfo(result.payload) : null;

  return (
    <ToolPageLayout
      title="JWT Decoder"
      description="Decode and inspect any JSON Web Token — header, payload, and signature — with expiry status. Never sends your token to a server."
      icon={<Key className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Decode any JWT without a secret',
        'View header, payload, and signature',
        'Token expiry shown with visual badge',
        'Pretty-printed JSON output',
        'Runs 100% in your browser',
        'Never sends your token to a server',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">JWT Token</p>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); setResult(null); }}
            placeholder="Paste your JWT here… eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
            rows={4}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 resize-none font-mono"
          />
          <button
            onClick={decode}
            disabled={!input.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Decode
          </button>
          {error && (
            <p className="text-xs text-red-400/90 font-mono">{error}</p>
          )}
        </div>

        {result && expiry && (
          <>
            {/* Expiry badge */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${expiryStyles[expiry.status]}`}>
                {expiry.label}
              </span>
            </div>

            {/* Header */}
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Header</p>
                <button
                  onClick={() => copyJson(result.header, 'Header')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <pre className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white/70 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Payload</p>
                <button
                  onClick={() => copyJson(result.payload, 'Payload')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <pre className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white/70 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>

            {/* Signature */}
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Signature</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(result.signature); toast.success('Signature copied!'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <p className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white/50 font-mono break-all truncate">
                {result.signature}
              </p>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
