"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const tools = [
  { href: '/image-to-pdf',  label: 'Image to PDF',    color: 'bg-blue-500/10 text-blue-400' },
  { href: '/pdf-to-image',  label: 'PDF to Image',    color: 'bg-violet-500/10 text-violet-400' },
  { href: '/merge-pdf',     label: 'Merge PDF',       color: 'bg-emerald-500/10 text-emerald-400' },
  { href: '/pdf-split',     label: 'Split PDF',       color: 'bg-rose-500/10 text-rose-400' },
  { href: '/extract-text',  label: 'Extract Text',    color: 'bg-orange-500/10 text-orange-400' },
  { href: '/rotate-pdf',    label: 'Rotate PDF',      color: 'bg-yellow-500/10 text-yellow-400' },
  { href: '/watermark-pdf', label: 'Watermark PDF',   color: 'bg-purple-500/10 text-purple-400' },
  { href: '/remove-pages',  label: 'Remove Pages',    color: 'bg-red-500/10 text-red-400' },
  { href: '/page-numbers',  label: 'Page Numbers',    color: 'bg-teal-500/10 text-teal-400' },
  { href: '/reorder-pages', label: 'Reorder Pages',   color: 'bg-indigo-500/10 text-indigo-400' },
  { href: '/compress-pdf',  label: 'Compress PDF',    color: 'bg-sky-500/10 text-sky-400' },
  { href: '/flatten-pdf',   label: 'Flatten Forms',   color: 'bg-amber-500/10 text-amber-400' },
  { href: '/crop-pages',    label: 'Crop Pages',      color: 'bg-lime-500/10 text-lime-400' },
  { href: '/header-footer', label: 'Header / Footer', color: 'bg-fuchsia-500/10 text-fuchsia-400' },
  { href: '/edit-metadata', label: 'Edit Metadata',   color: 'bg-cyan-500/10 text-cyan-400' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsToolsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isToolActive = tools.some((t) => t.href === pathname);

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[#050506]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(94,106,210,0.4)]">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight accent-gradient-text">
              DocSewa
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link
              href="/"
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-all',
                pathname === '/'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
              )}
            >
              Home
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsToolsOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all',
                  isToolActive || isToolsOpen
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                )}
              >
                Tools
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isToolsOpen && 'rotate-180')} />
              </button>

              {isToolsOpen && (
                <div className="absolute top-full left-0 mt-2 w-60 rounded-2xl border border-white/[0.08] bg-[#0d0d0f]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
                  <div className="p-2 grid grid-cols-1 gap-0.5 max-h-80 overflow-y-auto">
                    {tools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                          pathname === tool.href
                            ? 'bg-indigo-500/10 text-white'
                            : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', tool.color.split(' ')[0])} />
                        {tool.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#050506]/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            <Link
              href="/"
              className={cn('px-4 py-2.5 rounded-lg text-sm transition-all', pathname === '/' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.05]')}
            >
              Home
            </Link>
            <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/20 mt-2">
              Tools
            </div>
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-all',
                  pathname === tool.href ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', tool.color.split(' ')[0])} />
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
