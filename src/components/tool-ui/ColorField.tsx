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
  className?: string;
}

export function ColorField({
  label, value, onChange, copyable, size = 'md', trailing, className,
}: ColorFieldProps) {
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  return (
    <div className={cn('flex items-center gap-3', className)}>
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
  );
}
