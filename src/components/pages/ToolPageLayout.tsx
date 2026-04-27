import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Shield, Zap, Lock } from 'lucide-react';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: string;
  /** Short bullets shown below the main card, e.g. key capabilities */
  features?: string[];
  children: React.ReactNode;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({
  title,
  description,
  icon,
  accentColor = 'rgba(94,106,210,0.35)',
  features,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#050506] flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* ── Hero header ── */}
        <div className="relative border-b border-white/[0.06] overflow-hidden">
          {/* ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-40 rounded-full blur-3xl pointer-events-none opacity-60"
            style={{ background: accentColor }}
          />
          {/* dot-grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
          {/* fade to black at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#050506] to-transparent pointer-events-none" />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-4xl">
              {/* Icon bubble */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, rgba(94,106,210,0.6))`,
                  boxShadow: `0 8px 32px ${accentColor}`,
                }}
              >
                {icon}
              </div>

              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-extrabold gradient-text mb-1">{title}</h1>
                <p className="text-sm text-white/45 max-w-xl leading-relaxed">{description}</p>
              </div>

              {/* Trust chips */}
              <div className="hidden lg:flex flex-col gap-1.5 shrink-0">
                {[
                  { icon: <Lock className="h-3 w-3" />,   label: 'Files stay local' },
                  { icon: <Shield className="h-3 w-3" />, label: 'No data stored' },
                  { icon: <Zap className="h-3 w-3" />,    label: 'Instant result' },
                ].map((chip) => (
                  <div key={chip.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.03] text-[11px] text-white/30">
                    <span className="text-white/40">{chip.icon}</span>
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">
          {children}

          {/* Optional feature bullets */}
          {features && features.length > 0 && (
            <div className="mt-10 glass-card rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25 mb-4">
                About this tool
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 mt-1.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ToolPageLayout;
