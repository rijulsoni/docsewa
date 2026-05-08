"use client"

import React, { useRef } from 'react';
import {
  Trash2, MousePointer2, Keyboard, Copy, ChevronUp, ChevronDown, ChevronsUp,
  ChevronsDown, Crosshair, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Repeat2,
  RotateCcw, RotateCw, RefreshCcw, Lock, Unlock, ClipboardPaste, ImagePlus,
} from 'lucide-react';
import { useEditorStore } from './store';
import type { Annotation } from './types';
import { Section, ColorField, Slider, SegmentedControl } from '@/components/tool-ui';
import { DEFAULT_COLOR_PRESETS } from '@/components/tool-ui/ColorField';
import { cn } from '@/lib/utils';

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['V'], label: 'Select' },
  { keys: ['T'], label: 'Text' },
  { keys: ['N'], label: 'Sticky note' },
  { keys: ['P'], label: 'Pen' },
  { keys: ['H'], label: 'Highlighter' },
  { keys: ['R'], label: 'Rectangle' },
  { keys: ['O'], label: 'Ellipse' },
  { keys: ['L'], label: 'Line' },
  { keys: ['A'], label: 'Arrow' },
  { keys: ['I'], label: 'Image' },
  { keys: ['W'], label: 'Whiteout' },
  { keys: ['B'], label: 'Blackout' },
  { keys: ['S'], label: 'Signature' },
  { keys: ['M'], label: 'Stamp' },
  { keys: ['C'], label: 'Check mark' },
  { keys: ['X'], label: 'Cross mark' },
  { keys: ['⌘', 'C'], label: 'Copy selected' },
  { keys: ['⌘', 'V'], label: 'Paste copied' },
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
  redaction: { label: 'Blackout', emoji: 'B' },
  mark: { label: 'Form mark', emoji: '✓' },
  note: { label: 'Sticky note', emoji: 'N' },
  stamp: { label: 'Stamp', emoji: 'S' },
};

export const PropertiesPanel: React.FC = () => {
  const selectedId = useEditorStore((s) => s.selectedId);
  const annotations = useEditorStore((s) => s.annotations);
  const update = useEditorStore((s) => s.updateAnnotation);
  const del = useEditorStore((s) => s.deleteAnnotation);
  const duplicate = useEditorStore((s) => s.duplicateAnnotation);
  const copy = useEditorStore((s) => s.copyAnnotation);
  const paste = useEditorStore((s) => s.pasteAnnotation);
  const clipboard = useEditorStore((s) => s.clipboard);
  const toggleLock = useEditorStore((s) => s.toggleAnnotationLock);
  const bringForward = useEditorStore((s) => s.bringAnnotationForward);
  const sendBackward = useEditorStore((s) => s.sendAnnotationBackward);
  const bringToFront = useEditorStore((s) => s.bringAnnotationToFront);
  const sendToBack = useEditorStore((s) => s.sendAnnotationToBack);
  const center = useEditorStore((s) => s.centerAnnotation);
  const align = useEditorStore((s) => s.alignAnnotation);
  const applyToAllPages = useEditorStore((s) => s.applyAnnotationToAllPages);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const a: Annotation | null = selectedId ? annotations[selectedId] ?? null : null;

  if (!a) return <EmptyState />;

  const typeLabel =
    a.type === 'shape'
      ? a.shape.charAt(0).toUpperCase() + a.shape.slice(1)
      : a.type === 'draw'
      ? a.mode === 'pen' ? 'Pen' : 'Highlighter'
      : a.type === 'mark'
      ? a.mark === 'check' ? 'Check mark' : 'Cross mark'
      : TYPE_LABELS[a.type]?.label ?? a.type;

  const replaceImage = async (file: File | undefined) => {
    if (!file || a.type !== 'image') return;
    const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const src = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    update(a.id, { src, mime });
  };

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

      <Section title="Actions" padding={4}>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton label={a.locked ? 'Unlock' : 'Lock'} title={a.locked ? 'Unlock annotation' : 'Lock position'} onClick={() => toggleLock(a.id)}>
            {a.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          </ActionButton>
          <ActionButton label="Copy" title="Copy selected (Cmd/Ctrl+C)" onClick={() => copy(a.id)}>
            <Copy className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Paste" title="Paste copied annotation (Cmd/Ctrl+V)" onClick={paste} disabled={!clipboard}>
            <ClipboardPaste className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Duplicate" title="Duplicate selected (Cmd/Ctrl+D)" onClick={() => duplicate(a.id)}>
            <Copy className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="All pages" title="Copy this annotation to every visible page" onClick={() => applyToAllPages(a.id)}>
            <Repeat2 className="h-3.5 w-3.5" />
          </ActionButton>
        </div>
      </Section>

      <Section title="Layer order" padding={4}>
        <div className="grid grid-cols-4 gap-2">
          <IconAction title="Send to back" onClick={() => sendToBack(a.id)}>
            <ChevronsDown className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction title="Send backward" onClick={() => sendBackward(a.id)}>
            <ChevronDown className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction title="Bring forward" onClick={() => bringForward(a.id)}>
            <ChevronUp className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction title="Bring to front" onClick={() => bringToFront(a.id)}>
            <ChevronsUp className="h-3.5 w-3.5" />
          </IconAction>
        </div>
      </Section>

      <Section title="Align on page" padding={4}>
        <div className="grid grid-cols-3 gap-2">
          <IconAction title="Align left" onClick={() => align(a.id, 'left')}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction title="Center horizontally" onClick={() => center(a.id, 'x')}>
            <Crosshair className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction title="Align right" onClick={() => align(a.id, 'right')}>
            <ArrowRight className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction title="Align top" onClick={() => align(a.id, 'top')}>
            <ArrowUp className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction title="Center on page" onClick={() => center(a.id, 'both')}>
            <Crosshair className="h-3.5 w-3.5 text-indigo-300" />
          </IconAction>
          <IconAction title="Align bottom" onClick={() => align(a.id, 'bottom')}>
            <ArrowDown className="h-3.5 w-3.5" />
          </IconAction>
        </div>
      </Section>

      {a.type !== 'whiteout' && a.type !== 'redaction' && (
        <Section title="Opacity" padding={4}>
          <Slider
            value={Math.round((a.opacity ?? 1) * 100)}
            min={10}
            max={100}
            onChange={(v) => update(a.id, { opacity: v / 100 })}
            accent="#818cf8"
          />
          <p className="text-[10px] text-white/55 font-mono mt-1">{Math.round((a.opacity ?? 1) * 100)}%</p>
        </Section>
      )}

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
              <ColorField value={a.color} onChange={(v) => update(a.id, { color: v })} size="sm" presets={DEFAULT_COLOR_PRESETS} />
            </Field>
          </div>
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-bold mb-1.5">Font</p>
            <SegmentedControl
              value={a.fontFamily ?? 'helvetica'}
              onChange={(v) => update(a.id, { fontFamily: v })}
              options={[
                { value: 'helvetica', label: 'Sans' },
                { value: 'times', label: 'Serif' },
                { value: 'courier', label: 'Mono' },
              ]}
              accent="#6366f1"
              fluid
            />
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
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-bold mb-1.5">Background</p>
            <div className="flex items-center gap-2">
              <SegmentedControl
                value={a.background ? 'on' : 'off'}
                onChange={(v) => update(a.id, {
                  background: v === 'on' ? '#ffffff' : null,
                  backgroundOpacity: v === 'on' ? (a.backgroundOpacity ?? 0.85) : a.backgroundOpacity,
                })}
                options={[
                  { value: 'off', label: 'None' },
                  { value: 'on', label: 'On' },
                ]}
                accent="#6366f1"
              />
              {a.background && (
                <ColorField value={a.background} onChange={(v) => update(a.id, { background: v })} size="sm" presets={DEFAULT_COLOR_PRESETS} />
              )}
            </div>
            {a.background && (
              <div className="mt-2">
                <Slider
                  value={Math.round((a.backgroundOpacity ?? 0.85) * 100)}
                  min={10}
                  max={100}
                  onChange={(v) => update(a.id, { backgroundOpacity: v / 100 })}
                  accent="#6366f1"
                />
                <p className="text-[10px] text-white/55 font-mono mt-1">{Math.round((a.backgroundOpacity ?? 0.85) * 100)}%</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {a.type === 'shape' && (
        <Section title="Appearance" padding={4}>
          <div className="space-y-3">
            <Field label="Stroke">
              <ColorField value={a.stroke} onChange={(v) => update(a.id, { stroke: v })} copyable size="sm" presets={DEFAULT_COLOR_PRESETS} />
            </Field>
            <Field label="Stroke width">
              <Slider value={a.strokeWidth} min={1} max={12} onChange={(v) => update(a.id, { strokeWidth: v })} accent={a.stroke} />
              <p className="text-[10px] text-white/55 font-mono mt-1">{a.strokeWidth}pt</p>
            </Field>
            {(a.shape === 'rectangle' || a.shape === 'ellipse') && (
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

      {a.type === 'mark' && (
        <Section title={a.mark === 'check' ? 'Check mark' : 'Cross mark'} padding={4}>
          <div className="space-y-3">
            <Field label="Color">
              <ColorField value={a.color} onChange={(v) => update(a.id, { color: v })} copyable size="sm" presets={DEFAULT_COLOR_PRESETS} />
            </Field>
            <Field label="Stroke width">
              <Slider value={a.strokeWidth} min={1} max={12} onChange={(v) => update(a.id, { strokeWidth: v })} accent={a.color} />
              <p className="text-[10px] text-white/55 font-mono mt-1">{a.strokeWidth}pt</p>
            </Field>
          </div>
        </Section>
      )}

      {a.type === 'note' && (
        <Section title="Sticky note" padding={4}>
          <textarea
            value={a.text}
            onChange={(e) => update(a.id, { text: e.target.value })}
            placeholder="Note text…"
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30 resize-none transition-all"
          />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Background">
              <ColorField
                value={a.background}
                onChange={(v) => update(a.id, { background: v })}
                size="sm"
                presets={['#fef3c7', '#fbcfe8', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fed7aa']}
              />
            </Field>
            <Field label="Text">
              <ColorField value={a.color} onChange={(v) => update(a.id, { color: v })} size="sm" presets={['#451a03', '#000000', '#1e293b', '#ffffff']} />
            </Field>
          </div>
          <Field label="Size">
            <Slider value={a.fontSize} min={8} max={32} onChange={(v) => update(a.id, { fontSize: v })} accent="#f59e0b" />
            <p className="text-[10px] text-white/55 font-mono mt-1">{a.fontSize}pt</p>
          </Field>
        </Section>
      )}

      {a.type === 'stamp' && (
        <Section title="Stamp" padding={4}>
          <input
            type="text"
            value={a.text}
            onChange={(e) => update(a.id, { text: e.target.value.toUpperCase() })}
            placeholder="STAMP TEXT"
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 font-bold tracking-[0.10em] uppercase"
          />
          <div className="mt-3 space-y-3">
            <Field label="Color">
              <ColorField value={a.color} onChange={(v) => update(a.id, { color: v })} size="sm" presets={DEFAULT_COLOR_PRESETS} />
            </Field>
            <Field label="Size">
              <Slider value={a.fontSize} min={14} max={64} onChange={(v) => update(a.id, { fontSize: v })} accent={a.color} />
              <p className="text-[10px] text-white/55 font-mono mt-1">{a.fontSize}pt</p>
            </Field>
            <Field label="Rotation">
              <Slider
                value={a.rotation ?? 0}
                min={-45}
                max={45}
                onChange={(v) => update(a.id, { rotation: v })}
                accent={a.color}
              />
              <p className="text-[10px] text-white/55 font-mono mt-1">{a.rotation ?? 0}°</p>
            </Field>
          </div>
        </Section>
      )}

      {a.type === 'image' && (
        <Section title="Image" padding={4}>
          <ActionButton label="Replace image" title="Choose a new PNG or JPG for this image" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus className="h-3.5 w-3.5" />
          </ActionButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              void replaceImage(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
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

const ActionButton: React.FC<{
  label: string;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}> = ({ label, title, onClick, children, variant = 'default', disabled }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'h-8 px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all disabled:opacity-35 disabled:cursor-not-allowed',
      variant === 'danger'
        ? 'border-red-500/25 bg-red-500/[0.08] text-red-200 hover:bg-red-500/[0.14]'
        : 'border-white/[0.08] bg-white/[0.035] text-white/70 hover:text-white hover:bg-white/[0.07]',
    )}
  >
    {children}
    <span className="truncate">{label}</span>
  </button>
);

const IconAction: React.FC<{
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ title, onClick, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/60 hover:text-white hover:bg-white/[0.07] inline-flex items-center justify-center transition-all"
  >
    {children}
  </button>
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

const EmptyState: React.FC = () => {
  const activePage = useEditorStore((s) => s.activePage);
  const annotations = useEditorStore((s) => s.annotations);
  const pageRotations = useEditorStore((s) => s.pageRotations);
  const deletedPages = useEditorStore((s) => s.deletedPages);
  const rotatePage = useEditorStore((s) => s.rotatePage);
  const rotateAllPages = useEditorStore((s) => s.rotateAllPages);
  const deletePage = useEditorStore((s) => s.deletePage);
  const restoreAllPages = useEditorStore((s) => s.restoreAllPages);
  const clearAnnotations = useEditorStore((s) => s.clearAnnotations);
  const clearAllEdits = useEditorStore((s) => s.clearAllEdits);
  const hasAnnotations = Object.keys(annotations).length > 0;
  const hasPageEdits = Object.keys(pageRotations).length > 0 || deletedPages.length > 0;
  const hasAnyEdits = hasAnnotations || hasPageEdits;

  return (
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

      <Section title="Document actions" padding={4}>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton label="Page left" title="Rotate current page left" onClick={() => rotatePage(activePage, -1)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Page right" title="Rotate current page right" onClick={() => rotatePage(activePage, 1)}>
            <RotateCw className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="All left" title="Rotate all visible pages left" onClick={() => rotateAllPages(-1)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="All right" title="Rotate all visible pages right" onClick={() => rotateAllPages(1)}>
            <RotateCw className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Delete page" title="Delete current page" onClick={() => deletePage(activePage)} variant="danger">
            <Trash2 className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Restore pages" title="Restore deleted pages" onClick={restoreAllPages}>
            <RefreshCcw className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Clear marks" title="Remove all annotations" onClick={clearAnnotations} variant="danger">
            <Trash2 className="h-3.5 w-3.5" />
          </ActionButton>
        </div>
        <button
          type="button"
          disabled={!hasAnyEdits}
          onClick={clearAllEdits}
          className="mt-2 h-8 w-full rounded-lg border border-red-500/25 bg-red-500/[0.08] text-[11px] font-semibold text-red-200 hover:bg-red-500/[0.14] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
        >
          Reset all editor changes
        </button>
      </Section>

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
};
