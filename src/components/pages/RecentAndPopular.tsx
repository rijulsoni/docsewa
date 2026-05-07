"use client"

import React from 'react';
import Link from 'next/link';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { POPULAR_TOOLS, TOOL_BY_SLUG, CATEGORIES, type ToolEntry } from '@/lib/tools-data';
import { useRecentTools } from '@/hooks/use-recent-tools';
import { useCommandPalette } from '@/components/CommandPalette';

const RecentAndPopular: React.FC = () => {
  const { recent } = useRecentTools();
  const { openPalette } = useCommandPalette();

  const recentTools = recent.map((s) => TOOL_BY_SLUG[s]).filter(Boolean).slice(0, 8);

  return (
    <section className="relative py-8 sm:py-10">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {recentTools.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <SectionHeader
              icon={<Clock className="h-3.5 w-3.5 text-indigo-300" />}
              title="Continue where you left off"
              subtitle={`${recentTools.length} tool${recentTools.length === 1 ? '' : 's'} you used recently`}
            />
            <ToolStrip tools={recentTools} />
          </div>
        )}

        <div>
          <SectionHeader
            icon={<Sparkles className="h-3.5 w-3.5 text-amber-300" />}
            title="Most popular"
            subtitle="Used most by people every day"
            action={
              <button
                onClick={openPalette}
                className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45 hover:text-white transition-colors"
              >
                Browse all
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          <ToolStrip tools={POPULAR_TOOLS} />
        </div>
      </div>
    </section>
  );
};

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/[0.10] flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white/95 tracking-tight">{title}</h2>
      </div>
      <p className="text-[11px] sm:text-xs text-white/55 ml-8">{subtitle}</p>
    </div>
    {action}
  </div>
);

const ToolStrip: React.FC<{ tools: ToolEntry[] }> = ({ tools }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
    {tools.map((tool) => {
      const Icon = tool.icon;
      const cat = CATEGORIES[tool.category];
      return (
        <Link
          key={tool.slug}
          href={tool.href}
          className="group relative flex flex-col gap-2 p-3 rounded-xl border border-white/[0.06] bg-white/[0.018] hover:bg-white/[0.05] hover:border-white/[0.14] hover:-translate-y-0.5 transition-all overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm shrink-0',
                tool.iconBg,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            {tool.badge && (
              <span
                className={cn(
                  'text-[9px] font-bold px-1.5 py-px rounded-full',
                  tool.badge === 'AI' ? 'bg-violet-500/20 text-violet-300'
                    : tool.badge === 'Popular' ? 'bg-indigo-500/20 text-indigo-300'
                    : tool.badge === 'Free' ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300',
                )}
              >
                {tool.badge}
              </span>
            )}
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-white/95 group-hover:text-white truncate">{tool.title}</p>
            <p className={cn('text-[10px] mt-0.5 truncate font-semibold', cat.text)}>{cat.label}</p>
          </div>
        </Link>
      );
    })}
  </div>
);

export default RecentAndPopular;
