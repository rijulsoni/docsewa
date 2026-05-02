"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Paintbrush, Copy, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type GradientType = 'linear' | 'radial';

interface ColorStop {
  id: number;
  color: string;
}

let nextId = 3;

export default function GradientGeneratorPage() {
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: '#ff6b6b' },
    { id: 2, color: '#845ef7' },
  ]);

  const buildCSS = useCallback(() => {
    const colorList = stops.map((s) => s.color).join(', ');
    if (gradientType === 'linear') {
      return `background: linear-gradient(${angle}deg, ${colorList});`;
    }
    return `background: radial-gradient(circle, ${colorList});`;
  }, [gradientType, angle, stops]);

  const gradientStyle = useCallback(() => {
    const colorList = stops.map((s) => s.color).join(', ');
    if (gradientType === 'linear') {
      return { background: `linear-gradient(${angle}deg, ${colorList})` };
    }
    return { background: `radial-gradient(circle, ${colorList})` };
  }, [gradientType, angle, stops]);

  const updateColor = (id: number, color: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  };

  const addStop = () => {
    if (stops.length >= 3) return;
    setStops((prev) => [...prev, { id: nextId++, color: '#4ecdc4' }]);
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const copy = () => {
    navigator.clipboard.writeText(buildCSS());
    toast.success('CSS copied to clipboard!');
  };

  const cssOutput = buildCSS();

  return (
    <ToolPageLayout
      title="Gradient Generator"
      description="Build beautiful linear and radial CSS gradients visually with a live preview and copy-ready output."
      icon={<Paintbrush className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Linear and radial gradient builder',
        'Live preview updates instantly',
        'Add up to 3 color stops',
        'Adjust angle for linear gradients',
        'Copy ready-to-use CSS',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Type toggle */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Gradient Type</p>
          <div className="flex gap-2">
            {(['linear', 'radial'] as GradientType[]).map((t) => (
              <button
                key={t}
                onClick={() => setGradientType(t)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border capitalize ${
                  gradientType === t
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                    : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Color stops */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Color Stops</p>
          <div className="space-y-2">
            {stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-14 shrink-0">Stop {idx + 1}</span>
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl border border-white/[0.12] shadow-sm overflow-hidden"
                    style={{ background: stop.color }}
                  />
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColor(stop.id, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <span className="text-sm text-white/50 font-mono">{stop.color}</span>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="ml-auto p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-0 disabled:pointer-events-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          {stops.length < 3 && (
            <button
              onClick={addStop}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-white/[0.12] text-white/30 hover:text-purple-300 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Add 3rd color stop
            </button>
          )}
        </div>

        {/* Angle slider — linear only */}
        {gradientType === 'linear' && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Angle</p>
              <span className="text-sm font-mono text-purple-300">{angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/20">
              <span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span>
            </div>
          </div>
        )}

        {/* Live preview */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Preview</p>
          <div
            className="w-full h-48 rounded-xl border border-white/[0.08]"
            style={gradientStyle()}
          />
        </div>

        {/* CSS output */}
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">CSS Output</p>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            value={cssOutput}
            readOnly
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 font-mono focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}
