"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { TrendingUp } from 'lucide-react';

type Frequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily';

const FREQ_OPTIONS: { label: string; value: Frequency; n: number }[] = [
  { label: 'Annually',      value: 'annually',      n: 1   },
  { label: 'Semi-Annually', value: 'semi-annually',  n: 2   },
  { label: 'Quarterly',     value: 'quarterly',      n: 4   },
  { label: 'Monthly',       value: 'monthly',        n: 12  },
  { label: 'Daily',         value: 'daily',          n: 365 },
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CompoundInterestPage() {
  const [principal, setPrincipal]   = useState('');
  const [rate,      setRate]        = useState('');
  const [freq,      setFreq]        = useState<Frequency>('monthly');
  const [time,      setTime]        = useState('');

  const result = useMemo(() => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const freqObj = FREQ_OPTIONS.find((f) => f.value === freq)!;
    const n = freqObj.n;
    if (!P || !r || !t || P <= 0 || r <= 0 || t <= 0) return null;

    const A = P * Math.pow(1 + r / n, n * t);
    const earned = A - P;
    const ear = Math.pow(1 + r / n, n) - 1;

    const years = Math.min(Math.ceil(t), 100);
    const table: { year: number; amount: number; interest: number }[] = [];
    for (let y = 1; y <= years; y++) {
      const val = P * Math.pow(1 + r / n, n * y);
      table.push({ year: y, amount: val, interest: val - P });
    }
    return { A, earned, ear, table };
  }, [principal, rate, freq, time]);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-emerald-500/40";

  return (
    <ToolPageLayout
      title="Compound Interest Calculator"
      description="Calculate how your investment grows with compound interest — choose compounding frequency and see a year-by-year breakdown."
      icon={<TrendingUp className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Calculate compound interest growth',
        'Choose compounding frequency',
        'See year-by-year growth breakdown',
        'Shows effective annual rate',
        'Supports up to 100 years',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Parameters</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Principal ($)</label>
              <input type="number" min="0" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="10000" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Annual Rate (%)</label>
              <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="7" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Time (years)</label>
              <input type="number" min="1" max="100" value={time} onChange={(e) => setTime(e.target.value)} placeholder="10" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Compounding Frequency</label>
              <select value={freq} onChange={(e) => setFreq(e.target.value as Frequency)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-emerald-500/40">
                {FREQ_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {result && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass-card rounded-2xl p-5 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Final Amount</p>
                <p className="text-4xl font-bold text-white/90">${fmt(result.A)}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Interest Earned</p>
                <p className="text-2xl font-bold text-emerald-400">${fmt(result.earned)}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Effective Annual Rate</p>
                <p className="text-2xl font-bold text-white/80">{(result.ear * 100).toFixed(3)}%</p>
              </div>
            </div>

            {/* Year-by-year table */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Year-by-Year Breakdown</p>
              <div className="overflow-y-auto max-h-72">
                <table className="w-full text-xs text-white/50">
                  <thead className="sticky top-0 bg-[#0d0d10]">
                    <tr className="border-b border-white/[0.06]">
                      {['Year', 'Total Amount', 'Interest Earned'].map((h) => (
                        <th key={h} className="text-left pb-2 pr-4 text-white/30 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table.map((row) => (
                      <tr key={row.year} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="py-2 pr-4">Year {row.year}</td>
                        <td className="py-2 pr-4">${fmt(row.amount)}</td>
                        <td className="py-2 text-emerald-400/70">${fmt(row.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
