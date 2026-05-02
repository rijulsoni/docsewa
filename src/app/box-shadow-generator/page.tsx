"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Layers, Copy, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Shadow {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

let nextShadowId = 2;

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shadowToCSS(s: Shadow) {
  const { r, g, b } = hexToRgb(s.color);
  const alpha = (s.opacity / 100).toFixed(2);
  const inset = s.inset ? 'inset ' : '';
  return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r},${g},${b},${alpha})`;
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  accentClass,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
  accentClass?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/30 w-16 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 cursor-pointer ${accentClass ?? 'accent-indigo-500'}`}
      />
      <span className="text-xs font-mono text-white/50 w-14 text-right shrink-0">
        {value}{unit}
      </span>
    </div>
  );
}

export default function BoxShadowGeneratorPage() {
  const [shadows, setShadows] = useState<Shadow[]>([
    { id: 1, x: 4, y: 8, blur: 24, spread: 0, color: '#6366f1', opacity: 60, inset: false },
  ]);

  const updateShadow = (id: number, patch: Partial<Shadow>) => {
    setShadows((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addShadow = () => {
    if (shadows.length >= 3) return;
    setShadows((prev) => [
      ...prev,
      { id: nextShadowId++, x: -4, y: -4, blur: 12, spread: 0, color: '#000000', opacity: 40, inset: false },
    ]);
  };

  const removeShadow = (id: number) => {
    setShadows((prev) => prev.filter((s) => s.id !== id));
  };

  const buildCSS = useCallback(() => {
    const parts = shadows.map(shadowToCSS).join(',\n             ');
    return `box-shadow: ${parts};`;
  }, [shadows]);

  const combinedBoxShadow = shadows.map(shadowToCSS).join(', ');

  const copy = () => {
    navigator.clipboard.writeText(buildCSS());
    toast.success('CSS copied to clipboard!');
  };

  return (
    <ToolPageLayout
      title="Box Shadow Generator"
      description="Build layered CSS box-shadows visually with full control over offset, blur, spread, color and opacity."
      icon={<Layers className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Visual box-shadow builder with live preview',
        'Control offset, blur, spread and color',
        'Add up to 3 layered shadows',
        'Inset shadow support',
        'Copy ready-to-use CSS',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Shadow layers */}
        {shadows.map((shadow, idx) => (
          <div key={shadow.id} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Shadow {idx + 1}
              </p>
              <div className="flex items-center gap-3">
                {/* Inset toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => updateShadow(shadow.id, { inset: !shadow.inset })}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      shadow.inset ? 'bg-indigo-500/60' : 'bg-white/[0.08]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        shadow.inset ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-white/40">Inset</span>
                </label>
                {shadows.length > 1 && (
                  <button
                    onClick={() => removeShadow(shadow.id)}
                    className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <SliderRow label="X Offset" value={shadow.x} min={-50} max={50} unit="px" onChange={(v) => updateShadow(shadow.id, { x: v })} />
              <SliderRow label="Y Offset" value={shadow.y} min={-50} max={50} unit="px" onChange={(v) => updateShadow(shadow.id, { y: v })} />
              <SliderRow label="Blur"     value={shadow.blur}   min={0}   max={100} unit="px" onChange={(v) => updateShadow(shadow.id, { blur: v })} />
              <SliderRow label="Spread"   value={shadow.spread} min={-50} max={50}  unit="px" onChange={(v) => updateShadow(shadow.id, { spread: v })} />
              <SliderRow label="Opacity"  value={shadow.opacity} min={0}  max={100} unit="%" onChange={(v) => updateShadow(shadow.id, { opacity: v })} />
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 w-16 shrink-0">Color</span>
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-lg border border-white/[0.12] overflow-hidden"
                  style={{ background: shadow.color }}
                />
                <input
                  type="color"
                  value={shadow.color}
                  onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <span className="text-sm font-mono text-white/50">{shadow.color}</span>
            </div>
          </div>
        ))}

        {/* Add shadow button */}
        {shadows.length < 3 && (
          <button
            onClick={addShadow}
            className="flex items-center gap-2 w-full justify-center py-3 rounded-2xl text-xs font-semibold border border-dashed border-white/[0.10] text-white/30 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Add another shadow
          </button>
        )}

        {/* Live preview */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Preview</p>
          <div className="flex items-center justify-center py-10">
            <div
              className="w-40 h-28 rounded-2xl bg-white/[0.06] border border-white/[0.08] transition-all duration-300"
              style={{ boxShadow: combinedBoxShadow }}
            />
          </div>
        </div>

        {/* CSS output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">CSS Output</p>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            value={buildCSS()}
            readOnly
            rows={Math.max(2, shadows.length + 1)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 font-mono focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
