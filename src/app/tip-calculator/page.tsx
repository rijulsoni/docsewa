"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Percent } from 'lucide-react';

const PRESET_TIPS = [10, 15, 18, 20, 25];

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TipCalculatorPage() {
  const [bill,       setBill]       = useState('');
  const [tipPct,     setTipPct]     = useState<number | null>(15);
  const [customTip,  setCustomTip]  = useState('');
  const [people,     setPeople]     = useState('1');
  const [roundUp,    setRoundUp]    = useState(false);
  const [useCustom,  setUseCustom]  = useState(false);

  const effectiveTip = useCustom ? parseFloat(customTip) || 0 : (tipPct ?? 0);

  const result = useMemo(() => {
    const b = parseFloat(bill);
    const p = parseInt(people) || 1;
    if (!b || b <= 0) return null;
    const tip = b * effectiveTip / 100;
    const total = b + tip;
    const rawPer = total / p;
    const perPerson = roundUp ? Math.ceil(rawPer) : rawPer;
    return { tip, total, perPerson };
  }, [bill, effectiveTip, people, roundUp]);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-yellow-500/40";

  return (
    <ToolPageLayout
      title="Tip Calculator"
      description="Calculate tip amount, total bill and per-person split — with preset tip percentages and optional round-up."
      icon={<Percent className="h-7 w-7" />}
      accentColor="rgba(251,191,36,0.35)"
      features={[
        'Calculate tip amount for any bill',
        'Quick preset tip percentages',
        'Split bill between any number of people',
        'Optional round-up to nearest dollar',
        'Shows tip, total and per-person amounts',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Bill & people */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Bill Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Bill Amount ($)</label>
              <input type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="85.00" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Number of People</label>
              <input type="number" min="1" max="100" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="1" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Tip selector */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Tip Percentage</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_TIPS.map((t) => (
              <button
                key={t}
                onClick={() => { setTipPct(t); setUseCustom(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${!useCustom && tipPct === t ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
              >
                {t}%
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${useCustom ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
            >
              Custom
            </button>
          </div>
          {useCustom && (
            <input
              type="number"
              min="0"
              step="0.5"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="Enter custom %"
              className={inputCls}
            />
          )}

          {/* Round up toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setRoundUp((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${roundUp ? 'bg-yellow-500/60' : 'bg-white/[0.08]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${roundUp ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-white/50">Round up per person</span>
          </label>
        </div>

        {/* Results */}
        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-5 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Tip Amount</p>
              <p className="text-3xl font-bold text-yellow-400">${fmt(result.tip)}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Bill</p>
              <p className="text-3xl font-bold text-white/90">${fmt(result.total)}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Per Person</p>
              <p className="text-3xl font-bold text-white/80">${fmt(result.perPerson)}</p>
              {parseInt(people) > 1 && <p className="text-xs text-white/25 mt-1">{people} people</p>}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
