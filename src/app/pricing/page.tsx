"use client"
import React from 'react';
import Navbar from '@/components/pages/Navbar';
import Footer from '@/components/pages/Footer';
import { Check, Sparkles, Zap, Rocket, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Perfect for quick, one-off tasks.',
    features: [
      'All 97 tools included',
      'Max 10MB per file',
      '3 AI chats per day',
      '1 file at a time',
      'No account required',
    ],
    button: 'Current Plan',
    active: false,
    gradient: 'from-white/5 to-white/[0.02]',
  },
  {
    name: 'Pro',
    price: '$8',
    period: '/mo',
    desc: 'Best for power users and professionals.',
    features: [
      'Everything in Free',
      'Max 50MB per file',
      'Unlimited AI Chat',
      'Up to 20 files at once',
      'Ad-free experience',
      'Priority processing',
    ],
    button: 'Upgrade to Pro',
    active: true,
    popular: true,
    gradient: 'from-indigo-600/20 via-purple-600/10 to-transparent',
    border: 'border-indigo-500/50',
  },
  {
    name: 'Teams',
    price: '$24',
    period: '/mo',
    desc: 'For small teams and high volume.',
    features: [
      'Everything in Pro',
      'Max 200MB per file',
      'Up to 100 files at once',
      'Shared team seats (up to 5)',
      'API access (10K req/mo)',
      '24/7 Priority support',
    ],
    button: 'Contact Sales',
    active: false,
    gradient: 'from-emerald-500/10 to-transparent',
  },
];

const COMPARISON = [
  { label: 'All 97 Standard Tools', free: 'Unlimited', pro: 'Unlimited', teams: 'Unlimited' },
  { label: 'Max File Size', free: '10 MB', pro: '50 MB', teams: '200 MB' },
  { label: 'Chat with PDF (AI)', free: '3 / day', pro: 'Unlimited', teams: 'Unlimited' },
  { label: 'Document Translator', free: '3 / day', pro: 'Unlimited', teams: 'Unlimited' },
  { label: 'Batch Processing', free: '1 file', pro: '20 files', teams: '100 files' },
  { label: 'Advertising', free: 'Visible', pro: 'No Ads', teams: 'No Ads' },
  { label: 'History & Saved Files', free: '—', pro: '30 Days', teams: '90 Days' },
  { label: 'Priority Support', free: '—', pro: 'Email (48h)', teams: 'Priority (12h)' },
];

const FAQS = [
  { q: "Is it really free?", a: "Yes! All standard document tools are 100% free and unlimited. We only charge for high-server-cost features like AI and large file processing." },
  { q: "Where are my files stored?", a: "Nowhere. For our standard tools, everything runs in your browser. Files never touch our servers. AI and PDF merging happen in secure, temporary server environments and are deleted instantly after processing." },
  { q: "Can I cancel my subscription?", a: "Absolutely. You can cancel your Pro or Teams subscription at any time from your account settings with one click." },
  { q: "Do you offer a student discount?", a: "Yes! If you are a student, contact our support team with your .edu email for a 50% discount on the Pro plan." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050506] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-4">
              <Crown className="h-3 w-3" />
              Simple Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Choose the plan that&apos;s <span className="gradient-text">right for you</span>
            </h1>
            <p className="text-lg text-white/40 max-w-xl mx-auto">
              All tools are free to use. Upgrade only when you need larger file limits, batch processing, or unlimited AI.
            </p>
          </div>

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
            {TIERS.map((tier) => (
              <div 
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-8 transition-all duration-300 hover:scale-[1.02]",
                  tier.active ? tier.border : "border-white/[0.08] bg-white/[0.02]",
                  tier.popular ? "shadow-[0_20px_80px_rgba(99,102,241,0.15)]" : ""
                )}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-[10px] font-bold text-white uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                {/* Background Gradient */}
                <div className={cn("absolute inset-0 rounded-3xl opacity-40 pointer-events-none bg-gradient-to-br", tier.gradient)} />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white/90 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-white/30 text-sm font-medium">{tier.period}</span>
                  </div>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">{tier.desc}</p>

                  <div className="space-y-4 mb-10">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-1 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5 text-white/60" />
                        </div>
                        <span className="text-sm text-white/60">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={cn(
                      "w-full h-12 font-bold text-sm transition-all rounded-2xl",
                      tier.active 
                        ? "bg-white text-black hover:bg-white/90 shadow-xl" 
                        : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-white/10"
                    )}
                  >
                    {tier.button}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <div className="max-w-4xl mx-auto mb-32 overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Plan Comparison</h2>
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="p-5 text-xs font-bold uppercase tracking-widest text-white/30">Feature</th>
                      <th className="p-5 text-sm font-bold text-white">Free</th>
                      <th className="p-5 text-sm font-bold text-indigo-400">Pro</th>
                      <th className="p-5 text-sm font-bold text-emerald-400">Teams</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {COMPARISON.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 text-sm font-medium text-white/60">{row.label}</td>
                        <td className="p-5 text-sm text-white/40">{row.free}</td>
                        <td className="p-5 text-sm text-white/80 font-medium">{row.pro}</td>
                        <td className="p-5 text-sm text-white/80 font-medium">{row.teams}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-10 text-center">Common Questions</h2>
            <div className="grid gap-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <h3 className="text-base font-semibold text-white/90 mb-2">{faq.q}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-24 text-center">
            <p className="text-sm text-white/20 mb-6 uppercase tracking-widest">Trusted by creators worldwide</p>
            <div className="flex justify-center gap-10 opacity-20 grayscale">
               <Zap className="h-6 w-6 text-white" />
               <Shield className="h-6 w-6 text-white" />
               <Sparkles className="h-6 w-6 text-white" />
               <Rocket className="h-6 w-6 text-white" />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
