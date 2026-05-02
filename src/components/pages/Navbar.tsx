"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const pdfTools = [
  { href: '/image-to-pdf',  label: 'Image to PDF',    dot: 'bg-blue-500' },
  { href: '/pdf-to-image',  label: 'PDF to Image',    dot: 'bg-violet-500' },
  { href: '/merge-pdf',     label: 'Merge PDF',       dot: 'bg-emerald-500' },
  { href: '/pdf-split',     label: 'Split PDF',       dot: 'bg-rose-500' },
  { href: '/extract-text',  label: 'Extract Text',    dot: 'bg-orange-500' },
  { href: '/rotate-pdf',    label: 'Rotate PDF',      dot: 'bg-yellow-500' },
  { href: '/watermark-pdf', label: 'Watermark PDF',   dot: 'bg-purple-500' },
  { href: '/remove-pages',  label: 'Remove Pages',    dot: 'bg-red-500' },
  { href: '/page-numbers',  label: 'Page Numbers',    dot: 'bg-teal-500' },
  { href: '/reorder-pages', label: 'Reorder Pages',   dot: 'bg-indigo-500' },
  { href: '/compress-pdf',  label: 'Compress PDF',    dot: 'bg-sky-500' },
  { href: '/flatten-pdf',   label: 'Flatten Forms',   dot: 'bg-amber-500' },
  { href: '/crop-pages',    label: 'Crop Pages',      dot: 'bg-lime-500' },
  { href: '/header-footer', label: 'Header / Footer', dot: 'bg-fuchsia-500' },
  { href: '/edit-metadata', label: 'Edit Metadata',   dot: 'bg-cyan-500' },
  { href: '/pdf-protect',   label: 'PDF Protect',     dot: 'bg-red-500' },
  { href: '/pdf-sign',      label: 'PDF Sign',        dot: 'bg-indigo-400' },
  { href: '/pdf-unlock',    label: 'PDF Unlock',      dot: 'bg-emerald-400' },
];

const wordTools = [
  { href: '/docx-to-text',        label: 'DOCX to Text',     dot: 'bg-blue-400' },
  { href: '/docx-to-html',        label: 'DOCX to HTML',     dot: 'bg-purple-400' },
  { href: '/docx-to-pdf',         label: 'DOCX to PDF',      dot: 'bg-red-400' },
  { href: '/pdf-to-docx',         label: 'PDF to DOCX',      dot: 'bg-sky-400' },
  { href: '/merge-docx',          label: 'Merge DOCX',       dot: 'bg-emerald-400' },
  { href: '/docx-find-replace',   label: 'Find & Replace',   dot: 'bg-amber-400' },
  { href: '/docx-metadata',       label: 'DOCX Metadata',    dot: 'bg-indigo-400' },
  { href: '/docx-extract-images', label: 'Extract Images',   dot: 'bg-pink-400' },
  { href: '/docx-to-markdown',    label: 'DOCX to Markdown', dot: 'bg-violet-400' },
  { href: '/docx-word-count',     label: 'Word Count',       dot: 'bg-sky-400' },
  { href: '/txt-to-docx',         label: 'TXT to DOCX',      dot: 'bg-emerald-400' },
];

const imageTools = [
  { href: '/image-format-converter', label: 'Format Converter', dot: 'bg-pink-500' },
  { href: '/background-remover',     label: 'BG Remover',       dot: 'bg-emerald-500' },
  { href: '/batch-compress',         label: 'Batch Compress',   dot: 'bg-violet-500' },
  { href: '/image-upscaler',         label: 'Image Upscaler',   dot: 'bg-sky-500' },
  { href: '/image-to-text',          label: 'Image to Text',    dot: 'bg-teal-500' },
  { href: '/image-crop',             label: 'Crop & Resize',    dot: 'bg-orange-500' },
  { href: '/image-resize',           label: 'Image Resize',     dot: 'bg-blue-500' },
  { href: '/image-watermark',        label: 'Watermark',        dot: 'bg-purple-500' },
  { href: '/image-flip-rotate',      label: 'Flip & Rotate',    dot: 'bg-amber-500' },
  { href: '/color-palette',          label: 'Color Palette',    dot: 'bg-pink-400' },
  { href: '/gif-maker',              label: 'GIF Maker',        dot: 'bg-teal-400' },
  { href: '/image-color-picker',    label: 'Color Picker',     dot: 'bg-rose-400' },
  { href: '/favicon-generator',    label: 'Favicon Generator', dot: 'bg-orange-400' },
  { href: '/image-to-base64',      label: 'Image to Base64',  dot: 'bg-indigo-400' },
];

const excelTools = [
  { href: '/excel-to-csv',  label: 'Excel to CSV',  dot: 'bg-green-500' },
  { href: '/csv-to-excel',  label: 'CSV to Excel',  dot: 'bg-blue-400' },
  { href: '/excel-to-json', label: 'Excel to JSON', dot: 'bg-amber-500' },
  { href: '/merge-excel',   label: 'Merge Excel',   dot: 'bg-purple-500' },
  { href: '/json-to-excel', label: 'JSON to Excel', dot: 'bg-orange-400' },
  { href: '/csv-merge',     label: 'CSV Merge',     dot: 'bg-emerald-400' },
  { href: '/csv-diff',      label: 'CSV Diff',      dot: 'bg-red-400' },
];

const textTools = [
  { href: '/case-converter',   label: 'Case Converter',    dot: 'bg-yellow-500' },
  { href: '/word-counter',     label: 'Word Counter',      dot: 'bg-blue-400' },
  { href: '/lorem-ipsum',      label: 'Lorem Ipsum',       dot: 'bg-violet-400' },
  { href: '/text-diff',        label: 'Text Diff',         dot: 'bg-red-400' },
  { href: '/markdown-to-html', label: 'Markdown to HTML',  dot: 'bg-teal-400' },
  { href: '/html-to-markdown',  label: 'HTML to Markdown',  dot: 'bg-indigo-400' },
  { href: '/text-encoder',      label: 'Text Encoder',      dot: 'bg-orange-400' },
  { href: '/number-to-words',   label: 'Number to Words',   dot: 'bg-blue-400' },
  { href: '/url-slug',          label: 'URL Slug',          dot: 'bg-violet-400' },
  { href: '/sort-lines',        label: 'Sort Lines',        dot: 'bg-sky-400' },
  { href: '/remove-duplicates', label: 'Remove Duplicates', dot: 'bg-red-400' },
  { href: '/find-replace-text', label: 'Find & Replace',    dot: 'bg-amber-400' },
  { href: '/fancy-text',        label: 'Fancy Text',        dot: 'bg-purple-400' },
  { href: '/string-escape',     label: 'String Escape',     dot: 'bg-teal-400' },
];

const devTools = [
  { href: '/json-formatter',        label: 'JSON Formatter',    dot: 'bg-amber-400' },
  { href: '/base64',                label: 'Base64',            dot: 'bg-indigo-400' },
  { href: '/hash-generator',        label: 'Hash Generator',    dot: 'bg-red-400' },
  { href: '/url-encoder',           label: 'URL Encoder',       dot: 'bg-sky-400' },
  { href: '/jwt-decoder',           label: 'JWT Decoder',       dot: 'bg-purple-400' },
  { href: '/regex-tester',          label: 'Regex Tester',      dot: 'bg-teal-400' },
  { href: '/uuid-generator',        label: 'UUID Generator',    dot: 'bg-emerald-400' },
  { href: '/color-converter',       label: 'Color Converter',   dot: 'bg-pink-400' },
  { href: '/number-base-converter', label: 'Number Base',       dot: 'bg-violet-400' },
  { href: '/timestamp-converter',   label: 'Timestamp',         dot: 'bg-teal-400' },
  { href: '/password-generator',    label: 'Password Gen',      dot: 'bg-emerald-400' },
  { href: '/json-to-csv',                label: 'JSON to CSV',      dot: 'bg-amber-400' },
  { href: '/cron-parser',               label: 'CRON Parser',      dot: 'bg-emerald-400' },
  { href: '/html-entities',             label: 'HTML Entities',    dot: 'bg-indigo-400' },
  { href: '/markdown-table-generator',  label: 'Markdown Table',   dot: 'bg-orange-400' },
];

const financeTools = [
  { href: '/loan-calculator',    label: 'Loan Calculator',    dot: 'bg-red-400' },
  { href: '/compound-interest',  label: 'Compound Interest',  dot: 'bg-emerald-400' },
  { href: '/tip-calculator',     label: 'Tip Calculator',     dot: 'bg-amber-400' },
  { href: '/discount-calculator',label: 'Discount Calc',      dot: 'bg-purple-400' },
];

const dateTools = [
  { href: '/age-calculator',       label: 'Age Calculator',     dot: 'bg-blue-400' },
  { href: '/date-difference',      label: 'Date Difference',    dot: 'bg-teal-400' },
  { href: '/timezone-converter',   label: 'Timezone Converter', dot: 'bg-indigo-400' },
  { href: '/work-days-calculator', label: 'Work Days',          dot: 'bg-orange-400' },
];

const cssTools = [
  { href: '/gradient-generator',   label: 'Gradient Generator', dot: 'bg-purple-400' },
  { href: '/box-shadow-generator',  label: 'Box Shadow',         dot: 'bg-indigo-400' },
  { href: '/css-formatter',         label: 'CSS Formatter',      dot: 'bg-teal-400' },
];

const calcTools = [
  { href: '/percentage-calculator', label: 'Percentage Calc',  dot: 'bg-amber-400' },
  { href: '/unit-converter',        label: 'Unit Converter',   dot: 'bg-blue-400' },
  { href: '/bmi-calculator',        label: 'BMI Calculator',   dot: 'bg-emerald-400' },
];

const utilityTools = [
  { href: '/qr-generator', label: 'QR Generator', dot: 'bg-yellow-500' },
];

type OpenMenu = 'pdf' | 'word' | 'image' | 'excel' | 'text' | 'dev' | 'finance' | 'date' | 'css' | 'calc' | 'utility' | null;

interface ToolDropdownProps {
  tools: { href: string; label: string; dot: string }[];
  pathname: string;
  accentDot: string;
  accentBadge: string;
  title: string;
}

const ToolDropdown: React.FC<ToolDropdownProps> = ({ tools, pathname, accentDot, accentBadge, title }) => (
  <div className="absolute top-full left-0 mt-2 rounded-2xl border border-white/[0.08] bg-[#0d0d0f]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden min-w-[320px]">
    <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-white/[0.05]">
      <span className={cn('w-2 h-2 rounded-full shrink-0', accentDot)} />
      <span className="text-xs font-semibold text-white/60">{title}</span>
      <span className={cn('ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full', accentBadge)}>
        {tools.length} tools
      </span>
    </div>
    <div className="p-2 grid grid-cols-2 gap-0.5">
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
            pathname === tool.href
              ? 'bg-white/[0.08] text-white'
              : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', tool.dot)} />
          <span className="truncate">{tool.label}</span>
        </Link>
      ))}
    </div>
  </div>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const navItemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navItemsRef.current && !navItemsRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isPdfActive     = pdfTools.some((t) => t.href === pathname);
  const isWordActive    = wordTools.some((t) => t.href === pathname);
  const isImageActive   = imageTools.some((t) => t.href === pathname);
  const isExcelActive   = excelTools.some((t) => t.href === pathname);
  const isTextActive    = textTools.some((t) => t.href === pathname);
  const isDevActive     = devTools.some((t) => t.href === pathname);
  const isFinanceActive = financeTools.some((t) => t.href === pathname);
  const isDateActive    = dateTools.some((t) => t.href === pathname);
  const isCssActive     = cssTools.some((t) => t.href === pathname);
  const isCalcActive    = calcTools.some((t) => t.href === pathname);
  const isUtilityActive = utilityTools.some((t) => t.href === pathname);

  const toggle = (menu: NonNullable<OpenMenu>) =>
    setOpenMenu((prev) => (prev === menu ? null : menu));

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
          <div className="hidden lg:flex items-center gap-0.5" ref={navItemsRef}>
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

            {/* PDF Tools */}
            <div className="relative">
              <button onClick={() => toggle('pdf')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isPdfActive || openMenu === 'pdf' ? 'bg-indigo-500/10 text-indigo-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                PDF
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'pdf' && 'rotate-180')} />
              </button>
              {openMenu === 'pdf' && <ToolDropdown tools={pdfTools} pathname={pathname} accentDot="bg-indigo-500" accentBadge="bg-indigo-500/10 text-indigo-400" title="PDF Tools" />}
            </div>

            {/* Word Tools */}
            <div className="relative">
              <button onClick={() => toggle('word')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isWordActive || openMenu === 'word' ? 'bg-blue-500/10 text-blue-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                Word
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'word' && 'rotate-180')} />
              </button>
              {openMenu === 'word' && <ToolDropdown tools={wordTools} pathname={pathname} accentDot="bg-blue-400" accentBadge="bg-blue-500/10 text-blue-400" title="Word / DOCX Tools" />}
            </div>

            {/* Image Tools */}
            <div className="relative">
              <button onClick={() => toggle('image')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isImageActive || openMenu === 'image' ? 'bg-pink-500/10 text-pink-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                Image
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'image' && 'rotate-180')} />
              </button>
              {openMenu === 'image' && <ToolDropdown tools={imageTools} pathname={pathname} accentDot="bg-pink-500" accentBadge="bg-pink-500/10 text-pink-400" title="Image Tools" />}
            </div>

            {/* Excel Tools */}
            <div className="relative">
              <button onClick={() => toggle('excel')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isExcelActive || openMenu === 'excel' ? 'bg-green-500/10 text-green-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                Excel
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'excel' && 'rotate-180')} />
              </button>
              {openMenu === 'excel' && <ToolDropdown tools={excelTools} pathname={pathname} accentDot="bg-green-500" accentBadge="bg-green-500/10 text-green-400" title="Excel / CSV Tools" />}
            </div>

            {/* Text Tools */}
            <div className="relative">
              <button onClick={() => toggle('text')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isTextActive || openMenu === 'text' ? 'bg-yellow-500/10 text-yellow-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                Text
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'text' && 'rotate-180')} />
              </button>
              {openMenu === 'text' && <ToolDropdown tools={textTools} pathname={pathname} accentDot="bg-yellow-500" accentBadge="bg-yellow-500/10 text-yellow-400" title="Text Tools" />}
            </div>

            {/* Dev Tools */}
            <div className="relative">
              <button onClick={() => toggle('dev')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isDevActive || openMenu === 'dev' ? 'bg-violet-500/10 text-violet-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                Dev
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'dev' && 'rotate-180')} />
              </button>
              {openMenu === 'dev' && <ToolDropdown tools={devTools} pathname={pathname} accentDot="bg-violet-500" accentBadge="bg-violet-500/10 text-violet-400" title="Developer Utilities" />}
            </div>

            {/* Finance */}
            <div className="relative">
              <button onClick={() => toggle('finance')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isFinanceActive || openMenu === 'finance' ? 'bg-red-500/10 text-red-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                Finance
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'finance' && 'rotate-180')} />
              </button>
              {openMenu === 'finance' && <ToolDropdown tools={financeTools} pathname={pathname} accentDot="bg-red-500" accentBadge="bg-red-500/10 text-red-400" title="Finance" />}
            </div>

            {/* Date & Time */}
            <div className="relative">
              <button onClick={() => toggle('date')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isDateActive || openMenu === 'date' ? 'bg-sky-500/10 text-sky-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                Date
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'date' && 'rotate-180')} />
              </button>
              {openMenu === 'date' && <ToolDropdown tools={dateTools} pathname={pathname} accentDot="bg-sky-500" accentBadge="bg-sky-500/10 text-sky-400" title="Date & Time" />}
            </div>

            {/* CSS Tools */}
            <div className="relative">
              <button onClick={() => toggle('css')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isCssActive || openMenu === 'css' ? 'bg-purple-500/10 text-purple-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                CSS
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'css' && 'rotate-180')} />
              </button>
              {openMenu === 'css' && <ToolDropdown tools={cssTools} pathname={pathname} accentDot="bg-purple-500" accentBadge="bg-purple-500/10 text-purple-400" title="CSS Tools" />}
            </div>

            {/* Calculators */}
            <div className="relative">
              <button onClick={() => toggle('calc')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isCalcActive || openMenu === 'calc' ? 'bg-emerald-500/10 text-emerald-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Calc
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'calc' && 'rotate-180')} />
              </button>
              {openMenu === 'calc' && <ToolDropdown tools={calcTools} pathname={pathname} accentDot="bg-emerald-500" accentBadge="bg-emerald-500/10 text-emerald-400" title="Calculators" />}
            </div>

            {/* More Tools */}
            <div className="relative">
              <button onClick={() => toggle('utility')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all', isUtilityActive || openMenu === 'utility' ? 'bg-amber-500/10 text-amber-300' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]')}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                More
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'utility' && 'rotate-180')} />
              </button>
              {openMenu === 'utility' && <ToolDropdown tools={utilityTools} pathname={pathname} accentDot="bg-amber-500" accentBadge="bg-amber-500/10 text-amber-400" title="More Tools" />}
            </div>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#050506]/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            <Link href="/" className={cn('px-4 py-2.5 rounded-lg text-sm transition-all', pathname === '/' ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.05]')}>Home</Link>

            {[
              { label: 'PDF Tools', tools: pdfTools, dot: 'bg-indigo-500', count: pdfTools.length },
              { label: 'Word / DOCX Tools', tools: wordTools, dot: 'bg-blue-400', count: wordTools.length },
              { label: 'Image Tools', tools: imageTools, dot: 'bg-pink-500', count: imageTools.length },
              { label: 'Excel / CSV Tools', tools: excelTools, dot: 'bg-green-500', count: excelTools.length },
              { label: 'Text Tools', tools: textTools, dot: 'bg-yellow-500', count: textTools.length },
              { label: 'Developer Utilities', tools: devTools, dot: 'bg-violet-500', count: devTools.length },
              { label: 'Finance', tools: financeTools, dot: 'bg-red-500', count: financeTools.length },
              { label: 'Date & Time', tools: dateTools, dot: 'bg-sky-500', count: dateTools.length },
              { label: 'CSS Tools', tools: cssTools, dot: 'bg-purple-500', count: cssTools.length },
              { label: 'Calculators', tools: calcTools, dot: 'bg-emerald-500', count: calcTools.length },
              { label: 'More Tools', tools: utilityTools, dot: 'bg-amber-500', count: utilityTools.length },
            ].map(({ label, tools, dot, count }) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 px-4 py-2 mt-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{label}</span>
                  <span className="text-[10px] text-white/20 ml-1">· {count}</span>
                </div>
                {tools.map((tool) => (
                  <Link key={tool.href} href={tool.href} className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-all', pathname === tool.href ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.05]')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', tool.dot)} />
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
