"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Hash, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Conversion logic ──────────────────────────────────────────────────────────
const ones = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const tens = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
];

function chunkToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + chunkToWords(n % 100) : '');
}

function numberToWords(n: number): string {
  if (n === 0) return 'zero';

  const negative = n < 0;
  const abs = Math.abs(n);

  const billion  = Math.floor(abs / 1_000_000_000);
  const million  = Math.floor((abs % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((abs % 1_000_000) / 1_000);
  const rest     = abs % 1_000;

  const parts: string[] = [];
  if (billion  > 0) parts.push(chunkToWords(billion)  + ' billion');
  if (million  > 0) parts.push(chunkToWords(million)  + ' million');
  if (thousand > 0) parts.push(chunkToWords(thousand) + ' thousand');
  if (rest     > 0) parts.push(chunkToWords(rest));

  return (negative ? 'negative ' : '') + parts.join(' ');
}

const ordinalSuffixMap: Record<string, string> = {
  one: 'first', two: 'second', three: 'third', four: 'fourth', five: 'fifth',
  six: 'sixth', seven: 'seventh', eight: 'eighth', nine: 'ninth', ten: 'tenth',
  eleven: 'eleventh', twelve: 'twelfth', thirteen: 'thirteenth', fourteen: 'fourteenth',
  fifteen: 'fifteenth', sixteen: 'sixteenth', seventeen: 'seventeenth',
  eighteen: 'eighteenth', nineteen: 'nineteenth',
  twenty: 'twentieth', thirty: 'thirtieth', forty: 'fortieth', fifty: 'fiftieth',
  sixty: 'sixtieth', seventy: 'seventieth', eighty: 'eightieth', ninety: 'ninetieth',
  hundred: 'hundredth', thousand: 'thousandth', million: 'millionth', billion: 'billionth',
  zero: 'zeroth',
};

function toOrdinal(words: string): string {
  const parts = words.split(' ');
  const last  = parts[parts.length - 1];
  // handle hyphenated tens-ones e.g. "twenty-three"
  if (last.includes('-')) {
    const sub   = last.split('-');
    const hyLast = sub[sub.length - 1];
    sub[sub.length - 1] = ordinalSuffixMap[hyLast] ?? hyLast + 'th';
    parts[parts.length - 1] = sub.join('-');
  } else {
    parts[parts.length - 1] = ordinalSuffixMap[last] ?? last + 'th';
  }
  return parts.join(' ');
}

function formatWithCommas(n: number): string {
  return Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const MAX =  999_999_999_999;
const MIN = -999_999_999_999;

// ── Component ─────────────────────────────────────────────────────────────────
export default function NumberToWordsPage() {
  const [raw, setRaw]         = useState('');
  const [error, setError]     = useState('');

  let words    = '';
  let ordinal  = '';
  let formatted = '';

  if (raw.trim() !== '') {
    const n = parseInt(raw.trim(), 10);
    if (!isNaN(n) && n >= MIN && n <= MAX) {
      words     = numberToWords(n);
      ordinal   = n < 0 ? '' : toOrdinal(words);
      formatted = (n < 0 ? '-' : '') + formatWithCommas(n);
    }
  }

  const handleChange = (val: string) => {
    setRaw(val);
    setError('');
    if (val.trim() === '') return;
    const n = parseInt(val.trim(), 10);
    if (isNaN(n)) { setError('Please enter a valid integer.'); return; }
    if (n > MAX || n < MIN) setError('Number must be between −999,999,999,999 and 999,999,999,999.');
  };

  const copy = () => {
    if (!words) return;
    navigator.clipboard.writeText(words);
    toast.success('Copied to clipboard!');
  };

  return (
    <ToolPageLayout
      title="Number to Words"
      description="Convert any integer up to 999 billion into English words, with ordinal form included."
      icon={<Hash className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Convert any integer up to 999 billion',
        'Cardinal and ordinal forms',
        'Copy the result to clipboard',
        'Handles negative numbers',
        'Live conversion as you type',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Number</p>
          <input
            type="text"
            inputMode="numeric"
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="e.g. 123456789"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/40"
          />
          {error && <p className="text-xs text-red-400/80 mt-1">{error}</p>}
          {formatted && !error && (
            <p className="text-xs text-white/30 mt-1 font-mono">{formatted}</p>
          )}
        </div>

        {/* Results */}
        {words && !error && (
          <div className="glass-card rounded-2xl p-5 space-y-4">
            {/* Cardinal */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Cardinal</p>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <p className="text-base text-white/80 leading-relaxed capitalize">{words}</p>
            </div>

            {/* Ordinal */}
            {ordinal && (
              <div className="border-t border-white/[0.06] pt-4 space-y-1">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Ordinal</p>
                <p className="text-base text-white/60 leading-relaxed capitalize">{ordinal}</p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!words && !error && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-2 opacity-40">
            <Hash className="h-8 w-8 text-white/20" />
            <p className="text-sm text-white/30">Enter a number above to see the result</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
