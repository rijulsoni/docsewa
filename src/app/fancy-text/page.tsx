"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Type, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Unicode style converters ────────────────────────────────────────────────

function toOffset(char: string, upperStart: number, lowerStart: number): string {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(upperStart + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(lowerStart + code - 97);
  return char;
}

function convertString(text: string, fn: (ch: string) => string) {
  return [...text].map(fn).join('');
}

// Bold  (Math Bold): A=0x1D400, a=0x1D41A
const toBold = (t: string) => convertString(t, (c) => toOffset(c, 0x1D400, 0x1D41A));
// Italic (Math Italic): A=0x1D434, a=0x1D44E  (h=0x210E exception handled)
const italicExceptions: Record<number, number> = { 104: 0x210E }; // h
const toItalic = (t: string) => convertString(t, (c) => {
  const code = c.charCodeAt(0);
  if (italicExceptions[code]) return String.fromCodePoint(italicExceptions[code]);
  return toOffset(c, 0x1D434, 0x1D44E);
});
// Bold Italic: A=0x1D468, a=0x1D482
const toBoldItalic = (t: string) => convertString(t, (c) => toOffset(c, 0x1D468, 0x1D482));
// Script: A=0x1D49C with known exceptions
const scriptExceptions: Record<number, number> = {
  66: 0x212C, 69: 0x2130, 70: 0x2131, 72: 0x210B, 73: 0x2110,
  76: 0x2112, 77: 0x2133, 82: 0x211B,
  101: 0x212F, 103: 0x210A, 111: 0x2134,
};
const toScript = (t: string) => convertString(t, (c) => {
  const code = c.charCodeAt(0);
  if (scriptExceptions[code]) return String.fromCodePoint(scriptExceptions[code]);
  return toOffset(c, 0x1D49C, 0x1D4B6);
});
// Double-struck: A=0x1D538, known exceptions
const dsExceptions: Record<number, number> = {
  67: 0x2102, 72: 0x210D, 78: 0x2115, 80: 0x2119, 81: 0x211A, 82: 0x211D, 90: 0x2124,
};
const toDoubleStruck = (t: string) => convertString(t, (c) => {
  const code = c.charCodeAt(0);
  if (dsExceptions[code]) return String.fromCodePoint(dsExceptions[code]);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D538 + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D552 + code - 97);
  if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7D8 + code - 48);
  return c;
});
// Monospace: A=0x1D670, a=0x1D68A
const toMono = (t: string) => convertString(t, (c) => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D670 + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D68A + code - 97);
  if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7F6 + code - 48);
  return c;
});
// Circled: A=0x24B6, a=0x24D0, 0=0x2460
const toCircled = (t: string) => convertString(t, (c) => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
  if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
  if (code === 48) return '⓪';
  return c;
});
// Squared: only A-Z (0x1F170)
const toSquared = (t: string) => convertString(t, (c) => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F170 + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F170 + code - 97);
  return c;
});
// Fullwidth: A=0xFF21, a=0xFF41, 0=0xFF10
const toFullwidth = (t: string) => convertString(t, (c) => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0xFF21 + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(0xFF41 + code - 97);
  if (code >= 48 && code <= 57) return String.fromCodePoint(0xFF10 + code - 48);
  if (code === 32) return '　';
  return c;
});
// Upside down lookup
const upsideDownMap: Record<string, string> = {
  a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',
  m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',
  y:'ʎ',z:'z',
  A:'∀',B:'ᗺ',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'Ⅎ',G:'פ',H:'H',I:'I',J:'ɾ',K:'ʞ',L:'˥',
  M:'W',N:'N',O:'O',P:'Ԁ',Q:'Q',R:'ɹ',S:'S',T:'┴',U:'∩',V:'Λ',W:'M',X:'X',
  Y:'⅄',Z:'Z',
  '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6',
  '.':'˙',',':'\'','?':'¿','!':'¡','(':')',')':'(','[':']',']':'[','{':'}','}':'{',
  '<':'>','>':'<',' ':' ',
};
const toUpsideDown = (t: string) =>
  [...t].reverse().map((c) => upsideDownMap[c] ?? c).join('');

const STYLES: { name: string; fn: (t: string) => string }[] = [
  { name: 'Bold', fn: toBold },
  { name: 'Italic', fn: toItalic },
  { name: 'Bold Italic', fn: toBoldItalic },
  { name: 'Script', fn: toScript },
  { name: 'Double-struck', fn: toDoubleStruck },
  { name: 'Monospace', fn: toMono },
  { name: 'Circled', fn: toCircled },
  { name: 'Squared', fn: toSquared },
  { name: 'Fullwidth', fn: toFullwidth },
  { name: 'Upside Down', fn: toUpsideDown },
];

export default function FancyTextPage() {
  const [input, setInput] = useState('');

  const copy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${name} style copied!`);
  };

  return (
    <ToolPageLayout
      title="Fancy Text Generator"
      description="Transform plain text into bold, italic, script, monospace, circled and 10+ Unicode styles — ready to paste anywhere."
      icon={<Type className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        '10+ Unicode text style variants',
        'Bold, italic, script, monospace, circled and more',
        'Copy any style to clipboard instantly',
        'Works in social media, bios and messages',
        'No font installation needed',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Your Text</p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something to style…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-purple-500/40"
          />
        </div>

        {/* Style variants */}
        {input && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Styles</p>
            <div className="space-y-2">
              {STYLES.map(({ name, fn }) => {
                const styled = fn(input);
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-purple-500/20 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">{name}</p>
                      <p className="text-sm text-white/75 break-all">{styled}</p>
                    </div>
                    <button
                      onClick={() => copy(styled, name)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!input && (
          <div className="glass-card rounded-2xl p-8 flex items-center justify-center">
            <p className="text-sm text-white/20">Type something above to see 10 style variants</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
