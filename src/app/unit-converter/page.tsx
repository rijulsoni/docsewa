"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Ruler, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Category = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'length',      label: 'Length' },
  { id: 'weight',      label: 'Weight' },
  { id: 'temperature', label: 'Temp' },
  { id: 'area',        label: 'Area' },
  { id: 'volume',      label: 'Volume' },
  { id: 'speed',       label: 'Speed' },
];

// All values relative to SI base unit
const UNITS: Record<Category, { label: string; factor: number }[]> = {
  length:      [{ label: 'mm', factor: 0.001 }, { label: 'cm', factor: 0.01 }, { label: 'm', factor: 1 }, { label: 'km', factor: 1000 }, { label: 'in', factor: 0.0254 }, { label: 'ft', factor: 0.3048 }, { label: 'yd', factor: 0.9144 }, { label: 'mi', factor: 1609.344 }],
  weight:      [{ label: 'mg', factor: 0.000001 }, { label: 'g', factor: 0.001 }, { label: 'kg', factor: 1 }, { label: 't', factor: 1000 }, { label: 'oz', factor: 0.028349 }, { label: 'lb', factor: 0.453592 }],
  temperature: [{ label: '°C', factor: 1 }, { label: '°F', factor: 1 }, { label: 'K', factor: 1 }],
  area:        [{ label: 'mm²', factor: 0.000001 }, { label: 'cm²', factor: 0.0001 }, { label: 'm²', factor: 1 }, { label: 'km²', factor: 1e6 }, { label: 'in²', factor: 0.00064516 }, { label: 'ft²', factor: 0.092903 }, { label: 'acre', factor: 4046.856 }, { label: 'ha', factor: 10000 }],
  volume:      [{ label: 'ml', factor: 0.001 }, { label: 'cl', factor: 0.01 }, { label: 'l', factor: 1 }, { label: 'fl oz', factor: 0.029574 }, { label: 'cup', factor: 0.236588 }, { label: 'pt', factor: 0.473176 }, { label: 'qt', factor: 0.946353 }, { label: 'gal', factor: 3.785411 }],
  speed:       [{ label: 'm/s', factor: 1 }, { label: 'km/h', factor: 0.277778 }, { label: 'mph', factor: 0.44704 }, { label: 'knot', factor: 0.514444 }],
};

function convertTemp(val: number, from: string, to: string): number {
  // to Celsius first
  const c = from === '°F' ? (val - 32) * 5/9 : from === 'K' ? val - 273.15 : val;
  // from Celsius to target
  if (to === '°F') return c * 9/5 + 32;
  if (to === 'K')  return c + 273.15;
  return c;
}

function convert(val: number, from: { label: string; factor: number }, to: { label: string; factor: number }, cat: Category): number {
  if (cat === 'temperature') return convertTemp(val, from.label, to.label);
  return val * from.factor / to.factor;
}

export default function UnitConverterPage() {
  const [cat, setCat]       = useState<Category>('length');
  const [value, setValue]   = useState('1');
  const [fromIdx, setFrom]  = useState(2); // m
  const [toIdx, setTo]      = useState(3); // km

  const units = UNITS[cat];

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return '';
    const r = convert(v, units[fromIdx] ?? units[0], units[toIdx] ?? units[1], cat);
    return parseFloat(r.toPrecision(10)).toString();
  }, [value, fromIdx, toIdx, units, cat]);

  const onCatChange = (c: Category) => {
    setCat(c);
    setFrom(0);
    setTo(1);
    setValue('1');
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied!');
  };

  return (
    <ToolPageLayout
      title="Unit Converter"
      description="Convert between common metric and imperial units across 6 categories."
      icon={<Ruler className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        '6 categories: length, weight, temperature, area, volume, speed',
        'Live conversion as you type',
        'Common metric and imperial units',
        'Temperature handles °C, °F and Kelvin correctly',
        'Copy result to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Category */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Category</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ id, label }) => (
              <button key={id} onClick={() => onCatChange(id)}
                className={`py-2 rounded-xl text-sm font-semibold transition-all border ${cat === id ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Converter */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">From</label>
              <select value={fromIdx} onChange={(e) => setFrom(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-blue-500/40">
                {units.map((u, i) => <option key={u.label} value={i} className="bg-[#0d0d0f]">{u.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">To</label>
              <select value={toIdx} onChange={(e) => setTo(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-blue-500/40">
                {units.map((u, i) => <option key={u.label} value={i} className="bg-[#0d0d0f]">{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Value</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-blue-500/40"
              placeholder="Enter value…" />
          </div>
        </div>

        {/* Result */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Result</p>
            <button onClick={copy} disabled={!result}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all disabled:opacity-30">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <p className="text-3xl font-bold text-blue-300 break-all">
            {result || <span className="text-white/20">—</span>}
            {result && <span className="text-lg text-white/40 ml-2">{units[toIdx]?.label}</span>}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
}
