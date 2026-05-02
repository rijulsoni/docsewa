import React from 'react';
import FileUploadZone from './FileUploadZone';
import { ShieldCheck, Zap, EyeOff } from 'lucide-react';

interface HeroSectionProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  multiple?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onFileChange, onDrop, onDragOver, multiple = false,
}) => {
  return (
    <section className="relative pt-12 pb-6 overflow-hidden">
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

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] text-xs text-white/50 mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free · No sign-up · No data stored
          </div>

          {/* Headline */}
          <h1 className="text-[42px] sm:text-5xl font-extrabold leading-[1.06] tracking-tight mb-4">
            <span className="gradient-text">Every tool for</span>
            <br />
            <span className="accent-gradient-text">your documents</span>
          </h1>

          <p className="text-[15px] text-white/45 max-w-lg mx-auto mb-8 leading-relaxed">
            97 free tools for PDF, Word, Image, AI &amp; more.{' '}
            <span className="text-white/65">Drop a file to instantly see every tool that works on it.</span>
          </p>

          {/* Upload zone */}
          <FileUploadZone
            onFileChange={onFileChange}
            onDrop={onDrop}
            onDragOver={onDragOver}
            multiple={multiple}
          />

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-5 mt-5 text-[11px] text-white/30">
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
