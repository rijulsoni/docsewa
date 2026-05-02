"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Activity } from 'lucide-react';

type System = 'metric' | 'imperial';

interface Category { label: string; range: string; color: string; bg: string; min: number; max: number }
const CATS: Category[] = [
  { label: 'Underweight', range: '< 18.5',     color: 'text-sky-400',    bg: 'bg-sky-500',     min: 0,    max: 18.5 },
  { label: 'Normal',      range: '18.5 – 24.9', color: 'text-emerald-400',bg: 'bg-emerald-500', min: 18.5, max: 25 },
  { label: 'Overweight',  range: '25 – 29.9',   color: 'text-amber-400',  bg: 'bg-amber-500',   min: 25,   max: 30 },
  { label: 'Obese',       range: '≥ 30',         color: 'text-red-400',    bg: 'bg-red-500',     min: 30,   max: 100 },
];

function getCategory(bmi: number): Category {
  return CATS.find((c) => bmi >= c.min && bmi < c.max) ?? CATS[3];
}

export default function BmiCalculatorPage() {
  const [system,    setSystem]    = useState<System>('metric');
  const [weight,    setWeight]    = useState('');
  const [heightCm,  setHeightCm]  = useState('');
  const [heightFt,  setHeightFt]  = useState('');
  const [heightIn,  setHeightIn]  = useState('');
  const [weightLb,  setWeightLb]  = useState('');

  const { bmi, category, idealMin, idealMax } = useMemo(() => {
    let weightKg: number, heightM: number;
    if (system === 'metric') {
      weightKg = parseFloat(weight);
      heightM  = parseFloat(heightCm) / 100;
    } else {
      weightKg = parseFloat(weightLb) * 0.453592;
      const totalIn = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightM = totalIn * 0.0254;
    }
    if (!weightKg || !heightM || heightM <= 0) return { bmi: null, category: null, idealMin: 0, idealMax: 0 };
    const bmi = weightKg / (heightM * heightM);
    const idealMin = 18.5 * heightM * heightM;
    const idealMax = 24.9 * heightM * heightM;
    return { bmi, category: getCategory(bmi), idealMin, idealMax };
  }, [system, weight, heightCm, heightFt, heightIn, weightLb]);

  const pct = bmi ? Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100)) : 0;

  return (
    <ToolPageLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index in metric or imperial units — with category, visual scale and ideal weight range."
      icon={<Activity className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Metric (kg/cm) and imperial (lb/ft/in) modes',
        'Instant BMI calculation',
        'Color-coded weight categories',
        'Visual scale showing your position',
        'Ideal weight range for your height',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* System toggle */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">System</p>
          <div className="flex gap-2">
            {([['metric', 'Metric (kg / cm)'], ['imperial', 'Imperial (lb / ft·in)']] as [System, string][]).map(([s, label]) => (
              <button key={s} onClick={() => setSystem(s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${system === s ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          {system === 'metric' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-emerald-500/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40">Height (cm)</label>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-emerald-500/40" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40">Weight (lb)</label>
                <input type="number" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} placeholder="154" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-emerald-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40">Height (ft)</label>
                  <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-emerald-500/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40">Height (in)</label>
                  <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="9" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-emerald-500/40" />
                </div>
              </div>
            </>
          )}
        </div>

        {bmi && category && (
          <>
            {/* Result */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-1">BMI</p>
                  <p className="text-5xl font-bold text-white/90">{bmi.toFixed(1)}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${category.color} bg-white/[0.06]`}>
                  {category.label}
                </div>
              </div>

              {/* Scale bar */}
              <div className="space-y-1">
                <div className="h-3 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-sky-500/40" />
                  <div className="flex-1 bg-emerald-500/40" />
                  <div className="flex-1 bg-amber-500/40" />
                  <div className="flex-1 bg-red-500/40" />
                </div>
                <div className="relative h-2">
                  <div className="absolute w-3 h-3 rounded-full bg-white shadow-lg -top-0.5 transition-all" style={{ left: `calc(${pct}% - 6px)` }} />
                </div>
                <div className="flex justify-between text-[10px] text-white/25">
                  <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 gap-2">
                {CATS.map((c) => (
                  <div key={c.label} className={`px-3 py-2 rounded-lg border ${category.label === c.label ? 'border-white/20 bg-white/[0.06]' : 'border-white/[0.04]'}`}>
                    <span className={`text-xs font-semibold ${c.color}`}>{c.label}</span>
                    <p className="text-[10px] text-white/25 mt-0.5">{c.range}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ideal weight */}
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Ideal weight for your height</p>
              <p className="text-white/70 font-semibold">
                {system === 'metric'
                  ? `${idealMin.toFixed(1)} – ${idealMax.toFixed(1)} kg`
                  : `${(idealMin / 0.453592).toFixed(1)} – ${(idealMax / 0.453592).toFixed(1)} lb`}
              </p>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
