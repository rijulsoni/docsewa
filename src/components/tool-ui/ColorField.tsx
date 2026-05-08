"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { CopyButton } from './CopyButton';

interface ColorFieldProps {
  /** Optional left-side label like "Stop 1" or "Foreground". */
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  /** Show inline copy button after the hex display. */
  copyable?: boolean;
  size?: 'sm' | 'md';
  /** Right-aligned slot — e.g. a delete button. */
  trailing?: React.ReactNode;
  /** Optional row of preset swatches shown below the picker. */
  presets?: string[];
  className?: string;
}

export const DEFAULT_COLOR_PRESETS = [
  '#000000', '#ffffff', '#dc2626', '#ea580c', '#eab308',
  '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777',
];

export function ColorField({
  label, value, onChange, copyable, size = 'md', trailing, presets, className,
}: ColorFieldProps) {
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  return (
    <div className={cn('flex flex-col gap-2', className)}>
    <div className={cn('flex items-center gap-3')}>
      {label && (
        <span className="text-[11px] text-white/55 w-14 shrink-0 uppercase tracking-[0.12em] font-semibold">
          {label}
        </span>
      )}
      <div
        className={cn(
          'relative shrink-0 rounded-xl border border-white/[0.10] overflow-hidden',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_2px_rgba(0,0,0,0.3)]',
          dim,
        )}
      >
        <div className="absolute inset-0" style={{ background: value }} />
        {/* checkerboard for transparent colors */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(255,255,255,0.10) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.10) 75%), linear-gradient(45deg, rgba(255,255,255,0.10) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.10) 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 4px 4px',
          }}
        />
        {onChange && (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={label ?? 'Pick color'}
          />
        )}
      </div>
      <span className="text-sm text-white/65 font-mono select-all">{value}</span>
      {copyable && <CopyButton value={value} label={label} size="sm" className="ml-auto" />}
      {trailing && <div className="ml-auto flex items-center">{trailing}</div>}
    </div>
      {presets && onChange && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => {
            const active = value.toLowerCase() === p.toLowerCase();
            return (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                title={p}
                aria-label={`Pick ${p}`}
                className={cn(
                  'w-5 h-5 rounded-md transition-all hover:scale-110',
                  active
                    ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#0a0a0d]'
                    : 'ring-1 ring-white/[0.10] hover:ring-white/30',
                )}
                style={{ background: p }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
