"use client"

import React from 'react';
import { useEditorStore } from './store';
import { cn } from '@/lib/utils';

export const StatusBar: React.FC = () => {
  const pages = useEditorStore((s) => s.pages);
  const annotations = useEditorStore((s) => s.annotations);
  const tool = useEditorStore((s) => s.tool);
  const scale = useEditorStore((s) => s.scale);
  const past = useEditorStore((s) => s.past);

  const annCount = Object.keys(annotations).length;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-1.5 border-t border-white/[0.06] bg-[#08080b]/95 backdrop-blur-xl text-[11px] text-white/55 font-medium">
      <div className="flex items-center gap-4">
        <Pill label="Tool" value={tool} accent="indigo" />
        <Pill label="Pages" value={String(pages.length)} />
        <Pill
          label="Annotations"
          value={String(annCount)}
          accent={annCount > 0 ? 'emerald' : undefined}
        />
        <Pill label="Edits" value={String(past.length)} />
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-[10.5px] text-white/40">
          Drag handles to resize · Arrow keys to nudge · Drag empty area to create
        </span>
        <Pill label="Zoom" value={`${Math.round(scale * 100)}%`} />
      </div>
    </div>
  );
};

interface PillProps {
  label: string;
  value: string;
  accent?: 'indigo' | 'emerald';
}

const Pill: React.FC<PillProps> = ({ label, value, accent }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="text-[10px] uppercase tracking-[0.14em] text-white/35 font-bold">
      {label}
    </span>
    <span
      className={cn(
        'font-mono font-semibold tabular-nums',
        accent === 'indigo' && 'text-indigo-300',
        accent === 'emerald' && 'text-emerald-300',
        !accent && 'text-white/75',
      )}
    >
      {value}
    </span>
  </span>
);
