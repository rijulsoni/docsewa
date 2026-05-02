"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

type Unit = 'words' | 'sentences' | 'paragraphs';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const LOREM_WORDS = LOREM.replace(/[.,]/g, '').split(' ');
const LOREM_SENTENCES = LOREM.split('. ').map((s) => s.trim()).filter(Boolean);

function cycle<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function generate(amount: number, unit: Unit, startWithLorem: boolean): string {
  if (unit === 'words') {
    const words: string[] = [];
    for (let i = 0; i < amount; i++) {
      words.push(cycle(LOREM_WORDS, i));
    }
    let result = words.join(' ');
    if (startWithLorem) {
      result = 'Lorem ipsum ' + result.slice('lorem ipsum '.length > result.length ? 0 : 0);
      // replace first two words
      const parts = result.split(' ');
      parts[0] = 'Lorem';
      if (parts.length > 1) parts[1] = 'ipsum';
      result = parts.join(' ');
    }
    return result;
  }

  if (unit === 'sentences') {
    const sentences: string[] = [];
    for (let i = 0; i < amount; i++) {
      let s = cycle(LOREM_SENTENCES, i);
      if (!s.endsWith('.')) s += '.';
      sentences.push(s);
    }
    if (startWithLorem) {
      sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    }
    return sentences.join(' ');
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let i = 0; i < amount; i++) {
    paragraphs.push(LOREM);
  }
  if (startWithLorem) {
    paragraphs[0] = LOREM;
  }
  return paragraphs.join('\n\n');
}

export default function LoremIpsumPage() {
  const [amount, setAmount] = useState(3);
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');

  const handleGenerate = () => {
    const result = generate(amount, unit, startWithLorem);
    setOutput(result);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lorem-ipsum.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded lorem-ipsum.txt');
  };

  const UNITS: { value: Unit; label: string }[] = [
    { value: 'words', label: 'Words' },
    { value: 'sentences', label: 'Sentences' },
    { value: 'paragraphs', label: 'Paragraphs' },
  ];

  return (
    <ToolPageLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder lorem ipsum text by words, sentences, or paragraphs. Copy or download instantly."
      icon={<FileText className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Generate words, sentences, or paragraphs',
        'Optional classic "Lorem ipsum..." opening',
        'Copy or download as .txt',
        'Up to 20 items at once',
        'Instant generation — no server needed',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Options</p>

          {/* Amount + Unit */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/50 shrink-0">Amount</label>
              <input
                type="number"
                min={1}
                max={20}
                value={amount}
                onChange={(e) => setAmount(Math.min(20, Math.max(1, Number(e.target.value))))}
                className="w-20 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-purple-500/40 text-center"
              />
            </div>

            <div className="flex gap-1.5">
              {UNITS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setUnit(value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                    unit === value
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                      : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  startWithLorem ? 'bg-purple-500/60' : 'bg-white/10'
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  startWithLorem ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm text-white/50">Start with &ldquo;Lorem ipsum&hellip;&rdquo;</span>
          </label>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/25 transition-all"
          >
            Generate
          </button>
        </div>

        {/* Output */}
        {output && (
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Output</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              rows={10}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none resize-none select-all"
            />
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
