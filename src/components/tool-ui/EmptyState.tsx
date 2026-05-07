"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function EmptyState({ icon, title, subtitle, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 py-10 px-6 rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.012] text-center overflow-hidden',
        className,
      )}
    >
      {/* dotted backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      {/* radial glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 rounded-full pointer-events-none blur-3xl opacity-40"
        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.20), transparent 70%)' }}
      />

      <div className="relative w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {icon}
      </div>
      <p className="relative text-[13px] font-semibold text-white/85 mt-1">{title}</p>
      {subtitle && (
        <p className="relative text-[11px] text-white/55 max-w-xs leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
