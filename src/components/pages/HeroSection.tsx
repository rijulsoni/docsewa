import React from 'react';
import FileUploadZone from './FileUploadZone';
import { Shield, Zap, Lock } from 'lucide-react';

interface HeroSectionProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  multiple?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onFileChange,
  onDrop,
  onDragOver,
  multiple = false,
}) => {
  return (
    <section className="relative py-8 md:py-10 overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="animate-blob animation-delay-0 absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-1/3 -right-32 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-24 left-1/3 w-[400px] h-[400px] bg-indigo-800/10 rounded-full blur-3xl" />
      </div>

      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-xs text-white/60 mb-4 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Free · No sign-up · No data stored
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.08] tracking-tight mb-3">
            <span className="gradient-text">Transform your</span>
            <br />
            <span className="accent-gradient-text">PDFs instantly</span>
          </h1>

          <p className="text-base text-white/50 max-w-xl mx-auto mb-5 leading-relaxed">
            36 tools for PDF, Word, Excel &amp; images — drop any file and instantly see{' '}
            <span className="text-white/70">every tool that works on it</span>.
          </p>

          {/* Upload zone */}
          <FileUploadZone
            onFileChange={onFileChange}
            onDrop={onDrop}
            onDragOver={onDragOver}
            multiple={multiple}
          />

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-white/35">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-indigo-400" />
              Client-side processing
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-violet-400" />
              Files never stored
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Instant conversion
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
