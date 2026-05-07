"use client"

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  /** Label for the toast — e.g. "HEX", "CSS". */
  label?: string;
  /** Show text alongside the icon. */
  withText?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function CopyButton({
  value, label, withText = false, size = 'md', className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `Copied ${label}!` : 'Copied to clipboard!');
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error('Copy failed');
    }
  };

  const sz = size === 'sm' ? 'h-7 px-2 text-[11px]' : 'h-8 px-2.5 text-xs';

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label ? `Copy ${label}` : 'Copy'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border transition-all font-semibold shrink-0',
        sz,
        copied
          ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/[0.10]'
          : 'border-white/[0.08] bg-white/[0.025] text-white/45 hover:text-white hover:border-white/[0.18] hover:bg-white/[0.06]',
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {withText && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  );
}
