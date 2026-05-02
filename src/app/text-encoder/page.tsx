"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Shuffle, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Morse lookup ──────────────────────────────────────────────────────────────
const MORSE_ENCODE: Record<string, string> = {
  A: '.-',   B: '-...', C: '-.-.', D: '-..', E: '.',
  F: '..-.', G: '--.',  H: '....', I: '..',  J: '.---',
  K: '-.-',  L: '.-..', M: '--',   N: '-.',  O: '---',
  P: '.--.', Q: '--.-', R: '.-.',  S: '...', T: '-',
  U: '..-',  V: '...-', W: '.--',  X: '-..-',Y: '-.--',
  Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};
const MORSE_DECODE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_ENCODE).map(([k, v]) => [v, k])
);

// ── HTML entity map ───────────────────────────────────────────────────────────
const HTML_ENCODE_MAP: [RegExp, string][] = [
  [/&/g,  '&amp;'],
  [/</g,  '&lt;'],
  [/>/g,  '&gt;'],
  [/"/g,  '&quot;'],
  [/'/g,  '&#39;'],
];
const HTML_DECODE_MAP: [RegExp, string][] = [
  [/&amp;/g,  '&'],
  [/&lt;/g,   '<'],
  [/&gt;/g,   '>'],
  [/&quot;/g, '"'],
  [/&#39;/g,  "'"],
];

// ── Transform functions ───────────────────────────────────────────────────────
function rot13(t: string) {
  return t.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function htmlEncode(t: string) {
  return HTML_ENCODE_MAP.reduce((s, [re, ent]) => s.replace(re, ent), t);
}

function htmlDecode(t: string) {
  return HTML_DECODE_MAP.reduce((s, [re, chr]) => s.replace(re, chr), t);
}

function toMorse(t: string) {
  return t
    .toUpperCase()
    .split(' ')
    .map((word) =>
      word
        .split('')
        .map((ch) => MORSE_ENCODE[ch] ?? '')
        .filter(Boolean)
        .join(' ')
    )
    .filter(Boolean)
    .join(' / ');
}

function fromMorse(t: string) {
  return t
    .split(' / ')
    .map((word) =>
      word
        .split(' ')
        .map((code) => MORSE_DECODE[code] ?? '')
        .join('')
    )
    .join(' ');
}

// ── Transform registry ────────────────────────────────────────────────────────
type TransformKey = 'rot13' | 'htmlEncode' | 'htmlDecode' | 'toMorse' | 'fromMorse';

const transforms: { label: string; key: TransformKey; fn: (t: string) => string }[] = [
  { label: 'ROT13',         key: 'rot13',      fn: rot13 },
  { label: 'HTML Encode',   key: 'htmlEncode', fn: htmlEncode },
  { label: 'HTML Decode',   key: 'htmlDecode', fn: htmlDecode },
  { label: 'To Morse',      key: 'toMorse',    fn: toMorse },
  { label: 'From Morse',    key: 'fromMorse',  fn: fromMorse },
];

export default function TextEncoderPage() {
  const [input, setInput]   = useState('');
  const [active, setActive] = useState<TransformKey | null>(null);
  const [output, setOutput] = useState('');

  const applyTransform = (key: TransformKey, fn: (t: string) => string) => {
    setActive(key);
    setOutput(fn(input));
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (active) {
      const t = transforms.find((t) => t.key === active);
      if (t) setOutput(t.fn(val));
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  return (
    <ToolPageLayout
      title="Text Encoder"
      description="Encode and decode text with ROT13, HTML entities, and Morse code — all in your browser."
      icon={<Shuffle className="h-7 w-7" />}
      accentColor="rgba(251,146,60,0.35)"
      features={[
        'ROT13 cipher — encode and decode',
        'HTML entity encoding and decoding',
        'Text to Morse code and back',
        'Handles multi-line text',
        'Copy result to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type or paste your text here…"
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-orange-500/40 resize-none"
          />
        </div>

        {/* Transform buttons */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Transform</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {transforms.map(({ label, key, fn }) => (
              <button
                key={key}
                onClick={() => applyTransform(key, fn)}
                disabled={!input.trim()}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${
                  active === key
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                    : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-orange-300 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Encoded / decoded text will appear here…"
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
