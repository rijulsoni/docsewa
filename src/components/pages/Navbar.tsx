"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, FileText, ChevronDown,
  // PDF
  FileImage, FileDown, Files, Scissors, RotateCw, Stamp, Hash, PanelTop,
  Crop, Minimize2, Layers, Tag, Lock, LockOpen, PenLine, ArrowUpDown, Trash2,
  // Word
  Code, FileOutput, ImageIcon, FileCode, BarChart3, FilePlus, Replace,
  // Image
  Repeat2, Wand2, SlidersHorizontal, ZoomIn, ScanText, Scaling,
  FlipHorizontal2, Palette, Film, Pipette, Square,
  // Mega menu category icons
  Table2, AlignLeft, Terminal, Landmark, Calendar, Paintbrush, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavTool { href: string; label: string; icon: React.ReactNode; badge?: string; }
interface NavSection { heading: string; tools: NavTool[]; }
interface MegaSection {
  label: string;
  icon: React.ReactNode;
  iconGrad: string;
  count: number;
  topTools: { href: string; label: string }[];
}

// ─── PDF (grouped) ────────────────────────────────────────────────────────────

const pdfSections: NavSection[] = [
  {
    heading: 'Convert',
    tools: [
      { href: '/image-to-pdf',  label: 'Image to PDF',  icon: <FileImage className="h-3.5 w-3.5" />, badge: 'Popular' },
      { href: '/pdf-to-image',  label: 'PDF to Image',  icon: <FileDown  className="h-3.5 w-3.5" /> },
      { href: '/extract-text',  label: 'Extract Text',  icon: <FileText  className="h-3.5 w-3.5" /> },
    ],
  },
  {
    heading: 'Organise',
    tools: [
      { href: '/merge-pdf',     label: 'Merge PDF',       icon: <Files        className="h-3.5 w-3.5" /> },
      { href: '/pdf-split',     label: 'Split PDF',       icon: <Scissors     className="h-3.5 w-3.5" /> },
      { href: '/reorder-pages', label: 'Reorder Pages',   icon: <ArrowUpDown  className="h-3.5 w-3.5" /> },
      { href: '/remove-pages',  label: 'Remove Pages',    icon: <Trash2       className="h-3.5 w-3.5" /> },
    ],
  },
  {
    heading: 'Edit',
    tools: [
      { href: '/rotate-pdf',    label: 'Rotate PDF',      icon: <RotateCw  className="h-3.5 w-3.5" /> },
      { href: '/watermark-pdf', label: 'Watermark PDF',   icon: <Stamp     className="h-3.5 w-3.5" /> },
      { href: '/page-numbers',  label: 'Page Numbers',    icon: <Hash      className="h-3.5 w-3.5" /> },
      { href: '/header-footer', label: 'Header / Footer', icon: <PanelTop  className="h-3.5 w-3.5" /> },
      { href: '/crop-pages',    label: 'Crop Pages',      icon: <Crop      className="h-3.5 w-3.5" /> },
      { href: '/compress-pdf',  label: 'Compress PDF',    icon: <Minimize2 className="h-3.5 w-3.5" /> },
      { href: '/flatten-pdf',   label: 'Flatten Forms',   icon: <Layers    className="h-3.5 w-3.5" /> },
      { href: '/edit-metadata', label: 'Edit Metadata',   icon: <Tag       className="h-3.5 w-3.5" /> },
    ],
  },
  {
    heading: 'Protect',
    tools: [
      { href: '/pdf-protect', label: 'PDF Protect', icon: <Lock     className="h-3.5 w-3.5" /> },
      { href: '/pdf-unlock',  label: 'PDF Unlock',  icon: <LockOpen className="h-3.5 w-3.5" /> },
      { href: '/pdf-sign',    label: 'PDF Sign',    icon: <PenLine  className="h-3.5 w-3.5" /> },
    ],
  },
];

// ─── Word ─────────────────────────────────────────────────────────────────────

const wordNavTools: NavTool[] = [
  { href: '/docx-to-text',        label: 'DOCX to Text',     icon: <FileText    className="h-3.5 w-3.5" /> },
  { href: '/docx-to-html',        label: 'DOCX to HTML',     icon: <Code        className="h-3.5 w-3.5" /> },
  { href: '/docx-to-pdf',         label: 'DOCX to PDF',      icon: <FileOutput  className="h-3.5 w-3.5" /> },
  { href: '/pdf-to-docx',         label: 'PDF to DOCX',      icon: <FileDown    className="h-3.5 w-3.5" /> },
  { href: '/merge-docx',          label: 'Merge DOCX',       icon: <Files       className="h-3.5 w-3.5" /> },
  { href: '/docx-find-replace',   label: 'Find & Replace',   icon: <Replace     className="h-3.5 w-3.5" /> },
  { href: '/docx-metadata',       label: 'DOCX Metadata',    icon: <Tag         className="h-3.5 w-3.5" /> },
  { href: '/docx-extract-images', label: 'Extract Images',   icon: <ImageIcon   className="h-3.5 w-3.5" /> },
  { href: '/docx-to-markdown',    label: 'DOCX to Markdown', icon: <FileCode    className="h-3.5 w-3.5" /> },
  { href: '/docx-word-count',     label: 'Word Count',       icon: <BarChart3   className="h-3.5 w-3.5" /> },
  { href: '/txt-to-docx',         label: 'TXT to DOCX',      icon: <FilePlus    className="h-3.5 w-3.5" /> },
];

// ─── Image ────────────────────────────────────────────────────────────────────

const imageNavTools: NavTool[] = [
  { href: '/image-format-converter', label: 'Format Converter',  icon: <Repeat2          className="h-3.5 w-3.5" /> },
  { href: '/background-remover',     label: 'BG Remover',        icon: <Wand2            className="h-3.5 w-3.5" />, badge: 'AI' },
  { href: '/batch-compress',         label: 'Batch Compress',    icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
  { href: '/image-upscaler',         label: 'Image Upscaler',    icon: <ZoomIn           className="h-3.5 w-3.5" /> },
  { href: '/image-to-text',          label: 'Image to Text',     icon: <ScanText         className="h-3.5 w-3.5" />, badge: 'AI' },
  { href: '/image-crop',             label: 'Crop & Resize',     icon: <Crop             className="h-3.5 w-3.5" /> },
  { href: '/image-resize',           label: 'Image Resize',      icon: <Scaling          className="h-3.5 w-3.5" /> },
  { href: '/image-watermark',        label: 'Watermark',         icon: <Stamp            className="h-3.5 w-3.5" /> },
  { href: '/image-flip-rotate',      label: 'Flip & Rotate',     icon: <FlipHorizontal2  className="h-3.5 w-3.5" /> },
  { href: '/color-palette',          label: 'Color Palette',     icon: <Palette          className="h-3.5 w-3.5" /> },
  { href: '/gif-maker',              label: 'GIF Maker',         icon: <Film             className="h-3.5 w-3.5" /> },
  { href: '/image-color-picker',     label: 'Color Picker',      icon: <Pipette          className="h-3.5 w-3.5" /> },
  { href: '/favicon-generator',      label: 'Favicon Generator', icon: <Square           className="h-3.5 w-3.5" /> },
  { href: '/image-to-base64',        label: 'Image to Base64',   icon: <FileCode         className="h-3.5 w-3.5" /> },
];

// ─── All Tools mega menu ──────────────────────────────────────────────────────

const megaSections: MegaSection[] = [
  {
    label: 'Excel / CSV', icon: <Table2 className="h-4 w-4" />, iconGrad: 'from-green-500 to-emerald-600', count: 7,
    topTools: [
      { href: '/excel-to-csv',  label: 'Excel to CSV' },
      { href: '/csv-to-excel',  label: 'CSV to Excel' },
      { href: '/excel-to-json', label: 'Excel to JSON' },
      { href: '/json-to-excel', label: 'JSON to Excel' },
    ],
  },
  {
    label: 'Text Tools', icon: <AlignLeft className="h-4 w-4" />, iconGrad: 'from-yellow-500 to-amber-500', count: 14,
    topTools: [
      { href: '/case-converter',   label: 'Case Converter' },
      { href: '/word-counter',     label: 'Word Counter' },
      { href: '/lorem-ipsum',      label: 'Lorem Ipsum' },
      { href: '/find-replace-text',label: 'Find & Replace' },
    ],
  },
  {
    label: 'Developer', icon: <Terminal className="h-4 w-4" />, iconGrad: 'from-violet-500 to-purple-600', count: 15,
    topTools: [
      { href: '/json-formatter',   label: 'JSON Formatter' },
      { href: '/base64',           label: 'Base64' },
      { href: '/hash-generator',   label: 'Hash Generator' },
      { href: '/jwt-decoder',      label: 'JWT Decoder' },
    ],
  },
  {
    label: 'Finance', icon: <Landmark className="h-4 w-4" />, iconGrad: 'from-red-500 to-rose-600', count: 4,
    topTools: [
      { href: '/loan-calculator',     label: 'Loan Calculator' },
      { href: '/compound-interest',   label: 'Compound Interest' },
      { href: '/tip-calculator',      label: 'Tip Calculator' },
      { href: '/discount-calculator', label: 'Discount Calc' },
    ],
  },
  {
    label: 'Date & Time', icon: <Calendar className="h-4 w-4" />, iconGrad: 'from-sky-500 to-cyan-600', count: 4,
    topTools: [
      { href: '/age-calculator',       label: 'Age Calculator' },
      { href: '/date-difference',      label: 'Date Difference' },
      { href: '/timezone-converter',   label: 'Timezone Converter' },
      { href: '/work-days-calculator', label: 'Work Days' },
    ],
  },
  {
    label: 'CSS & More', icon: <Paintbrush className="h-4 w-4" />, iconGrad: 'from-purple-500 to-fuchsia-600', count: 7,
    topTools: [
      { href: '/gradient-generator',    label: 'Gradient Generator' },
      { href: '/box-shadow-generator',  label: 'Box Shadow' },
      { href: '/percentage-calculator', label: 'Percentage Calc' },
      { href: '/unit-converter',        label: 'Unit Converter' },
    ],
  },
];

// ─── All tool paths (for active state) ───────────────────────────────────────

const allMegaPaths = megaSections.flatMap((s) => s.topTools.map((t) => t.href));

// ─── Sub-components ───────────────────────────────────────────────────────────

type OpenMenu = 'pdf' | 'word' | 'image' | 'all' | null;

const ToolLink: React.FC<{ tool: NavTool; pathname: string }> = ({ tool, pathname }) => (
  <Link
    href={tool.href}
    className={cn(
      'group flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150',
      pathname === tool.href ? 'bg-white/[0.07] text-white' : 'hover:bg-white/[0.05]'
    )}
  >
    <div className={cn(
      'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors',
      pathname === tool.href ? 'bg-white/[0.12] text-white' : 'bg-white/[0.05] text-white/40 group-hover:bg-white/[0.09] group-hover:text-white/70'
    )}>
      {tool.icon}
    </div>
    <span className={cn(
      'text-sm transition-colors truncate',
      pathname === tool.href ? 'text-white font-medium' : 'text-white/55 group-hover:text-white/90'
    )}>
      {tool.label}
    </span>
    {tool.badge && (
      <span className={cn(
        'ml-auto text-[9px] font-bold px-1.5 py-px rounded-full shrink-0',
        tool.badge === 'AI' ? 'bg-violet-500/20 text-violet-400' : 'bg-indigo-500/15 text-indigo-400'
      )}>
        {tool.badge}
      </span>
    )}
  </Link>
);

const GroupedDropdown: React.FC<{ sections: NavSection[]; title: string; total: number; pathname: string }> = ({
  sections, title, total, pathname,
}) => (
  <div className="absolute top-full left-0 mt-2.5 rounded-2xl border border-white/[0.08] bg-[#09090c]/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden min-w-[460px]">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
      <span className="text-sm font-semibold text-white/75">{title}</span>
      <span className="text-[11px] text-white/30 bg-white/[0.05] px-2.5 py-0.5 rounded-full font-medium">
        {total} tools
      </span>
    </div>
    <div className="p-3 space-y-3">
      {sections.map((section) => (
        <div key={section.heading}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/20 px-2.5 mb-1.5">
            {section.heading}
          </p>
          <div className="grid grid-cols-2 gap-0.5">
            {section.tools.map((tool) => (
              <ToolLink key={tool.href} tool={tool} pathname={pathname} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SimpleDropdown: React.FC<{ tools: NavTool[]; title: string; pathname: string }> = ({
  tools, title, pathname,
}) => (
  <div className="absolute top-full left-0 mt-2.5 rounded-2xl border border-white/[0.08] bg-[#09090c]/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden min-w-[380px]">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
      <span className="text-sm font-semibold text-white/75">{title}</span>
      <span className="text-[11px] text-white/30 bg-white/[0.05] px-2.5 py-0.5 rounded-full font-medium">
        {tools.length} tools
      </span>
    </div>
    <div className="p-3 grid grid-cols-2 gap-0.5">
      {tools.map((tool) => (
        <ToolLink key={tool.href} tool={tool} pathname={pathname} />
      ))}
    </div>
  </div>
);

const MegaMenu: React.FC<{ pathname: string }> = ({ pathname }) => (
  <div className="absolute top-full right-0 mt-2.5 rounded-2xl border border-white/[0.08] bg-[#09090c]/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden w-[720px]">
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
      <div>
        <span className="text-sm font-semibold text-white/75">All Tools</span>
        <span className="ml-2 text-[11px] text-white/30">— Text, Dev, Finance, Date, CSS & more</span>
      </div>
      <span className="text-[11px] text-white/30 bg-white/[0.05] px-2.5 py-0.5 rounded-full font-medium">
        94 tools
      </span>
    </div>

    <div className="p-4 grid grid-cols-3 gap-3">
      {megaSections.map((section) => (
        <div
          key={section.label}
          className="group rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.09] transition-all duration-200 p-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.iconGrad} flex items-center justify-center text-white shrink-0`}>
                {section.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-white/75 leading-none">{section.label}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{section.count} tools</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all duration-150" />
          </div>

          {/* Top tools */}
          <ul className="space-y-1.5">
            {section.topTools.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className={cn(
                    'flex items-center gap-1.5 text-xs rounded-lg px-2 py-1 transition-all',
                    pathname === tool.href ? 'text-white bg-white/[0.07]' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                >
                  <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Navbar ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); setOpenMenu(null); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allPdfPaths = pdfSections.flatMap((s) => s.tools.map((t) => t.href));
  const isPdfActive   = allPdfPaths.includes(pathname);
  const isWordActive  = wordNavTools.some((t) => t.href === pathname);
  const isImageActive = imageNavTools.some((t) => t.href === pathname);
  const isAllActive   = allMegaPaths.includes(pathname);

  const toggle = (menu: NonNullable<OpenMenu>) =>
    setOpenMenu((p) => (p === menu ? null : menu));

  const navBtnBase = 'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150';

  return (
    <nav className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled
        ? 'bg-[#050507]/92 backdrop-blur-2xl border-b border-white/[0.06]'
        : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[60px] gap-2" ref={navRef}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-4">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.45)]">
              <FileText className="h-[15px] w-[15px] text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight accent-gradient-text">DocSewa</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">

            {/* PDF */}
            <div className="relative">
              <button
                onClick={() => toggle('pdf')}
                className={cn(navBtnBase,
                  isPdfActive || openMenu === 'pdf'
                    ? 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                PDF
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', openMenu === 'pdf' && 'rotate-180')} />
              </button>
              {openMenu === 'pdf' && (
                <GroupedDropdown sections={pdfSections} title="PDF Tools" total={18} pathname={pathname} />
              )}
            </div>

            {/* Word */}
            <div className="relative">
              <button
                onClick={() => toggle('word')}
                className={cn(navBtnBase,
                  isWordActive || openMenu === 'word'
                    ? 'bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                Word
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', openMenu === 'word' && 'rotate-180')} />
              </button>
              {openMenu === 'word' && (
                <SimpleDropdown tools={wordNavTools} title="Word / DOCX Tools" pathname={pathname} />
              )}
            </div>

            {/* Image */}
            <div className="relative">
              <button
                onClick={() => toggle('image')}
                className={cn(navBtnBase,
                  isImageActive || openMenu === 'image'
                    ? 'bg-pink-500/10 text-pink-300 ring-1 ring-pink-500/20'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                Image
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', openMenu === 'image' && 'rotate-180')} />
              </button>
              {openMenu === 'image' && (
                <SimpleDropdown tools={imageNavTools} title="Image Tools" pathname={pathname} />
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-white/[0.08] mx-1.5" />

            {/* All Tools */}
            <div className="relative ml-auto">
              <button
                onClick={() => toggle('all')}
                className={cn(navBtnBase,
                  isAllActive || openMenu === 'all'
                    ? 'bg-white/[0.07] text-white ring-1 ring-white/10'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                )}
              >
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
                  <rect x="9" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
                  <rect x="1" y="9" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
                  <rect x="9" y="9" width="4" height="4" rx="1" fill="currentColor" opacity="0.5"/>
                </svg>
                All Tools
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', openMenu === 'all' && 'rotate-180')} />
              </button>
              {openMenu === 'all' && <MegaMenu pathname={pathname} />}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden ml-auto p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#050507]/95 backdrop-blur-2xl max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            <Link href="/" className={cn('px-4 py-2.5 rounded-xl text-sm transition-all',
              pathname === '/' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.05]')}>
              Home
            </Link>

            {[
              { label: 'PDF Tools',    tools: pdfSections.flatMap((s) => s.tools),  dot: 'bg-indigo-500' },
              { label: 'Word / DOCX',  tools: wordNavTools,                          dot: 'bg-blue-400'   },
              { label: 'Image Tools',  tools: imageNavTools,                         dot: 'bg-pink-500'   },
              { label: 'Excel / CSV',  tools: megaSections[0].topTools.map((t) => ({ href: t.href, label: t.label, icon: <></> })), dot: 'bg-green-500' },
              { label: 'Text Tools',   tools: megaSections[1].topTools.map((t) => ({ href: t.href, label: t.label, icon: <></> })), dot: 'bg-yellow-400' },
              { label: 'Developer',    tools: megaSections[2].topTools.map((t) => ({ href: t.href, label: t.label, icon: <></> })), dot: 'bg-violet-500' },
              { label: 'Finance',      tools: megaSections[3].topTools.map((t) => ({ href: t.href, label: t.label, icon: <></> })), dot: 'bg-red-500' },
              { label: 'Date & Time',  tools: megaSections[4].topTools.map((t) => ({ href: t.href, label: t.label, icon: <></> })), dot: 'bg-sky-500' },
              { label: 'CSS & More',   tools: megaSections[5].topTools.map((t) => ({ href: t.href, label: t.label, icon: <></> })), dot: 'bg-purple-500' },
            ].map(({ label, tools, dot }) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 px-4 py-2 mt-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25">{label}</span>
                </div>
                {tools.map((tool) => (
                  <Link key={tool.href} href={tool.href}
                    className={cn('px-4 py-2.5 rounded-xl text-sm transition-all',
                      pathname === tool.href ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.05]')}>
                    {tool.label}
                  </Link>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
