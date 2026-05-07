"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Option<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  /** CSS color string. Default indigo. */
  accent?: string;
  /** Stretch each segment to fill container width. */
  fluid?: boolean;
  className?: string;
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function SegmentedControl<T extends string>({
  value, onChange, options, accent = '#6366f1', fluid = false, className,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useIsoLayoutEffect(() => {
    const btn = refs.current.get(value);
    const container = containerRef.current;
    if (!btn || !container) return;
    const c = container.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    setIndicator({ left: b.left - c.left, width: b.width });
  }, [value, options.length, fluid]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex items-center gap-0.5 p-1 rounded-xl border border-white/[0.06] bg-white/[0.02]',
        fluid && 'flex w-full',
        className,
      )}
    >
      {indicator && (
        <div
          aria-hidden
          className="absolute top-1 bottom-1 rounded-lg transition-all duration-200 ease-out pointer-events-none"
          style={{
            left: indicator.left,
            width: indicator.width,
            background: `${accent}1f`,
            boxShadow: `inset 0 0 0 1px ${accent}55, 0 1px 0 rgba(255,255,255,0.04) inset`,
          }}
        />
      )}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              if (el) refs.current.set(opt.value, el);
              else refs.current.delete(opt.value);
            }}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap',
              fluid && 'flex-1',
              active ? '' : 'text-white/45 hover:text-white/75',
            )}
            style={active ? { color: accent } : undefined}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
