"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Tag } from 'lucide-react';

type Mode = 'final' | 'percent' | 'original';

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: 'final',    label: 'Find Final Price',    desc: 'Original Price + Discount %' },
  { id: 'percent',  label: 'Find Discount %',     desc: 'Original + Final Price' },
  { id: 'original', label: 'Find Original Price', desc: 'Final Price + Discount %' },
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DiscountCalculatorPage() {
  const [mode, setMode] = useState<Mode>('final');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const result = useMemo(() => {
    const va = parseFloat(a);
    const vb = parseFloat(b);

    if (mode === 'final') {
      if (!va || !vb || va <= 0 || vb < 0 || vb > 100) return null;
      const finalPrice = va * (1 - vb / 100);
      const saved = va - finalPrice;
      return { primary: `$${fmt(finalPrice)}`, primaryLabel: 'Final Price', secondary: `$${fmt(saved)}`, secondaryLabel: 'Amount Saved' };
    }
    if (mode === 'percent') {
      if (!va || !vb || va <= 0 || vb < 0 || vb > va) return null;
      const pct = ((va - vb) / va) * 100;
      const saved = va - vb;
      return { primary: `${pct.toFixed(2)}%`, primaryLabel: 'Discount Percentage', secondary: `$${fmt(saved)}`, secondaryLabel: 'Amount Saved' };
    }
    if (mode === 'original') {
      if (!va || !vb || va <= 0 || vb < 0 || vb >= 100) return null;
      const original = va / (1 - vb / 100);
      const saved = original - va;
      return { primary: `$${fmt(original)}`, primaryLabel: 'Original Price', secondary: `$${fmt(saved)}`, secondaryLabel: 'Amount Saved' };
    }
    return null;
  }, [mode, a, b]);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-purple-500/40";

  const labels: Record<Mode, [string, string]> = {
    final:    ['Original Price ($)', 'Discount (%)'],
    percent:  ['Original Price ($)', 'Final Price ($)'],
    original: ['Final Price ($)',    'Discount (%)'],
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setA('');
    setB('');
  };

  return (
    <ToolPageLayout
      title="Discount Calculator"
      description="Three modes: find the final price, calculate what discount was applied, or work backwards from the final price."
      icon={<Tag className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        '3 discount calculation modes',
        'Find final price from discount percentage',
        'Calculate what percentage discount was applied',
        'Work backwards from final price',
        'Shows amount saved',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Calculation Mode</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-all border text-left sm:text-center ${mode === m.id ? 'bg-purple-500/10 border-purple-500/40 text-purple-300' : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
              >
                <span className="block">{m.label}</span>
                <span className={`block text-xs mt-0.5 ${mode === m.id ? 'text-purple-300/60' : 'text-white/25'}`}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Inputs</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">{labels[mode][0]}</label>
              <input type="number" min="0" step="0.01" value={a} onChange={(e) => setA(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">{labels[mode][1]}</label>
              <input type="number" min="0" step="0.01" value={b} onChange={(e) => setB(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">{result.primaryLabel}</p>
              <p className="text-4xl font-bold text-purple-300">{result.primary}</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">{result.secondaryLabel}</p>
              <p className="text-4xl font-bold text-white/80">{result.secondary}</p>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
