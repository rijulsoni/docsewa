"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Paintbrush, Plus, Trash2 } from 'lucide-react';
import {
  Section, Slider, SegmentedControl, ColorField, CopyButton,
} from '@/components/tool-ui';

type GradientType = 'linear' | 'radial';

interface ColorStop {
  id: number;
  color: string;
}

const ACCENT = '#a855f7'; // purple-500

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
        <Section title="Gradient type">
          <SegmentedControl
            value={gradientType}
            onChange={setGradientType}
            accent={ACCENT}
            options={[
              { value: 'linear', label: 'Linear' },
              { value: 'radial', label: 'Radial' },
            ]}
          />
        </Section>

        {/* Color stops */}
        <Section
          title="Color stops"
          valueRight={
            <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-white/55 border border-white/[0.08]">
              {stops.length} / 3
            </span>
          }
        >
          <div className="space-y-2">
            {stops.map((stop, idx) => (
              <ColorField
                key={stop.id}
                label={`Stop ${idx + 1}`}
                value={stop.color}
                onChange={(color) => updateColor(stop.id, color)}
                trailing={
                  stops.length > 2 ? (
                    <button
                      onClick={() => removeStop(stop.id)}
                      aria-label="Remove color stop"
                      className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : undefined
                }
              />
            ))}
          </div>
          {stops.length < 3 && (
            <button
              onClick={addStop}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-white/[0.12] text-white/35 hover:text-purple-300 hover:border-purple-500/30 hover:bg-purple-500/[0.06] transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Add 3rd color stop
            </button>
          )}
        </Section>

        {/* Angle slider — linear only */}
        {gradientType === 'linear' && (
          <Section
            title="Angle"
            valueRight={
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {angle}°
              </span>
            }
          >
            <Slider value={angle} min={0} max={360} onChange={setAngle} accent={ACCENT} ariaLabel="Gradient angle" />
            <div className="flex justify-between text-[10px] text-white/25 mt-2 font-mono">
              <span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span>
            </div>
          </Section>
        )}

        {/* Live preview */}
        <Section title="Preview">
          <div
            className="w-full h-48 rounded-xl border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_30px_rgba(0,0,0,0.35)]"
            style={gradientStyle()}
          />
        </Section>

        {/* CSS output */}
        <Section
          title="CSS output"
          action={<CopyButton value={cssOutput} label="CSS" withText />}
        >
          <pre className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-purple-200 font-mono overflow-x-auto select-all">
            <code>{cssOutput}</code>
          </pre>
        </Section>
      </div>
    </ToolPageLayout>
  );
}
