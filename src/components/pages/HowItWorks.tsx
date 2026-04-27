import React from 'react';
import { Upload, SlidersHorizontal, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <Upload className="h-5 w-5" />,
    title: 'Upload your file',
    description: 'Drag & drop or click to select. Supports PDF, JPG, PNG, and WebP.',
    color: 'text-indigo-400',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    number: '02',
    icon: <SlidersHorizontal className="h-5 w-5" />,
    title: 'Configure & convert',
    description: 'Choose your settings — page range, format, quality — then hit convert.',
    color: 'text-violet-400',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    number: '03',
    icon: <Download className="h-5 w-5" />,
    title: 'Download instantly',
    description: 'Your result is ready in seconds. No email, no waiting, no account needed.',
    color: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.2)]',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-4">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold gradient-text leading-tight mb-4">
            Three steps to done
          </h2>
          <p className="text-white/40 max-w-sm mx-auto text-base">
            From file to result in under a minute
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+22px)] right-[calc(16.67%+22px)] h-px bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-emerald-500/30" />

          {steps.map((step, i) => (
            <div
              key={i}
              className={`relative glass-card rounded-2xl p-6 hover:border-white/[0.14] hover:shadow-[0_0_30px_rgba(94,106,210,0.1)] transition-all duration-300`}
            >
              {/* Number badge */}
              <div className={`absolute -top-3 left-6 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${step.bg} ${step.color} border ${step.border}`}>
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl ${step.bg} border ${step.border} ${step.glow} flex items-center justify-center ${step.color} mb-5 mt-2`}>
                {step.icon}
              </div>

              <h3 className="text-base font-semibold text-white/90 mb-2">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
