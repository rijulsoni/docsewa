"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import { Shield, Zap, Lock, ChevronRight, ArrowRight, Home, Search, Sparkles, Upload, Wand2, Download, HelpCircle } from 'lucide-react';
import TrackToolVisit from '@/components/TrackToolVisit';
import { useCommandPalette } from '@/components/CommandPalette';
import { TOOL_BY_HREF, TOOLS_BY_CATEGORY, CATEGORIES } from '@/lib/tools-data';
import { cn } from '@/lib/utils';

interface HowItWorksStep {
  title: string;
  description: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface ToolPageLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: string;
  /** Short bullets shown in the sidebar — key capabilities */
  features?: string[];
  /** Optional 3-step explanation. If omitted, sensible defaults are shown. */
  howItWorks?: [HowItWorksStep, HowItWorksStep, HowItWorksStep];
  /** Optional FAQ. If omitted, universal privacy/usage answers are shown. */
  faq?: FaqItem[];
  children: React.ReactNode;
}

const DEFAULT_HOW_IT_WORKS: [HowItWorksStep, HowItWorksStep, HowItWorksStep] = [
  { title: 'Upload your file', description: 'Drag & drop or click to browse — your file never leaves your device until you download the result.' },
  { title: 'We do the work', description: 'Processing happens fast in your browser or on a stateless server — nothing is saved.' },
  { title: 'Download instantly', description: 'Grab the converted file in one click. No watermarks, no sign-up, no email required.' },
];

const DEFAULT_FAQ: FaqItem[] = [
  { q: 'Is it really free?', a: 'Yes — every tool on DocSewa is free to use, with no caps on the free tier for everyday tasks. Pro adds higher limits and AI tools.' },
  { q: 'Are my files private?', a: 'Most tools run entirely in your browser, so files never leave your device. The few that need server-side processing discard your file the moment your download completes.' },
  { q: 'Is there a file size limit?', a: 'Free users can process files up to 50 MB. Pro raises this to 1 GB and unlocks batch operations.' },
  { q: 'Do I need to sign up?', a: 'No. Tools work without an account — sign-in only saves history and unlocks Pro features.' },
];

const TRUST_CHIPS = [
  { icon: <Lock className="h-3 w-3" />,   label: 'Files stay local' },
  { icon: <Shield className="h-3 w-3" />, label: 'No data stored' },
  { icon: <Zap className="h-3 w-3" />,    label: 'Instant result' },
];

const STEP_ICONS = [Upload, Wand2, Download];
const FEATURE_LIMIT = 6;

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({
  title,
  description,
  icon,
  accentColor = 'rgba(94,106,210,0.35)',
  features,
  howItWorks = DEFAULT_HOW_IT_WORKS,
  faq = DEFAULT_FAQ,
  children,
}) => {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();
  const [showAllFeatures, setShowAllFeatures] = React.useState(false);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const tool = TOOL_BY_HREF[pathname];
  const category = tool ? CATEGORIES[tool.category] : null;
  const relatedTools = tool
    ? (TOOLS_BY_CATEGORY[tool.category] ?? []).filter((t) => t.slug !== tool.slug).slice(0, 4)
    : [];

  const visibleFeatures = features
    ? showAllFeatures
      ? features
      : features.slice(0, FEATURE_LIMIT)
    : [];
  const hiddenFeatureCount = features ? Math.max(0, features.length - FEATURE_LIMIT) : 0;

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col">
      <TrackToolVisit />
      <Navbar />

      <main className="flex-grow">
        {/* ── Hero header ── */}
        <div className="relative border-b border-white/[0.06] overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-32 rounded-full blur-3xl pointer-events-none opacity-50"
            style={{ background: accentColor }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#050506] to-transparent pointer-events-none" />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-5xl">
            {/* Breadcrumbs + Quick search */}
            <div className="flex items-center justify-between gap-3 mb-4">
              {tool && category ? (
                <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/55 min-w-0 flex-1">
                  <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors shrink-0">
                    <Home className="h-3 w-3" />
                    Home
                  </Link>
                  <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                  <span className={cn('flex items-center gap-1.5 shrink-0 font-semibold', category.text)}>
                    <span className={cn('w-1 h-1 rounded-full', category.dot)} />
                    {category.label}
                  </span>
                  <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                  <span className="text-white/90 font-semibold truncate">{title}</span>
                </nav>
              ) : (
                <Link href="/" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/55 hover:text-white transition-colors">
                  <Home className="h-3 w-3" />
                  <ChevronRight className="h-3 w-3 text-white/30" />
                  <span className="text-white/90 font-semibold">{title}</span>
                </Link>
              )}

              <button
                onClick={openPalette}
                aria-label="Search all tools"
                className="hidden sm:inline-flex items-center gap-2 px-2.5 h-7 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-white/70 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all shrink-0"
              >
                <Search className="h-3 w-3" />
                <span>Search</span>
                <kbd className="inline-flex items-center justify-center px-1 h-4 rounded bg-white/[0.05] border border-white/[0.08] text-[9px] font-bold text-white/70">⌘K</kbd>
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, rgba(94,106,210,0.6))`,
                  boxShadow: `0 6px 24px ${accentColor}`,
                }}
              >
                {icon}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-extrabold gradient-text leading-tight">{title}</h1>
                  {tool?.badge && (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      tool.badge === 'AI' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/25'
                        : tool.badge === 'Popular' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/25'
                        : tool.badge === 'Free' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/25'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/25',
                    )}>
                      {tool.badge === 'AI' && <Sparkles className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />}
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-[13px] sm:text-sm text-white/70 max-w-xl leading-relaxed">{description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body: main + sticky sidebar ── */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
            {/* Main work area */}
            <div className="min-w-0">
              {children}

              {/* How it works */}
              <section className="mt-12 pt-10 border-t border-white/[0.06]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 mb-1.5">
                  How it works
                </p>
                <h2 className="text-base sm:text-lg font-bold text-white/85 tracking-tight mb-5">
                  Three steps from file to result
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {howItWorks.map((step, i) => {
                    const StepIcon = STEP_ICONS[i] ?? Upload;
                    return (
                      <div
                        key={step.title}
                        className="relative p-4 rounded-2xl border border-white/[0.06] bg-white/[0.018]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${accentColor}, rgba(94,106,210,0.6))`,
                            }}
                          >
                            <StepIcon className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                            Step {i + 1}
                          </span>
                        </div>
                        <p className="text-[13px] font-semibold text-white/85 mb-1">{step.title}</p>
                        <p className="text-[11.5px] text-white/65 leading-relaxed">{step.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* FAQ */}
              <section className="mt-10 pt-10 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-300/70" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                    FAQ
                  </p>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white/85 tracking-tight mb-5">
                  Common questions
                </h2>
                <div className="space-y-2">
                  {faq.map((item, i) => {
                    const open = openFaqIndex === i;
                    return (
                      <div
                        key={item.q}
                        className={cn(
                          'rounded-xl border bg-white/[0.018] transition-colors',
                          open ? 'border-white/[0.14]' : 'border-white/[0.06] hover:border-white/[0.10]',
                        )}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(open ? null : i)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                          aria-expanded={open}
                        >
                          <span className="text-[13px] font-semibold text-white/80">{item.q}</span>
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 text-white/75 transition-transform shrink-0',
                              open && 'rotate-90',
                            )}
                          />
                        </button>
                        {open && (
                          <p className="px-4 pb-4 text-[12.5px] text-white/70 leading-relaxed">
                            {item.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="mt-10 lg:mt-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
              {/* Trust card */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 mb-3">
                  Privacy & speed
                </p>
                <div className="space-y-2">
                  {TRUST_CHIPS.map((chip) => (
                    <div key={chip.label} className="flex items-center gap-2 text-[11.5px] text-white/75">
                      <span className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/75 shrink-0">
                        {chip.icon}
                      </span>
                      {chip.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* About card */}
              {features && features.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 mb-3">
                    About this tool
                  </p>
                  <ul className="space-y-1.5">
                    {visibleFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[11.5px] text-white/75 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-indigo-400/60 mt-1.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {hiddenFeatureCount > 0 && (
                    <button
                      onClick={() => setShowAllFeatures((v) => !v)}
                      className="mt-3 text-[11px] font-semibold text-indigo-300/70 hover:text-indigo-200 transition-colors"
                    >
                      {showAllFeatures ? 'Show less' : `+ Show ${hiddenFeatureCount} more`}
                    </button>
                  )}
                </div>
              )}

              {/* Related tools card */}
              {relatedTools.length > 0 && category && (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                      More {category.label}
                    </p>
                    <button
                      onClick={openPalette}
                      className="text-[10px] font-semibold text-white/65 hover:text-white/80 transition-colors"
                      aria-label="Browse all tools"
                    >
                      All →
                    </button>
                  </div>
                  <div className="space-y-1">
                    {relatedTools.map((rt) => {
                      const RtIcon = rt.icon;
                      return (
                        <Link
                          key={rt.slug}
                          href={rt.href}
                          className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-md bg-gradient-to-br flex items-center justify-center text-white shrink-0',
                            rt.iconBg,
                          )}>
                            <RtIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-[12px] font-medium text-white/65 group-hover:text-white truncate flex-1">
                            {rt.title}
                          </span>
                          <ArrowRight className="h-3 w-3 text-white/15 group-hover:text-white/75 transition-colors shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ToolPageLayout;
