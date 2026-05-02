"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Fingerprint, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = () => {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (!hyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      result.push(id);
    }
    setUuids(result);
  };

  const copyAll = () => {
    if (!uuids.length) return;
    navigator.clipboard.writeText(uuids.join('\n'));
    toast.success(`${uuids.length} UUIDs copied!`);
  };

  const download = () => {
    if (!uuids.length) return;
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uuids.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded uuids.txt');
  };

  const copyOne = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('UUID copied!');
  };

  return (
    <ToolPageLayout
      title="UUID Generator"
      description="Generate cryptographically secure UUIDs in bulk — with optional uppercase and hyphen formatting — all in your browser."
      icon={<Fingerprint className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Generate 1–100 UUIDs at once',
        'Optional uppercase formatting',
        'Optional hyphen removal',
        'Uses cryptographically secure randomUUID()',
        'Copy all to clipboard or download as .txt',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Options</p>

          <div className="space-y-1">
            <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Count (1–100)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-green-500/40"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Uppercase toggle */}
            <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border text-sm font-semibold transition-all select-none ${
              uppercase
                ? 'bg-green-500/10 border-green-500/40 text-green-300'
                : 'border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
            }`}>
              <input
                type="checkbox"
                className="hidden"
                checked={uppercase}
                onChange={() => setUppercase((v) => !v)}
              />
              Uppercase
            </label>

            {/* Hyphens toggle */}
            <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border text-sm font-semibold transition-all select-none ${
              hyphens
                ? 'bg-green-500/10 border-green-500/40 text-green-300'
                : 'border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
            }`}>
              <input
                type="checkbox"
                className="hidden"
                checked={hyphens}
                onChange={() => setHyphens((v) => !v)}
              />
              Hyphens
            </label>
          </div>

          <button
            onClick={generate}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/[0.08] text-white/50 hover:text-green-300 hover:border-green-500/40 hover:bg-green-500/5"
          >
            Generate {count} UUID{count !== 1 ? 's' : ''}
          </button>
        </div>

        {/* Results */}
        {uuids.length > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Generated — {uuids.length} UUID{uuids.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-green-300 hover:border-green-500/40 hover:bg-green-500/5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy All
                </button>
                <button
                  onClick={download}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-green-300 hover:border-green-500/40 hover:bg-green-500/5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> .txt
                </button>
              </div>
            </div>

            <ol className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {uuids.map((id, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2"
                >
                  <span className="text-white/25 text-xs font-mono w-6 shrink-0">{i + 1}.</span>
                  <span className="flex-1 text-sm text-white/65 font-mono break-all">{id}</span>
                  <button
                    onClick={() => copyOne(id)}
                    className="shrink-0 p-1.5 rounded-lg text-white/25 hover:text-green-300 hover:bg-green-500/5 transition-all"
                    title="Copy this UUID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
