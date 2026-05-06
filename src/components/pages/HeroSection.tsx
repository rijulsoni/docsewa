"use client"

import React from 'react';
import FileUploadZone from './FileUploadZone';
import { ShieldCheck, Zap, EyeOff, Sparkles, Search } from 'lucide-react';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { useCommandPalette } from '@/components/CommandPalette';
import { TOTAL_TOOLS } from '@/lib/tools-data';

interface HeroSectionProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  multiple?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onFileChange, onDrop, onDragOver, multiple = false,
}) => {
  const { onOpen } = useUpgradeModal();
  const { openPalette } = useCommandPalette();

  return (
    <section className="relative pt-8 sm:pt-12 pb-4 sm:pb-6 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="animate-blob animation-delay-0 absolute top-0 -left-40 w-[560px] h-[560px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-0 -right-40 w-[560px] h-[560px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-800/6 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }} />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">

          {/* Badge & Pro Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] text-[11px] sm:text-xs text-white/50 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free · No sign-up · No data stored
            </div>
            <button 
              onClick={onOpen}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-[11px] sm:text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all backdrop-blur-sm group"
            >
              <Sparkles className="h-3 w-3 group-hover:animate-pulse" />
              Upgrade to Pro
            </button>
          </div>

          {/* Headline */}
          <h1 className="text-[36px] sm:text-5xl font-extrabold leading-[1.04] sm:leading-[1.06] tracking-tight mb-3 sm:mb-4">
            <span className="gradient-text">Every tool for</span>
            <br />
            <span className="accent-gradient-text">your documents</span>
          </h1>

          <p className="text-sm sm:text-[15px] text-white/45 max-w-lg mx-auto mb-5 sm:mb-6 leading-relaxed">
            {TOTAL_TOOLS} free tools for PDF, Word, Image, AI &amp; more.{' '}
            <span className="text-white/65">Search what you need or drop a file to begin.</span>
          </p>

          {/* Search bar — opens command palette */}
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search all tools"
            className="group w-full max-w-xl mx-auto mb-4 sm:mb-5 flex items-center gap-3 px-4 sm:px-5 h-12 sm:h-14 rounded-2xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/[0.16] transition-all text-left shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm"
          >
            <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white/40 group-hover:text-white/60 shrink-0 transition-colors" />
            <span className="flex-1 text-[13px] sm:text-sm text-white/40 group-hover:text-white/60 truncate transition-colors">
              Search {TOTAL_TOOLS} tools — try &ldquo;compress&rdquo;, &ldquo;merge&rdquo;, &ldquo;sign&rdquo;…
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded-md bg-white/[0.06] border border-white/[0.10] text-[10px] font-bold text-white/45">⌘</kbd>
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.10] text-[10px] font-bold text-white/45">K</kbd>
            </span>
          </button>

          {/* OR divider */}
          <div className="flex items-center gap-3 max-w-xl mx-auto mb-3 sm:mb-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">OR drop a file</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Upload zone */}
          <FileUploadZone
            onFileChange={onFileChange}
            onDrop={onDrop}
            onDragOver={onDragOver}
            multiple={multiple}
          />

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-5 mt-4 sm:mt-5 text-[10px] sm:text-[11px] text-white/30">
            <span className="flex items-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5 text-indigo-400/70" />
              Client-side only
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-400/70" />
              Files never uploaded
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400/70" />
              Instant results
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
