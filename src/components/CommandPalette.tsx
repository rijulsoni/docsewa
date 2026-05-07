"use client"

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { Command as CommandPrimitive } from 'cmdk';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Search, ArrowRight, Clock, Sparkles, X, CornerDownLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TOOLS, TOOL_BY_SLUG, POPULAR_TOOLS, CATEGORIES, TOOLS_BY_CATEGORY,
  type CategoryKey, type ToolEntry,
} from '@/lib/tools-data';
import { useRecentTools } from '@/hooks/use-recent-tools';

// ── Context ──────────────────────────────────────────────────────────

interface CommandPaletteContextValue {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === '/' && !open) {
        const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
        const isTyping = tag === 'input' || tag === 'textarea'
          || (e.target as HTMLElement | null)?.isContentEditable;
        if (!isTyping) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <CommandPaletteContext.Provider value={{ open, openPalette, closePalette, togglePalette }}>
      {children}
      <CommandPaletteDialog open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}

// ── Dialog ───────────────────────────────────────────────────────────

interface DialogProps { open: boolean; onOpenChange: (v: boolean) => void; }

function CommandPaletteDialog({ open, onOpenChange }: DialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { recent, addRecent } = useRecentTools();

  // Reset query whenever the palette closes
  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const recentTools = useMemo<ToolEntry[]>(
    () => recent.map((s) => TOOL_BY_SLUG[s]).filter(Boolean),
    [recent],
  );

  const navigateTo = (tool: ToolEntry) => {
    addRecent(tool.slug);
    onOpenChange(false);
    router.push(tool.href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-3 right-3 top-[4.75rem] w-auto max-w-none translate-x-0 translate-y-0 p-0 gap-0 overflow-hidden rounded-2xl border-white/[0.08] bg-[#0a0a0d]/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-full sm:max-w-[640px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl [&>button:last-child]:hidden"
      >
        <VisuallyHidden>
          <DialogTitle>Search tools</DialogTitle>
          <DialogDescription>Search across all DocSewa tools</DialogDescription>
        </VisuallyHidden>

        <CommandPrimitive
          loop
          shouldFilter
          className="flex max-h-[calc(100dvh-6rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden sm:max-h-[75vh]"
        >
          {/* Input row */}
          <div className="flex h-12 min-w-0 items-center gap-2 border-b border-white/[0.06] px-3 sm:h-14 sm:gap-3 sm:px-4">
            <Search className="h-4 w-4 text-white/35 shrink-0" />
            <CommandPrimitive.Input
              data-command-palette-input
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Search tools…"
              className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm text-white outline-none shadow-none placeholder:text-white/30 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-[15px]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-white/35 hover:text-white/70 transition-colors shrink-0"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-semibold text-white/40 shrink-0">
              ESC
            </kbd>
          </div>

          {/* List */}
          <CommandPrimitive.List className="min-h-0 max-h-[calc(100dvh-9rem)] overflow-x-hidden overflow-y-auto overscroll-contain p-2 sm:max-h-[60vh]">
            <CommandPrimitive.Empty className="py-12 text-center">
              <p className="text-sm text-white/45">No tools match &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-white/25 mt-1">Try searching by what you want to do — &ldquo;compress&rdquo;, &ldquo;merge&rdquo;, &ldquo;sign&rdquo;.</p>
            </CommandPrimitive.Empty>

            {!query && recentTools.length > 0 && (
              <Group icon={<Clock className="h-3.5 w-3.5" />} label="Recently used">
                {recentTools.map((tool) => (
                  <ToolItem key={`recent-${tool.slug}`} tool={tool} onSelect={navigateTo} />
                ))}
              </Group>
            )}

            {!query && (
              <Group icon={<Sparkles className="h-3.5 w-3.5" />} label="Most popular">
                {POPULAR_TOOLS.map((tool) => (
                  <ToolItem key={`popular-${tool.slug}`} tool={tool} onSelect={navigateTo} />
                ))}
              </Group>
            )}

            {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
              const cat = CATEGORIES[key];
              const tools = TOOLS_BY_CATEGORY[key] ?? [];
              if (tools.length === 0) return null;
              return (
                <Group
                  key={key}
                  dot={cat.dot}
                  label={`${cat.label} · ${tools.length}`}
                >
                  {tools.map((tool) => (
                    <ToolItem key={tool.slug} tool={tool} onSelect={navigateTo} />
                  ))}
                </Group>
              );
            })}
          </CommandPrimitive.List>

          {/* Footer */}
          <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-black/20 text-[11px] text-white/35">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px]">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px] inline-flex items-center">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                </kbd>
                Open
              </span>
            </div>
            <span>{TOOLS.length} tools across {Object.keys(CATEGORIES).length} categories</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

interface GroupProps {
  label: string;
  icon?: React.ReactNode;
  dot?: string;
  children: React.ReactNode;
}

function Group({ label, icon, dot, children }: GroupProps) {
  const heading = (
    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />}
      {icon && <span className="text-white/45">{icon}</span>}
      {label}
    </span>
  );

  return (
    <CommandPrimitive.Group
      heading={heading}
      className="mb-1 min-w-0 overflow-hidden [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-2"
    >
      <div className="min-w-0 space-y-0.5 overflow-hidden">{children}</div>
    </CommandPrimitive.Group>
  );
}

interface ToolItemProps {
  tool: ToolEntry;
  onSelect: (tool: ToolEntry) => void;
}

function ToolItem({ tool, onSelect }: ToolItemProps) {
  const Icon = tool.icon;
  const cat = CATEGORIES[tool.category];
  const searchValue = `${tool.title} ${tool.description} ${cat.label} ${(tool.keywords ?? []).join(' ')}`;

  return (
    <CommandPrimitive.Item
      value={searchValue}
      onSelect={() => onSelect(tool)}
      className={cn(
        'group flex w-full max-w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-xl px-2 py-2 sm:gap-3 sm:px-2.5 cursor-pointer',
        'data-[selected=true]:bg-white/[0.06] data-[selected=true]:ring-1 data-[selected=true]:ring-white/[0.08]',
        'transition-colors'
      )}
    >
      <div
        className={cn(
          'w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-sm',
          tool.iconBg,
        )}
      >
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[13px] font-medium text-white/85">{tool.title}</span>
          {tool.badge && (
            <span className={cn(
              'text-[9px] font-bold px-1.5 py-px rounded-full shrink-0',
              tool.badge === 'AI' ? 'bg-violet-500/20 text-violet-300'
                : tool.badge === 'Popular' ? 'bg-indigo-500/20 text-indigo-300'
                : tool.badge === 'Free' ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
            )}>
              {tool.badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/35 truncate">{tool.description}</p>
      </div>
      <span className={cn(
        'hidden md:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0',
        cat.text, 'border-white/[0.08] bg-white/[0.03]',
      )}>
        {cat.label}
      </span>
      <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-white/20 group-data-[selected=true]:text-white/55 transition-colors shrink-0" />
    </CommandPrimitive.Item>
  );
}
