import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient: string;
  iconBg?: string;
  badge?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  path,
  iconBg = 'from-indigo-500 to-violet-600',
  badge,
}) => {
  return (
    <Link href={path} className="block group h-full">
      <SpotlightCard className="h-full rounded-2xl glass-card p-6 hover:border-white/[0.15] hover:shadow-[0_0_30px_rgba(94,106,210,0.1)] transition-all duration-300">
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon */}
          <div className="mb-5 flex items-start justify-between">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white shadow-[0_4px_16px_rgba(94,106,210,0.3)]`}
            >
              {icon}
            </div>
            {badge && (
              <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                {badge}
              </span>
            )}
          </div>

          {/* Text */}
          <h3 className="text-base font-semibold text-white/90 mb-2">{title}</h3>
          <p className="text-sm text-white/40 leading-relaxed flex-grow">{description}</p>

          {/* Arrow CTA */}
          <div className="mt-5 flex items-center gap-1 text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all">
            <span>Try it free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
};

export default FeatureCard;
