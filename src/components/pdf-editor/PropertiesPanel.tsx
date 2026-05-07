"use client"

import React from 'react';
import {
  Trash2, MousePointer2, Keyboard,
} from 'lucide-react';
import { useEditorStore } from './store';
import type { Annotation } from './types';
import { Section, ColorField, Slider, SegmentedControl } from '@/components/tool-ui';
import { cn } from '@/lib/utils';

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['V'], label: 'Select' },
  { keys: ['T'], label: 'Text' },
  { keys: ['P'], label: 'Pen' },
  { keys: ['H'], label: 'Highlighter' },
  { keys: ['R'], label: 'Rectangle' },
  { keys: ['O'], label: 'Ellipse' },
  { keys: ['A'], label: 'Arrow' },
  { keys: ['I'], label: 'Image' },
  { keys: ['W'], label: 'Whiteout' },
  { keys: ['S'], label: 'Signature' },
  { keys: ['⌘', 'Z'], label: 'Undo' },
  { keys: ['⌘', '⇧', 'Z'], label: 'Redo' },
  { keys: ['Del'], label: 'Delete selected' },
  { keys: ['Esc'], label: 'Deselect' },
];

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  text: { label: 'Text', emoji: 'T' },
  shape: { label: 'Shape', emoji: '◇' },
  draw: { label: 'Drawing', emoji: '✎' },
  image: { label: 'Image', emoji: '🖼' },
  whiteout: { label: 'Whiteout', emoji: '▢' },
};

export const PropertiesPanel: React.FC = () => {
  const selectedId = useEditorStore((s) => s.selectedId);
  const annotations = useEditorStore((s) => s.annotations);
  const update = useEditorStore((s) => s.updateAnnotation);
  const del = useEditorStore((s) => s.deleteAnnotation);

  const a: Annotation | null = selectedId ? annotations[selectedId] ?? null : null;

  if (!a) return <EmptyState />;

  const typeLabel =
    a.type === 'shape'
      ? a.shape.charAt(0).toUpperCase() + a.shape.slice(1)
      : a.type === 'draw'
      ? a.mode === 'pen' ? 'Pen' : 'Highlighter'
      : TYPE_LABELS[a.type]?.label ?? a.type;

  return (
    <div className="space-y-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-400/25 flex items-center justify-center text-indigo-300 text-sm font-bold shrink-0">
            {TYPE_LABELS[a.type]?.emoji ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{typeLabel}</p>
            <p className="text-[10px] text-white/45 font-mono">page {a.pageIndex + 1}</p>
          </div>
        </div>
        <button
          onClick={() => del(a.id)}
          aria-label="Delete annotation"
          title="Delete (Del)"
          className="h-7 w-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Type-specific controls */}
      {a.type === 'text' && (
        <Section title="Text" padding={4}>
          <textarea
            value={a.text}
            onChange={(e) => update(a.id, { text: e.target.value })}
            placeholder="Type here…"
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 resize-none transition-all"
          />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Size">
              <Slider value={a.fontSize} min={8} max={72} onChange={(v) => update(a.id, { fontSize: v })} accent="#6366f1" />
              <p className="text-[10px] text-white/55 font-mono mt-1">{a.fontSize}pt</p>
            </Field>
            <Field label="Color">
              <ColorField value={a.color} onChange={(v) => update(a.id, { color: v })} size="sm" />
            </Field>
          </div>
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-bold mb-1.5">Style</p>
            <SegmentedControl
              value={a.bold && a.italic ? 'bi' : a.bold ? 'b' : a.italic ? 'i' : 'r'}
              onChange={(v) => {
                update(a.id, {
                  bold: v === 'b' || v === 'bi',
                  italic: v === 'i' || v === 'bi',
                });
              }}
              options={[
                { value: 'r', label: 'Regular' },
                { value: 'b', label: <span className="font-bold">Bold</span> },
                { value: 'i', label: <span className="italic">Italic</span> },
                { value: 'bi', label: <span className="font-bold italic">Both</span> },
              ]}
              accent="#6366f1"
              fluid
            />
          </div>
        </Section>
      )}

      {a.type === 'shape' && (
        <Section title="Appearance" padding={4}>
          <div className="space-y-3">
            <Field label="Stroke">
              <ColorField value={a.stroke} onChange={(v) => update(a.id, { stroke: v })} copyable size="sm" />
            </Field>
            <Field label="Stroke width">
              <Slider value={a.strokeWidth} min={1} max={12} onChange={(v) => update(a.id, { strokeWidth: v })} accent={a.stroke} />
              <p className="text-[10px] text-white/55 font-mono mt-1">{a.strokeWidth}pt</p>
            </Field>
            {a.shape !== 'arrow' && (
              <Field label="Fill">
                <div className="flex items-center gap-2">
                  <SegmentedControl
                    value={a.fill ? 'on' : 'off'}
                    onChange={(v) => update(a.id, { fill: v === 'on' ? a.stroke : null })}
                    options={[
                      { value: 'off', label: 'None' },
                      { value: 'on', label: 'On' },
                    ]}
                    accent={a.stroke}
                  />
                  {a.fill && (
                    <ColorField value={a.fill} onChange={(v) => update(a.id, { fill: v })} size="sm" />
                  )}
                </div>
              </Field>
            )}
          </div>
        </Section>
      )}

      {a.type === 'draw' && (
        <Section title={a.mode === 'pen' ? 'Pen' : 'Highlighter'} padding={4}>
          <div className="space-y-3">
            <Field label="Color">
              <ColorField value={a.stroke} onChange={(v) => update(a.id, { stroke: v })} size="sm" />
            </Field>
            <Field label="Stroke width">
              <Slider value={a.strokeWidth} min={1} max={30} onChange={(v) => update(a.id, { strokeWidth: v })} accent={a.stroke} />
              <p className="text-[10px] text-white/55 font-mono mt-1">{a.strokeWidth}pt</p>
            </Field>
            <Field label="Opacity">
              <Slider value={Math.round(a.opacity * 100)} min={10} max={100} onChange={(v) => update(a.id, { opacity: v / 100 })} accent={a.stroke} />
              <p className="text-[10px] text-white/55 font-mono mt-1">{Math.round(a.opacity * 100)}%</p>
            </Field>
          </div>
        </Section>
      )}

      {/* Position */}
      <Section title="Position & size" padding={4}>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={Math.round(a.x)} onChange={(v) => update(a.id, { x: v })} />
          <NumberField label="Y" value={Math.round(a.y)} onChange={(v) => update(a.id, { y: v })} />
          <NumberField label="W" value={Math.round(a.w)} onChange={(v) => update(a.id, { w: Math.max(8, v) })} />
          <NumberField label="H" value={Math.round(a.h)} onChange={(v) => update(a.id, { h: Math.max(8, v) })} />
        </div>
      </Section>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-bold mb-1.5">{label}</p>
    {children}
  </div>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 px-2 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] focus-within:border-indigo-400/40 focus-within:bg-white/[0.06] transition-colors">
    <span className="text-[10px] uppercase tracking-[0.12em] text-white/40 font-bold">{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-full text-[12px] text-white/85 bg-transparent border-0 outline-none font-mono text-right"
    />
  </label>
);

const EmptyState: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="text-center pt-6 pb-2">
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-3 text-white/45">
        <MousePointer2 className="h-5 w-5" />
      </div>
      <p className="text-[13px] font-semibold text-white/85 mb-1">Nothing selected</p>
      <p className="text-[11px] text-white/45 leading-relaxed max-w-[200px] mx-auto">
        Pick a tool and drag on a page to create an annotation, or click an existing one to edit it here.
      </p>
    </div>

    <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Keyboard className="h-3.5 w-3.5 text-white/45" />
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold">
          Keyboard shortcuts
        </p>
      </div>
      <div className="space-y-1">
        {SHORTCUTS.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-white/55">{s.label}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className={cn(
                    'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded',
                    'bg-white/[0.06] border border-white/[0.10] text-[9.5px] font-bold text-white/65',
                  )}
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
