"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface SwatchProps {
  color: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  className?: string;
}

const SIZE: Record<NonNullable<SwatchProps['size']>, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

export function Swatch({ color, active, onClick, size = 'md', title, className }: SwatchProps) {
  return (
    <button
      type="button"
      title={title ?? color}
      onClick={onClick}
      aria-label={`Choose color ${color}`}
      className={cn(
        'rounded-lg transition-all duration-150 hover:scale-110 hover:-translate-y-0.5',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_4px_rgba(0,0,0,0.4)]',
        SIZE[size],
        active
          ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#0a0a0d]'
          : 'ring-1 ring-white/[0.10] hover:ring-white/30',
        className,
      )}
      style={{ background: color }}
    />
  );
}
