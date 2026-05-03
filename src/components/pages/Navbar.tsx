"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, FileText, ChevronDown,
  LayoutDashboard, BadgeDollarSign, Search,
  // PDF
  FileImage, FileDown, Files, Scissors, RotateCw, Stamp, Hash, PanelTop,
  Crop, Minimize2, Layers, Tag, Lock, LockOpen, PenLine, ArrowUpDown, Trash2,
  // Word
  Code, FileOutput, ImageIcon, FileCode, BarChart3, FilePlus, Replace,
  // Image
  Repeat2, Wand2, SlidersHorizontal, ZoomIn, ScanText, Scaling,
  FlipHorizontal2, Palette, Film, Pipette, Square,
  // Mega menu category icons
  Table2, AlignLeft, Terminal, Landmark, Calendar, Paintbrush,
  // Additional
  Grid3X3, Fingerprint, Calculator, Sparkles, Globe as Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavTool { href: string; label: string; icon: React.ReactNode; badge?: string; }
interface NavSection { heading: string; tools: NavTool[]; }
interface MegaSection {
  label: string;
  icon: React.ReactNode;
  iconGrad: string;
  count: number;
  tools: NavTool[];
}

// ─── PDF Tools ────────────────────────────────────────────────────────────────

const pdfSections: NavSection[] = [
  {
    heading: 'Convert',
    tools: [
      { href: '/image-to-pdf',         label: 'Image to PDF',       icon: <FileImage className="h-4 w-4" />, badge: 'Popular' },
      { href: '/pdf-to-image',         label: 'PDF to Image',       icon: <FileDown  className="h-4 w-4" /> },
      { href: '/extract-text',         label: 'Extract Text',       icon: <FileText  className="h-4 w-4" /> },
      { href: '/chat-with-pdf',        label: 'Chat with PDF',      icon: <Sparkles  className="h-4 w-4" />, badge: 'AI' },
      { href: '/document-translator',  label: 'Doc Translator',     icon: <Globe2    className="h-4 w-4" />, badge: 'Free' },
    ],
  },
  {
    heading: 'Organise',
    tools: [
      { href: '/merge-pdf',     label: 'Merge PDF',       icon: <Files        className="h-4 w-4" /> },
      { href: '/pdf-split',     label: 'Split PDF',       icon: <Scissors     className="h-4 w-4" /> },
      { href: '/reorder-pages', label: 'Reorder Pages',   icon: <ArrowUpDown  className="h-4 w-4" /> },
      { href: '/remove-pages',  label: 'Remove Pages',    icon: <Trash2       className="h-4 w-4" /> },
    ],
  },
  {
    heading: 'Edit',
    tools: [
      { href: '/rotate-pdf',    label: 'Rotate PDF',      icon: <RotateCw  className="h-4 w-4" /> },
      { href: '/watermark-pdf', label: 'Watermark PDF',   icon: <Stamp     className="h-4 w-4" /> },
      { href: '/page-numbers',  label: 'Page Numbers',    icon: <Hash      className="h-4 w-4" /> },
      { href: '/header-footer', label: 'Header / Footer', icon: <PanelTop  className="h-4 w-4" /> },
      { href: '/crop-pages',    label: 'Crop Pages',      icon: <Crop      className="h-4 w-4" /> },
      { href: '/compress-pdf',  label: 'Compress PDF',    icon: <Minimize2 className="h-4 w-4" /> },
      { href: '/flatten-pdf',   label: 'Flatten Forms',   icon: <Layers    className="h-4 w-4" /> },
      { href: '/edit-metadata', label: 'Edit Metadata',   icon: <Tag       className="h-4 w-4" /> },
    ],
  },
  {
    heading: 'Protect',
    tools: [
      { href: '/pdf-protect', label: 'PDF Protect', icon: <Lock     className="h-4 w-4" /> },
      { href: '/pdf-unlock',  label: 'PDF Unlock',  icon: <LockOpen className="h-4 w-4" /> },
      { href: '/pdf-sign',    label: 'PDF Sign',    icon: <PenLine  className="h-4 w-4" /> },
    ],
  },
];

// ─── Word Tools ───────────────────────────────────────────────────────────────

const wordTools: NavTool[] = [
  { href: '/docx-to-text',        label: 'DOCX to Text',     icon: <FileText    className="h-4 w-4" /> },
  { href: '/docx-to-html',        label: 'DOCX to HTML',     icon: <Code        className="h-4 w-4" /> },
  { href: '/docx-to-pdf',         label: 'DOCX to PDF',      icon: <FileOutput  className="h-4 w-4" /> },
  { href: '/pdf-to-docx',         label: 'PDF to DOCX',      icon: <FileDown    className="h-4 w-4" /> },
  { href: '/merge-docx',          label: 'Merge DOCX',       icon: <Files       className="h-4 w-4" /> },
  { href: '/docx-find-replace',   label: 'Find & Replace',   icon: <Replace     className="h-4 w-4" /> },
  { href: '/docx-metadata',       label: 'DOCX Metadata',    icon: <Tag         className="h-4 w-4" /> },
  { href: '/docx-extract-images', label: 'Extract Images',   icon: <ImageIcon   className="h-4 w-4" /> },
  { href: '/docx-to-markdown',    label: 'DOCX to Markdown', icon: <FileCode    className="h-4 w-4" /> },
  { href: '/docx-word-count',     label: 'Word Count',       icon: <BarChart3   className="h-4 w-4" /> },
  { href: '/txt-to-docx',         label: 'TXT to DOCX',      icon: <FilePlus    className="h-4 w-4" /> },
];

// ─── Image Tools ──────────────────────────────────────────────────────────────

const imageTools: NavTool[] = [
  { href: '/image-format-converter', label: 'Format Converter',  icon: <Repeat2          className="h-4 w-4" /> },
  { href: '/background-remover',     label: 'BG Remover',        icon: <Wand2            className="h-4 w-4" />, badge: 'AI' },
  { href: '/batch-compress',         label: 'Batch Compress',    icon: <SlidersHorizontal className="h-4 w-4" /> },
  { href: '/image-upscaler',         label: 'Image Upscaler',    icon: <ZoomIn           className="h-4 w-4" /> },
  { href: '/image-to-text',          label: 'Image to Text',     icon: <ScanText         className="h-4 w-4" />, badge: 'AI' },
  { href: '/image-crop',             label: 'Crop & Resize',     icon: <Crop             className="h-4 w-4" /> },
  { href: '/image-resize',           label: 'Image Resize',      icon: <Scaling          className="h-4 w-4" /> },
  { href: '/image-watermark',        label: 'Watermark',         icon: <Stamp            className="h-4 w-4" /> },
  { href: '/image-flip-rotate',      label: 'Flip & Rotate',     icon: <FlipHorizontal2  className="h-4 w-4" /> },
  { href: '/color-palette',          label: 'Color Palette',     icon: <Palette          className="h-4 w-4" /> },
  { href: '/gif-maker',              label: 'GIF Maker',         icon: <Film             className="h-4 w-4" /> },
  { href: '/image-color-picker',     label: 'Color Picker',      icon: <Pipette          className="h-4 w-4" /> },
  { href: '/favicon-generator',      label: 'Favicon Generator', icon: <Square           className="h-4 w-4" /> },
  { href: '/image-to-base64',        label: 'Image to Base64',   icon: <FileCode         className="h-4 w-4" /> },
  { href: '/ocr-scanner',            label: 'OCR Scanner',       icon: <ScanText         className="h-4 w-4" />, badge: 'Free' },
];

// ─── All Tools Categories ─────────────────────────────────────────────────────

const allToolSections: MegaSection[] = [
  {
    label: 'PDF',
    icon: <FileText className="h-4 w-4" />,
    iconGrad: 'from-indigo-500 to-violet-600',
    count: pdfSections.reduce((sum, s) => sum + s.tools.length, 0), // auto-computed
    tools: pdfSections.flatMap((s) => s.tools),
  },
  {
    label: 'Word',
    icon: <FileOutput className="h-4 w-4" />,
    iconGrad: 'from-blue-500 to-cyan-600',
    count: wordTools.length,
    tools: wordTools,
  },
  {
    label: 'Image',
    icon: <ImageIcon className="h-4 w-4" />,
    iconGrad: 'from-pink-500 to-rose-600',
    count: imageTools.length,
    tools: imageTools,
  },
  {
    label: 'Excel / CSV',
    icon: <Table2 className="h-4 w-4" />,
    iconGrad: 'from-green-500 to-emerald-600',
    count: 7,
    tools: [
      { href: '/excel-to-csv',  label: 'Excel to CSV',  icon: <Table2   className="h-4 w-4" /> },
      { href: '/csv-to-excel',  label: 'CSV to Excel',  icon: <Table2   className="h-4 w-4" /> },
      { href: '/excel-to-json', label: 'Excel to JSON', icon: <Code     className="h-4 w-4" /> },
      { href: '/json-to-excel', label: 'JSON to Excel', icon: <FileCode className="h-4 w-4" /> },
      { href: '/merge-excel',   label: 'Merge Excel',   icon: <Files    className="h-4 w-4" /> },
      { href: '/csv-merge',     label: 'CSV Merge',     icon: <FilePlus className="h-4 w-4" /> },
      { href: '/csv-diff',      label: 'CSV Diff',      icon: <SlidersHorizontal className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Text',
    icon: <AlignLeft className="h-4 w-4" />,
    iconGrad: 'from-yellow-500 to-amber-600',
    count: 14,
    tools: [
      { href: '/case-converter',    label: 'Case Converter',    icon: <AlignLeft       className="h-4 w-4" /> },
      { href: '/word-counter',      label: 'Word Counter',      icon: <BarChart3       className="h-4 w-4" /> },
      { href: '/lorem-ipsum',       label: 'Lorem Ipsum',       icon: <FileText        className="h-4 w-4" /> },
      { href: '/find-replace-text', label: 'Find & Replace',    icon: <Replace         className="h-4 w-4" /> },
      { href: '/sort-lines',        label: 'Sort Lines',        icon: <ArrowUpDown     className="h-4 w-4" /> },
      { href: '/remove-duplicates', label: 'Remove Duplicates', icon: <Trash2          className="h-4 w-4" /> },
      { href: '/text-diff',         label: 'Text Diff',         icon: <SlidersHorizontal className="h-4 w-4" /> },
      { href: '/markdown-to-html',  label: 'Markdown to HTML',  icon: <Code            className="h-4 w-4" /> },
      { href: '/html-to-markdown',  label: 'HTML to Markdown',  icon: <FileCode        className="h-4 w-4" /> },
      { href: '/url-slug',          label: 'URL Slug',          icon: <Hash            className="h-4 w-4" /> },
      { href: '/string-escape',     label: 'String Escape',     icon: <Terminal        className="h-4 w-4" /> },
      { href: '/fancy-text',        label: 'Fancy Text',        icon: <Stamp           className="h-4 w-4" /> },
      { href: '/number-to-words',   label: 'Number to Words',   icon: <Hash            className="h-4 w-4" /> },
      { href: '/text-encoder',      label: 'Text Encoder',      icon: <Repeat2         className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Developer',
    icon: <Terminal className="h-4 w-4" />,
    iconGrad: 'from-violet-500 to-purple-600',
    count: 15,
    tools: [
      { href: '/json-formatter',           label: 'JSON Formatter',    icon: <Code        className="h-4 w-4" /> },
      { href: '/base64',                   label: 'Base64',            icon: <FileCode    className="h-4 w-4" /> },
      { href: '/hash-generator',           label: 'Hash Generator',    icon: <Lock        className="h-4 w-4" /> },
      { href: '/jwt-decoder',              label: 'JWT Decoder',       icon: <Terminal    className="h-4 w-4" /> },
      { href: '/url-encoder',              label: 'URL Encoder',       icon: <FileText    className="h-4 w-4" /> },
      { href: '/html-entities',            label: 'HTML Entities',     icon: <Code        className="h-4 w-4" /> },
      { href: '/regex-tester',             label: 'Regex Tester',      icon: <ScanText    className="h-4 w-4" /> },
      { href: '/uuid-generator',           label: 'UUID Generator',    icon: <Fingerprint className="h-4 w-4" /> },
      { href: '/color-converter',          label: 'Color Converter',   icon: <Pipette     className="h-4 w-4" /> },
      { href: '/number-base-converter',    label: 'Number Base',       icon: <Repeat2     className="h-4 w-4" /> },
      { href: '/timestamp-converter',      label: 'Timestamp',         icon: <Calendar    className="h-4 w-4" /> },
      { href: '/password-generator',       label: 'Password Gen',      icon: <LockOpen    className="h-4 w-4" /> },
      { href: '/json-to-csv',              label: 'JSON to CSV',       icon: <Table2      className="h-4 w-4" /> },
      { href: '/cron-parser',              label: 'CRON Parser',       icon: <Hash        className="h-4 w-4" /> },
      { href: '/markdown-table-generator', label: 'Markdown Table',    icon: <Table2      className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Finance',
    icon: <Landmark className="h-4 w-4" />,
    iconGrad: 'from-red-500 to-rose-600',
    count: 4,
    tools: [
      { href: '/loan-calculator',     label: 'Loan Calculator',    icon: <Landmark  className="h-4 w-4" /> },
      { href: '/compound-interest',   label: 'Compound Interest',  icon: <BarChart3 className="h-4 w-4" /> },
      { href: '/tip-calculator',      label: 'Tip Calculator',     icon: <Hash      className="h-4 w-4" /> },
      { href: '/discount-calculator', label: 'Discount Calculator',icon: <Tag       className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Date & Time',
    icon: <Calendar className="h-4 w-4" />,
    iconGrad: 'from-sky-500 to-cyan-600',
    count: 4,
    tools: [
      { href: '/age-calculator',       label: 'Age Calculator',      icon: <Calendar    className="h-4 w-4" /> },
      { href: '/date-difference',      label: 'Date Difference',     icon: <ArrowUpDown className="h-4 w-4" /> },
      { href: '/timezone-converter',   label: 'Timezone Converter',  icon: <RotateCw    className="h-4 w-4" /> },
      { href: '/work-days-calculator', label: 'Work Days',           icon: <Calendar    className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Calculators',
    icon: <Calculator className="h-4 w-4" />,
    iconGrad: 'from-emerald-500 to-teal-600',
    count: 4,
    tools: [
      { href: '/percentage-calculator', label: 'Percentage Calc', icon: <Hash        className="h-4 w-4" /> },
      { href: '/unit-converter',        label: 'Unit Converter',  icon: <Scaling     className="h-4 w-4" /> },
      { href: '/bmi-calculator',        label: 'BMI Calculator',  icon: <BarChart3   className="h-4 w-4" /> },
      { href: '/qr-generator',          label: 'QR Generator',    icon: <Grid3X3     className="h-4 w-4" /> },
    ],
  },
  {
    label: 'CSS & Design',
    icon: <Paintbrush className="h-4 w-4" />,
    iconGrad: 'from-fuchsia-500 to-pink-600',
    count: 3,
    tools: [
      { href: '/gradient-generator',   label: 'Gradient Generator', icon: <Paintbrush className="h-4 w-4" /> },
      { href: '/box-shadow-generator', label: 'Box Shadow',         icon: <Square     className="h-4 w-4" /> },
      { href: '/css-formatter',        label: 'CSS Formatter',      icon: <Code       className="h-4 w-4" /> },
    ],
  },
];

// ─── Utilities (Finance + Date + Calculators + CSS) ──────────────────────────

const utilitySections: NavSection[] = [
  {
    heading: 'Finance',
    tools: [
      { href: '/loan-calculator',     label: 'Loan Calculator',    icon: <Landmark  className="h-4 w-4" /> },
      { href: '/compound-interest',   label: 'Compound Interest',  icon: <BarChart3 className="h-4 w-4" /> },
      { href: '/tip-calculator',      label: 'Tip Calculator',     icon: <Hash      className="h-4 w-4" /> },
      { href: '/discount-calculator', label: 'Discount Calc',      icon: <Tag       className="h-4 w-4" /> },
    ],
  },
  {
    heading: 'Date & Time',
    tools: [
      { href: '/age-calculator',       label: 'Age Calculator',     icon: <Calendar    className="h-4 w-4" /> },
      { href: '/date-difference',      label: 'Date Difference',    icon: <ArrowUpDown className="h-4 w-4" /> },
      { href: '/timezone-converter',   label: 'Timezone Converter', icon: <RotateCw    className="h-4 w-4" /> },
      { href: '/work-days-calculator', label: 'Work Days',          icon: <Calendar    className="h-4 w-4" /> },
    ],
  },
  {
    heading: 'Calculators',
    tools: [
      { href: '/percentage-calculator', label: 'Percentage Calc', icon: <Hash      className="h-4 w-4" /> },
      { href: '/unit-converter',        label: 'Unit Converter',  icon: <Scaling   className="h-4 w-4" /> },
      { href: '/bmi-calculator',        label: 'BMI Calculator',  icon: <BarChart3 className="h-4 w-4" /> },
      { href: '/qr-generator',          label: 'QR Generator',    icon: <Grid3X3   className="h-4 w-4" /> },
    ],
  },
  {
    heading: 'CSS & Design',
    tools: [
      { href: '/gradient-generator',   label: 'Gradient Generator', icon: <Paintbrush className="h-4 w-4" /> },
      { href: '/box-shadow-generator', label: 'Box Shadow',         icon: <Square     className="h-4 w-4" /> },
      { href: '/css-formatter',        label: 'CSS Formatter',      icon: <Code       className="h-4 w-4" /> },
    ],
  },
];

// ─── Compute all paths for active state ───────────────────────────────────────

const getAllToolPaths = () => allToolSections.flatMap((s) => s.tools.map((t) => t.href));
const allToolPaths = getAllToolPaths();

// ─── Tool Link Component ──────────────────────────────────────────────────────

const ToolLink: React.FC<{ tool: NavTool; pathname: string; compact?: boolean }> = ({ tool, pathname, compact }) => (
  <Link
    href={tool.href}
    className={cn(
      'group flex items-center gap-3 rounded-xl transition-all duration-150',
      compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
      pathname === tool.href
        ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/20'
        : 'hover:bg-white/[0.06] text-white/60 hover:text-white'
    )}
  >
    <div className={cn(
      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
      pathname === tool.href
        ? 'bg-indigo-500/20 text-indigo-400'
        : 'bg-white/[0.05] text-white/35 group-hover:bg-white/[0.08] group-hover:text-white/60'
    )}>
      {tool.icon}
    </div>
    <span className={cn(
      'transition-colors truncate',
      compact ? 'text-xs' : 'text-sm',
      pathname === tool.href ? 'font-medium' : ''
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

// ─── Category Dropdown ────────────────────────────────────────────────────────

interface CategoryDropdownProps {
  label: string;
  icon: React.ReactNode;
  sections?: NavSection[];
  tools?: NavTool[];
  pathname: string;
  isOpen: boolean;
  isActive: boolean;
  onToggle: () => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  label, icon, sections, tools, pathname, isOpen, isActive, onToggle,
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className={cn(
        'relative flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-semibold transition-all duration-150 whitespace-nowrap',
        isOpen || isActive
          ? 'bg-white/[0.10] text-white shadow-sm shadow-black/20 ring-1 ring-white/[0.08]'
          : 'text-white/58 hover:bg-white/[0.065] hover:text-white'
      )}
    >
      <span className={cn(
        'text-white/38 transition-colors',
        (isOpen || isActive) && 'text-indigo-300'
      )}>
        {icon}
      </span>
      {label}
      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200 shrink-0 opacity-50', isOpen && 'rotate-180 opacity-90')} />
      {(isOpen || isActive) && (
        <span className="absolute inset-x-4 -bottom-[5px] h-px rounded-full bg-gradient-to-r from-indigo-400/0 via-indigo-400 to-indigo-400/0" />
      )}
    </button>

    {isOpen && (
      <div className="absolute top-full left-0 mt-2 rounded-2xl border border-white/[0.08] bg-[#0a0a0d]/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden min-w-[520px] z-50">
        <div className="p-3 max-h-[70vh] overflow-y-auto overscroll-contain">
          {sections ? (
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.heading}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 px-2.5 mb-1.5">
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
          ) : tools ? (
            <div className="grid grid-cols-2 gap-0.5">
              {tools.map((tool) => (
                <ToolLink key={tool.href} tool={tool} pathname={pathname} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    )}
  </div>
);

// ─── All Tools Mega Menu ──────────────────────────────────────────────────────

const AllToolsMegaMenu: React.FC<{ pathname: string }> = ({ pathname }) => {
  const [activeCategory, setActiveCategory] = useState(() => {
    const found = allToolSections.find((s) => s.tools.some((t) => t.href === pathname));
    return found?.label ?? allToolSections[0].label;
  });

  const activeSection = allToolSections.find((s) => s.label === activeCategory) ?? allToolSections[0];
  const totalTools = allToolSections.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="absolute top-full right-0 mt-2 rounded-2xl border border-white/[0.08] bg-[#0a0a0d]/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden w-[820px] z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white/80">All Tools</span>
          <span className="text-[11px] text-white/30">{allToolSections.length} categories</span>
        </div>
        <span className="text-[11px] text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full font-semibold">
          {totalTools} tools
        </span>
      </div>

      <div className="flex h-[440px]">
        {/* Left sidebar — category list */}
        <div className="w-[196px] shrink-0 border-r border-white/[0.06] overflow-y-auto overscroll-contain py-2 px-2 space-y-0.5">
          {allToolSections.map((section) => {
            const isActive = activeCategory === section.label;
            const hasActiveTool = section.tools.some((t) => t.href === pathname);
            return (
              <button
                key={section.label}
                onClick={() => setActiveCategory(section.label)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 text-left',
                  isActive
                    ? 'bg-indigo-500/15 ring-1 ring-indigo-500/20'
                    : 'hover:bg-white/[0.05]'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0',
                  section.iconGrad
                )}>
                  {section.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'text-xs font-medium truncate',
                    isActive ? 'text-indigo-300' : 'text-white/65'
                  )}>{section.label}</p>
                  <p className="text-[10px] text-white/25">{section.count} tools</p>
                </div>
                {hasActiveTool && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right pane — tool grid */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/[0.05]">
            <div className={cn(
              'w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0',
              activeSection.iconGrad
            )}>
              {activeSection.icon}
            </div>
            <span className="text-sm font-semibold text-white/80">{activeSection.label}</span>
            <span className="text-[11px] text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">
              {activeSection.count} tools
            </span>
          </div>

          <div className="grid grid-cols-2 gap-0.5">
            {activeSection.tools.map((tool) => (
              <ToolLink key={tool.href} tool={tool} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Mobile Menu Section ──────────────────────────────────────────────────────

const MobileSection: React.FC<{
  label: string;
  dotColor: string;
  sections?: NavSection[];
  tools?: NavTool[];
  pathname: string;
}> = ({ label, dotColor, sections, tools, pathname }) => {
  const [isOpen, setIsOpen] = useState(false);
  const allItems = sections ? sections.flatMap((s) => s.tools) : tools ?? [];
  const activeCount = allItems.filter((t) => t.href === pathname).length;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border border-white/[0.045] bg-white/[0.018] hover:bg-white/[0.045] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full', dotColor)} />
          <span className="text-sm font-medium text-white/70">{label}</span>
          {activeCount > 0 && (
            <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 text-white/30 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="px-4 pb-2 space-y-1">
          {sections ? (
            sections.map((section) => (
              <div key={section.heading} className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 px-2 mb-1">
                  {section.heading}
                </p>
                <div className="space-y-0.5">
                  {section.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                        pathname === tool.href
                          ? 'bg-indigo-500/15 text-indigo-300'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                      )}
                    >
                      <span className="w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center text-white/35 shrink-0">
                        {tool.icon}
                      </span>
                      {tool.label}
                      {tool.badge && (
                        <span className={cn(
                          'ml-auto text-[9px] font-bold px-1.5 py-px rounded-full',
                          tool.badge === 'AI' ? 'bg-violet-500/20 text-violet-400' : 'bg-indigo-500/15 text-indigo-400'
                        )}>
                          {tool.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : tools ? (
            <div className="space-y-0.5">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                    pathname === tool.href
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  <span className="w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center text-white/35 shrink-0">
                    {tool.icon}
                  </span>
                  {tool.label}
                  {tool.badge && (
                    <span className={cn(
                      'ml-auto text-[9px] font-bold px-1.5 py-px rounded-full',
                      tool.badge === 'AI' ? 'bg-violet-500/20 text-violet-400' : 'bg-indigo-500/15 text-indigo-400'
                    )}>
                      {tool.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const { isSignedIn } = useUser();
  const { onOpen } = useUpgradeModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); setOpenDropdown(null); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (openDropdown !== null) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [openDropdown]);

  const isAllActive = allToolPaths.includes(pathname);
  const isPdfActive = pdfSections.some((section) => section.tools.some((tool) => tool.href === pathname));
  const isWordActive = wordTools.some((tool) => tool.href === pathname);
  const isImageActive = imageTools.some((tool) => tool.href === pathname);
  const isUtilitiesActive = utilitySections.some((section) => section.tools.some((tool) => tool.href === pathname));
  const totalTools = allToolSections.reduce((sum, section) => sum + section.count, 0);

  const toggleDropdown = (menu: string) =>
    setOpenDropdown((p) => (p === menu ? null : menu));

  const openUpgradeFromMobileMenu = () => {
    setIsMenuOpen(false);
    window.setTimeout(onOpen, 120);
  };

  return (
    <nav className={cn(
      'sticky top-0 z-50 border-b transition-all duration-300',
      isScrolled
        ? 'border-white/[0.08] bg-[#050507]/92 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.32)]'
        : 'border-white/[0.06] bg-[#050507]/88 backdrop-blur-xl'
    )}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center h-16 gap-5" ref={navRef}>

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0 rounded-2xl py-1 pr-2 transition-colors hover:bg-white/[0.035]">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_12px_30px_rgba(99,102,241,0.30)] ring-1 ring-white/15">
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <FileText className="relative h-[18px] w-[18px] text-white" />
            </div>
            <div className="leading-none">
              <span className="block text-lg font-bold bg-gradient-to-r from-white to-white/76 bg-clip-text text-transparent">
                DocSewa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-1 gap-3 xl:gap-4">
            {/* Primary categories */}
            <div className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.035] p-1 shadow-inner shadow-white/[0.02]">
              <CategoryDropdown
                label="PDF"
                icon={<FileText className="h-3.5 w-3.5" />}
                sections={pdfSections}
                pathname={pathname}
                isOpen={openDropdown === 'pdf'}
                isActive={isPdfActive}
                onToggle={() => toggleDropdown('pdf')}
              />
              <CategoryDropdown
                label="Word"
                icon={<FileOutput className="h-3.5 w-3.5" />}
                tools={wordTools}
                pathname={pathname}
                isOpen={openDropdown === 'word'}
                isActive={isWordActive}
                onToggle={() => toggleDropdown('word')}
              />
              <CategoryDropdown
                label="Image"
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                tools={imageTools}
                pathname={pathname}
                isOpen={openDropdown === 'image'}
                isActive={isImageActive}
                onToggle={() => toggleDropdown('image')}
              />
              <CategoryDropdown
                label="Utilities"
                icon={<Calculator className="h-3.5 w-3.5" />}
                sections={utilitySections}
                pathname={pathname}
                isOpen={openDropdown === 'utilities'}
                isActive={isUtilitiesActive}
                onToggle={() => toggleDropdown('utilities')}
              />
            </div>

            {/* Right cluster: Pricing/Dashboard + CTA + Auth */}
            <div className="relative hidden w-[230px] 2xl:w-[280px] shrink-0 xl:block">
              <button
                onClick={() => toggleDropdown('all')}
                className={cn(
                  'group flex h-11 w-full items-center gap-3 rounded-full border px-3.5 text-[13px] font-semibold transition-all',
                  isAllActive || openDropdown === 'all'
                    ? 'border-indigo-400/25 bg-indigo-500/10 text-white shadow-sm shadow-indigo-950/30'
                    : 'border-white/[0.08] bg-white/[0.035] text-white/58 hover:border-white/[0.14] hover:bg-white/[0.055] hover:text-white'
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Search className="h-4 w-4 shrink-0 text-white/38 group-hover:text-white/55" />
                  <span className="shrink-0 text-white/82">All tools</span>
                </span>
                <span className="ml-auto shrink-0 rounded-full border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white/36">
                  {totalTools}
                </span>
              </button>
              {openDropdown === 'all' && <AllToolsMegaMenu pathname={pathname} />}
            </div>

            <div className={cn(
              'flex items-center rounded-full border border-white/[0.07] bg-white/[0.03] p-1',
              isSignedIn ? 'ml-auto gap-2' : 'ml-auto gap-1.5'
            )}>
              <Link
                href="/pricing"
                className={cn(
                  'hidden xl:inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-all duration-150 whitespace-nowrap',
                  pathname === '/pricing'
                    ? 'bg-white/[0.10] text-white ring-1 ring-white/[0.08]'
                    : 'text-white/58 hover:bg-white/[0.065] hover:text-white'
                )}
              >
                <BadgeDollarSign className="h-3.5 w-3.5 text-white/45" />
                Pricing
              </Link>
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    'hidden xl:inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-all duration-150 whitespace-nowrap',
                    pathname === '/dashboard'
                      ? 'bg-white/[0.10] text-white ring-1 ring-white/[0.08]'
                      : 'text-white/58 hover:bg-white/[0.065] hover:text-white'
                  )}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-white/45" />
                  Dashboard
                </Link>
              ) : null}

              {isSignedIn && (
                <div className="hidden xl:block w-px h-5 bg-white/[0.08] mx-0.5" />
              )}

              {/* Go Pro CTA */}
              <button
                onClick={onOpen}
                className="group relative h-10 px-4 rounded-full text-[13px] font-bold text-white whitespace-nowrap overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-[0_12px_26px_rgba(124,58,237,0.30)] ring-1 ring-white/15 transition-all hover:-translate-y-px hover:shadow-[0_0_28px_rgba(139,92,246,0.45)] flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Go Pro
              </button>

              {/* Auth */}
              <div className={cn('flex h-10 items-center', isSignedIn ? 'ml-0.5' : 'ml-1')}>
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <button className="h-9 rounded-full border border-white/[0.13] bg-white/[0.055] px-4 text-[13px] font-semibold text-white/82 hover:border-white/[0.22] hover:bg-white/[0.09] hover:text-white transition-all whitespace-nowrap">
                      Sign in
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden ml-auto h-10 w-10 rounded-full border border-white/[0.09] bg-white/[0.045] text-white/65 shadow-inner shadow-white/[0.02] hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute left-3 right-3 top-full mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#08080b]/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <div className="px-3 py-3 space-y-1">
            <div className="px-2 pb-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Menu</p>
                  <p className="text-xs text-white/35">{totalTools} tools available</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-white/50 hover:bg-white/[0.08] hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={openUpgradeFromMobileMenu}
                  className="col-span-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(99,102,241,0.26)]"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Pro
                </button>
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3 py-2.5 text-sm font-semibold text-white/70"
                >
                  <BadgeDollarSign className="h-4 w-4 text-white/45" />
                  Pricing
                </Link>
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all',
                      pathname === '/dashboard'
                        ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
                        : 'border-white/[0.08] bg-white/[0.045] text-white/70'
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 text-white/45" />
                    Dashboard
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3 py-2.5 text-sm font-semibold text-white/70"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
            <div className="h-px bg-white/[0.06] my-2" />
            <div className="px-1 py-1">
              <div className="mb-2 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">
                <Grid3X3 className="h-3 w-3" />
                Browse categories
              </div>
            </div>
            <MobileSection
              label="PDF Tools"
              dotColor="bg-indigo-500"
              sections={pdfSections}
              pathname={pathname}
            />
            <div className="h-px bg-white/[0.06] my-2" />
            <MobileSection
              label="Word Tools"
              dotColor="bg-blue-500"
              tools={wordTools}
              pathname={pathname}
            />
            <div className="h-px bg-white/[0.06] my-2" />
            <MobileSection
              label="Image Tools"
              dotColor="bg-pink-500"
              tools={imageTools}
              pathname={pathname}
            />
            <div className="h-px bg-white/[0.06] my-2" />
            <MobileSection
              label="Utilities"
              dotColor="bg-emerald-500"
              sections={utilitySections}
              pathname={pathname}
            />
            <div className="h-px bg-white/[0.06] my-2" />
            <MobileSection
              label="Excel / CSV"
              dotColor="bg-green-500"
              tools={allToolSections[3].tools}
              pathname={pathname}
            />
            <MobileSection
              label="Text Tools"
              dotColor="bg-yellow-500"
              tools={allToolSections[4].tools}
              pathname={pathname}
            />
            <MobileSection
              label="Developer"
              dotColor="bg-violet-500"
              tools={allToolSections[5].tools}
              pathname={pathname}
            />
            <MobileSection
              label="Finance"
              dotColor="bg-red-500"
              tools={allToolSections[6].tools}
              pathname={pathname}
            />
            <MobileSection
              label="Date & Time"
              dotColor="bg-sky-500"
              tools={allToolSections[7].tools}
              pathname={pathname}
            />
            <MobileSection
              label="Calculators"
              dotColor="bg-emerald-500"
              tools={allToolSections[8].tools}
              pathname={pathname}
            />
            <MobileSection
              label="CSS & Design"
              dotColor="bg-fuchsia-500"
              tools={allToolSections[9].tools}
              pathname={pathname}
            />

            {/* Mobile auth */}
            {isSignedIn && (
              <>
                <div className="h-px bg-white/[0.06] my-2" />
                <div className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <UserButton />
                    <span className="text-sm text-white/50">My Account</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
