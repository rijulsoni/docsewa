"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  /** Uppercase section label, e.g. "CONTENT" or "ANGLE". */
  title?: string;
  /** Small description shown under the title. */
  description?: string;
  /** Right-aligned chip — typically a current value, e.g. "256 × 256 px" or "90°". */
  valueRight?: React.ReactNode;
  /** Right-aligned action like a Copy button. Sits after valueRight. */
  action?: React.ReactNode;
  /** Tighten or relax body padding. Default `5` ≈ p-5. */
  padding?: 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

const PAD: Record<NonNullable<SectionProps['padding']>, string> = {
  4: 'p-4',
  5: 'p-5',
  6: 'p-6',
};

export function Section({
  title, description, valueRight, action, padding = 5, className, children,
}: SectionProps) {
  const showHeader = title || valueRight || action;
  return (
    <div
      className={cn(
        'relative glass-card rounded-2xl overflow-hidden',
        PAD[padding],
        className,
      )}
    >
      {/* top inner highlight */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/[0.025] to-transparent pointer-events-none"
      />

      {showHeader && (
        <div className="relative flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            {title && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                {title}
              </p>
            )}
            {description && (
              <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          {(valueRight || action) && (
            <div className="flex items-center gap-2 shrink-0">
              {valueRight}
              {action}
            </div>
          )}
        </div>
      )}

      <div className="relative">{children}</div>
    </div>
  );
}
