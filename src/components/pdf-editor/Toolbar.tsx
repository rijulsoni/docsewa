"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
  MousePointer2, Type, Pencil, Highlighter, Square, Circle, ArrowRight,
  Image as ImageIcon, Eraser, PenLine, Undo2, Redo2, Plus, Minus, Download,
  StickyNote, Stamp, Check, X,
} from 'lucide-react';
import type { Tool, Annotation } from './types';
import { useEditorStore, nextId } from './store';
import { cn } from '@/lib/utils';

interface ToolDef {
  key: Tool;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

interface ToolGroup {
  label: string;
  tools: ToolDef[];
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    label: 'Selection',
    tools: [
      { key: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select', shortcut: 'V' },
    ],
  },
  {
    label: 'Annotate',
    tools: [
      { key: 'text',        icon: <Type className="h-4 w-4" />,        label: 'Text',         shortcut: 'T' },
      { key: 'note',        icon: <StickyNote className="h-4 w-4" />,  label: 'Sticky note',  shortcut: 'N' },
      { key: 'pen',         icon: <Pencil className="h-4 w-4" />,      label: 'Pen',          shortcut: 'P' },
      { key: 'highlighter', icon: <Highlighter className="h-4 w-4" />, label: 'Highlighter',  shortcut: 'H' },
    ],
  },
  {
    label: 'Shapes',
    tools: [
      { key: 'rectangle', icon: <Square className="h-4 w-4" />,     label: 'Rectangle', shortcut: 'R' },
      { key: 'ellipse',   icon: <Circle className="h-4 w-4" />,     label: 'Ellipse',   shortcut: 'O' },
      { key: 'line',      icon: <Minus className="h-4 w-4" />,      label: 'Line',      shortcut: 'L' },
      { key: 'arrow',     icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow',     shortcut: 'A' },
    ],
  },
  {
    label: 'Insert',
    tools: [
      { key: 'image',     icon: <ImageIcon className="h-4 w-4" />, label: 'Image',     shortcut: 'I' },
      { key: 'signature', icon: <PenLine className="h-4 w-4" />,   label: 'Signature', shortcut: 'S' },
      { key: 'stamp',     icon: <Stamp className="h-4 w-4" />,     label: 'Stamp',     shortcut: 'M' },
    ],
  },
  {
    label: 'Forms',
    tools: [
      { key: 'check', icon: <Check className="h-4 w-4" />, label: 'Check mark', shortcut: 'C' },
      { key: 'cross', icon: <X className="h-4 w-4" />,     label: 'Cross mark', shortcut: 'X' },
    ],
  },
  {
    label: 'Edit',
    tools: [
      { key: 'whiteout', icon: <Eraser className="h-4 w-4" />, label: 'Whiteout', shortcut: 'W' },
      { key: 'redact',   icon: <Square className="h-4 w-4" />, label: 'Blackout', shortcut: 'B' },
    ],
  },
];

interface Props {
  onSave: () => void;
  onSign: () => void;
  isSaving: boolean;
}

export const Toolbar: React.FC<Props> = ({ onSave, onSign, isSaving }) => {
  const tool = useEditorStore((s) => s.tool);
  const setTool = useEditorStore((s) => s.setTool);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const scale = useEditorStore((s) => s.scale);
  const setScale = useEditorStore((s) => s.setScale);
  const addAnnotation = useEditorStore((s) => s.addAnnotation);
  const pages = useEditorStore((s) => s.pages);
  const activePage = useEditorStore((s) => s.activePage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stampOpen, setStampOpen] = useState(false);
  const stampRef = useRef<HTMLDivElement>(null);

  // Close stamp popover on outside click / Esc
  useEffect(() => {
    if (!stampOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!stampRef.current?.contains(e.target as Node)) setStampOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStampOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [stampOpen]);

  const onToolClick = (k: Tool) => {
    if (k === 'image') {
      fileInputRef.current?.click();
      return;
    }
    if (k === 'signature') {
      onSign();
      return;
    }
    if (k === 'stamp') {
      setStampOpen((v) => !v);
      return;
    }
    setTool(k);
  };

  const placeStamp = (text: string, color: string) => {
    const page = pages[activePage] ?? pages[0];
    const fontSize = 28;
    // Estimate stamp box size from text length (rough: 15pt per char + padding)
    const estW = Math.max(140, text.length * 14 + 32);
    const estH = fontSize + 24;
    const x = page ? Math.max(0, (page.width - estW) / 2) : 50;
    const y = page ? Math.max(0, (page.height - estH) / 2) : 50;
    const a: Annotation = {
      type: 'stamp',
      id: nextId(),
      pageIndex: activePage,
      x, y, w: estW, h: estH,
      text,
      color,
      fontSize,
      rotation: -8,
    };
    addAnnotation(a);
    setTool('select');
    setStampOpen(false);
  };

  const handleImagePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const mime = f.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = dataUrl;
    });
    // Place on the currently visible page, sized to fit ~50% of page width, centered
    const page = pages[activePage] ?? pages[0];
    const maxW = Math.min(300, (page?.width ?? 600) * 0.6);
    const targetW = Math.min(maxW, dims.w);
    const targetH = (targetW / dims.w) * dims.h;
    const x = page ? Math.max(0, (page.width - targetW) / 2) : 50;
    const y = page ? Math.max(0, (page.height - targetH) / 2) : 50;
    addAnnotation({
      type: 'image',
      id: nextId(),
      pageIndex: activePage,
      x,
      y,
      w: targetW,
      h: targetH,
      src: dataUrl,
      mime,
    });
    // Auto-switch to Select so the user can immediately drag the new image
    setTool('select');
  };

  return (
    <div ref={stampRef} className="relative flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-white/[0.08] bg-[#0a0a0d]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
      {TOOL_GROUPS.map((g, gi) => (
        <React.Fragment key={g.label}>
          {gi > 0 && <Divider />}
          <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label={g.label}>
            {g.tools.map((t) => (
              <ToolButton
                key={t.key}
                tool={t}
                active={tool === t.key || (t.key === 'stamp' && stampOpen)}
                onClick={() => onToolClick(t.key)}
              />
            ))}
          </div>
        </React.Fragment>
      ))}

      {stampOpen && <StampsPopover onPick={placeStamp} />}

      <Divider />

      <ToolbarButton
        title="Undo (⌘Z)"
        disabled={past.length === 0}
        onClick={undo}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Redo (⌘⇧Z)"
        disabled={future.length === 0}
        onClick={redo}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Zoom out" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <button
        onClick={() => setScale(1)}
        title="Reset zoom"
        className="text-[11px] font-mono font-bold text-white/65 hover:text-white px-2 h-8 rounded-md hover:bg-white/[0.06] transition-colors min-w-[48px]"
      >
        {Math.round(scale * 100)}%
      </button>
      <ToolbarButton title="Zoom in" onClick={() => setScale(Math.min(3, scale + 0.1))}>
        <Plus className="h-4 w-4" />
      </ToolbarButton>

      <div className="ml-auto pl-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="ds-shine h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-indigo-500 via-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-sm font-bold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_6px_20px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-indigo-400/40 hover:-translate-y-px"
        >
          <Download className="h-4 w-4 relative z-[1]" />
          <span className="relative z-[1]">{isSaving ? 'Saving…' : 'Save PDF'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleImagePicked}
        className="hidden"
      />
    </div>
  );
};

const Divider: React.FC = () => (
  <div className="w-px h-6 bg-white/[0.08] mx-1 shrink-0" />
);

const STAMP_PRESETS: { text: string; color: string }[] = [
  { text: 'DRAFT',         color: '#dc2626' },
  { text: 'APPROVED',      color: '#16a34a' },
  { text: 'CONFIDENTIAL',  color: '#dc2626' },
  { text: 'REVIEWED',      color: '#2563eb' },
  { text: 'REJECTED',      color: '#b91c1c' },
  { text: 'PAID',          color: '#15803d' },
  { text: 'URGENT',        color: '#ea580c' },
  { text: 'COPY',          color: '#475569' },
  { text: 'FOR REVIEW',    color: '#7c3aed' },
  { text: 'FINAL',         color: '#0891b2' },
  { text: 'VOID',          color: '#991b1b' },
  { text: 'SIGNED',        color: '#0f766e' },
  { text: 'RECEIVED',      color: '#2563eb' },
  { text: 'DUPLICATE',     color: '#475569' },
];

const StampsPopover: React.FC<{ onPick: (text: string, color: string) => void }> = ({ onPick }) => (
  <div
    role="dialog"
    className="absolute top-full mt-2 right-3 z-50 w-[280px] rounded-2xl border border-white/[0.10] bg-[#0a0a0d]/98 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] p-3"
  >
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 px-1 pb-2">
      Stamps · click to place
    </p>
    <div className="grid grid-cols-2 gap-2">
      {STAMP_PRESETS.map((s) => (
        <button
          key={s.text}
          onClick={() => onPick(s.text, s.color)}
          className="group relative flex items-center justify-center px-2 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.16] transition-all"
        >
          <span
            className="px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.10em] rounded-sm"
            style={{
              color: s.color,
              border: `2px solid ${s.color}`,
              boxShadow: `inset 0 0 0 1px ${s.color}`,
              transform: 'rotate(-5deg)',
            }}
          >
            {s.text}
          </span>
        </button>
      ))}
    </div>
    <p className="text-[10px] text-white/40 px-1 pt-2 mt-2 border-t border-white/[0.06]">
      Stamps drop on the visible page. Drag to reposition.
    </p>
  </div>
);

interface ToolButtonProps {
  tool: ToolDef;
  active: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, active, onClick }) => (
  <button
    onClick={onClick}
    title={`${tool.label}  ·  ${tool.shortcut}`}
    aria-label={tool.label}
    aria-pressed={active}
    className={cn(
      'group relative h-9 w-9 flex items-center justify-center rounded-lg transition-all',
      active
        ? 'bg-indigo-500/15 text-indigo-200 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.40),0_2px_8px_rgba(99,102,241,0.30)]'
        : 'text-white/55 hover:text-white hover:bg-white/[0.06]',
    )}
  >
    {tool.icon}
    {active && (
      <span className="absolute -bottom-1 left-2 right-2 h-[2px] rounded-full bg-indigo-400" />
    )}
  </button>
);

const ToolbarButton: React.FC<{
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="h-9 w-9 flex items-center justify-center rounded-lg text-white/55 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
  >
    {children}
  </button>
);
