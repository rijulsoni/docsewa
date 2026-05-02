"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Percent } from 'lucide-react';

type Mode = 'xofy' | 'whatis' | 'change' | 'adjust';

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: 'xofy',   label: 'X% of Y',            desc: 'Find what X percent of Y is' },
  { id: 'whatis', label: 'X is what % of Y?',   desc: 'Find what percentage X is of Y' },
  { id: 'change', label: '% change from X to Y', desc: 'Calculate percentage change' },
  { id: 'adjust', label: 'Adjust X by Y%',       desc: 'Increase or decrease X by Y%' },
];

function calc(mode: Mode, a: number, b: number): string {
  if (isNaN(a) || isNaN(b)) return '—';
  switch (mode) {
    case 'xofy':   return `${(a / 100 * b).toFixed(4).replace(/\.?0+$/, '')}`;
    case 'whatis': if (b === 0) return '—'; return `${(a / b * 100).toFixed(4).replace(/\.?0+$/, '')}%`;
    case 'change': if (a === 0) return '—'; return `${((b - a) / Math.abs(a) * 100).toFixed(4).replace(/\.?0+$/, '')}%`;
    case 'adjust': return `${(a * (1 + b / 100)).toFixed(4).replace(/\.?0+$/, '')}`;
  }
}

const modeLabels: Record<Mode, [string, string]> = {
  xofy:   ['Percentage (%)', 'Value (Y)'],
  whatis: ['Value (X)', 'Total (Y)'],
  change: ['From (X)', 'To (Y)'],
  adjust: ['Value (X)', 'Percent (%)'],
};

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<Mode>('xofy');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const result = calc(mode, parseFloat(a), parseFloat(b));
  const [lA, lB] = modeLabels[mode];

  return (
    <ToolPageLayout
      title="Percentage Calculator"
      description="Four percentage calculation modes — find X% of Y, percentage change, increase/decrease, and more."
      icon={<Percent className="h-7 w-7" />}
      accentColor="rgba(251,191,36,0.35)"
      features={[
        '4 percentage calculation modes',
        'Find X% of a number instantly',
        'Calculate percentage change between values',
        'Increase or decrease a value by a percentage',
        '"What percentage is X of Y" mode',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Mode</p>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(({ id, label }) => (
              <button key={id} onClick={() => { setMode(id); setA(''); setB(''); }}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border text-left ${
                  mode === id ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}>{label}</button>
            ))}
          </div>
          <p className="text-xs text-white/25">{MODES.find((m) => m.id === mode)?.desc}</p>
        </div>

        {/* Inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          {[{ label: lA, val: a, set: setA }, { label: lB, val: b, set: setB }].map(({ label, val, set }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs text-white/40">{label}</label>
              <input type="number" value={val} onChange={(e) => set(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-yellow-500/40"
                placeholder="0" />
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Result</p>
          <p className={`text-4xl font-bold ${result === '—' ? 'text-white/20' : 'text-yellow-300'}`}>{result}</p>
        </div>
      </div>
    </ToolPageLayout>
  );
}
