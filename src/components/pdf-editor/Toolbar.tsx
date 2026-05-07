"use client"

import React, { useRef } from 'react';
import {
  MousePointer2, Type, Pencil, Highlighter, Square, Circle, ArrowRight,
  Image as ImageIcon, Eraser, PenLine, Undo2, Redo2, Plus, Minus, Download,
} from 'lucide-react';
import type { Tool } from './types';
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
      { key: 'pen',         icon: <Pencil className="h-4 w-4" />,      label: 'Pen',          shortcut: 'P' },
      { key: 'highlighter', icon: <Highlighter className="h-4 w-4" />, label: 'Highlighter',  shortcut: 'H' },
    ],
  },
  {
    label: 'Shapes',
    tools: [
      { key: 'rectangle', icon: <Square className="h-4 w-4" />,     label: 'Rectangle', shortcut: 'R' },
      { key: 'ellipse',   icon: <Circle className="h-4 w-4" />,     label: 'Ellipse',   shortcut: 'O' },
      { key: 'arrow',     icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow',     shortcut: 'A' },
    ],
  },
  {
    label: 'Insert',
    tools: [
      { key: 'image',     icon: <ImageIcon className="h-4 w-4" />, label: 'Image',     shortcut: 'I' },
      { key: 'signature', icon: <PenLine className="h-4 w-4" />,   label: 'Signature', shortcut: 'S' },
    ],
  },
  {
    label: 'Edit',
    tools: [
      { key: 'whiteout', icon: <Eraser className="h-4 w-4" />, label: 'Whiteout', shortcut: 'W' },
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onToolClick = (k: Tool) => {
    if (k === 'image') {
      fileInputRef.current?.click();
      return;
    }
    if (k === 'signature') {
      onSign();
      return;
    }
    setTool(k);
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
    const targetW = Math.min(300, dims.w);
    const targetH = (targetW / dims.w) * dims.h;
    addAnnotation({
      type: 'image',
      id: nextId(),
      pageIndex: 0,
      x: 50,
      y: 50,
      w: targetW,
      h: targetH,
      src: dataUrl,
      mime,
    });
    // Auto-switch to Select so the user can immediately drag the new image
    setTool('select');
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-white/[0.08] bg-[#0a0a0d]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
      {TOOL_GROUPS.map((g, gi) => (
        <React.Fragment key={g.label}>
          {gi > 0 && <Divider />}
          <div className="flex items-center gap-0.5" role="group" aria-label={g.label}>
            {g.tools.map((t) => (
              <ToolButton
                key={t.key}
                tool={t}
                active={tool === t.key}
                onClick={() => onToolClick(t.key)}
              />
            ))}
          </div>
        </React.Fragment>
      ))}

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
