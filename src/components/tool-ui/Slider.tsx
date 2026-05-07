"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  /** CSS color string (hex, rgb, etc.). Default indigo. */
  accent?: string;
  className?: string;
  ariaLabel?: string;
}

export function Slider({
  value, min = 0, max = 100, step = 1, onChange,
  accent = '#6366f1', className, ariaLabel,
}: SliderProps) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const trackBg = `linear-gradient(to right, ${accent} 0%, ${accent} ${percent}%, rgba(255,255,255,0.06) ${percent}%, rgba(255,255,255,0.06) 100%)`;

  return (
    <input
      type="range"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn('docsewa-slider w-full cursor-pointer', className)}
      style={{
        background: trackBg,
        ['--ds-slider-accent' as string]: accent,
      } as React.CSSProperties}
    />
  );
}
