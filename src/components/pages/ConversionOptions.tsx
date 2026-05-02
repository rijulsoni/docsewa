"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  X, ArrowRight,
  FileImage, Files, Scissors, FileText, RotateCw, Stamp, Trash2,
  Hash, ArrowUpDown, Minimize2, Layers, Crop, PanelTop, Tag,
  Lock, PenLine, FileDown, Code, FileOutput, Search, ImageIcon,
  Repeat2, Wand2, SlidersHorizontal, ZoomIn, ScanText, BoxSelect,
  Table2, FileSpreadsheet, Braces, FilePlus2, FileCode, BarChart3, LockOpen,
} from 'lucide-react';

type FileCategory = 'pdf' | 'image' | 'word' | 'excel' | 'csv' | 'json' | 'unknown';

interface ToolOption {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface ToolGroup {
  label: string;
  dot: string;
  badge: string;
  tools: ToolOption[];
}

function detectCategory(file: File): FileCategory {
  const n = file.name.toLowerCase();
  const t = file.type;
  if (t === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (t.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|svg|bmp)$/.test(n)) return 'image';
  if (t.includes('wordprocessingml') || n.endsWith('.docx') || n.endsWith('.doc')) return 'word';
  if (t.includes('spreadsheetml') || n.endsWith('.xlsx') || n.endsWith('.xls')) return 'excel';
  if (t === 'text/csv' || n.endsWith('.csv')) return 'csv';
  if (t === 'application/json' || n.endsWith('.json')) return 'json';
  return 'unknown';
}

const CATEGORY_META: Record<FileCategory, { label: string; color: string; bg: string }> = {
  pdf:     { label: 'PDF Document',   color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  image:   { label: 'Image File',     color: 'text-pink-400',   bg: 'bg-pink-500/10' },
  word:    { label: 'Word Document',  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  excel:   { label: 'Excel Workbook', color: 'text-green-400',  bg: 'bg-green-500/10' },
  csv:     { label: 'CSV File',       color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
  json:    { label: 'JSON File',      color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  unknown: { label: 'File',           color: 'text-white/40',   bg: 'bg-white/[0.06]' },
};

function buildGroups(files: File[], p: string): ToolGroup[] {
  const cats = new Set(files.map(detectCategory));
  const hasPdf    = cats.has('pdf');
  const hasImage  = cats.has('image');
  const hasWord   = cats.has('word');
  const hasExcel  = cats.has('excel');
  const hasCsv    = cats.has('csv');
  const hasJson   = cats.has('json');
  const multiPdf  = hasPdf  && files.filter(f => detectCategory(f) === 'pdf').length > 1;
  const multiImg  = hasImage && files.filter(f => detectCategory(f) === 'image').length > 1;
  const multiWord = hasWord  && files.filter(f => detectCategory(f) === 'word').length > 1;
  const multiXls  = hasExcel && files.filter(f => detectCategory(f) === 'excel').length > 1;

  const groups: ToolGroup[] = [];

  if (hasPdf) {
    const tools: ToolOption[] = [
      multiPdf && { href: `/merge-pdf${p}`,      title: 'Merge PDF',        description: 'Combine all PDFs into one file',         icon: <Files className="h-4 w-4" />,       iconBg: 'from-emerald-500 to-teal-600' },
      { href: `/pdf-split${p}`,       title: 'Split PDF',        description: 'Extract pages or a custom range',        icon: <Scissors className="h-4 w-4" />,    iconBg: 'from-rose-500 to-pink-600' },
      { href: `/extract-text${p}`,    title: 'Extract Text',     description: 'Pull all readable text from PDF',        icon: <FileText className="h-4 w-4" />,    iconBg: 'from-orange-500 to-amber-600' },
      { href: `/pdf-to-image${p}`,    title: 'PDF to Image',     description: 'Render pages as PNG or JPG',             icon: <FileDown className="h-4 w-4" />,    iconBg: 'from-violet-500 to-purple-600' },
      { href: `/compress-pdf${p}`,    title: 'Compress PDF',     description: 'Shrink file size, keep quality',         icon: <Minimize2 className="h-4 w-4" />,   iconBg: 'from-sky-500 to-sky-600' },
      { href: `/rotate-pdf${p}`,      title: 'Rotate PDF',       description: 'Rotate pages 90° / 180° / 270°',        icon: <RotateCw className="h-4 w-4" />,    iconBg: 'from-yellow-500 to-yellow-600' },
      { href: `/watermark-pdf${p}`,   title: 'Watermark',        description: 'Stamp custom text on every page',        icon: <Stamp className="h-4 w-4" />,       iconBg: 'from-purple-500 to-fuchsia-600' },
      { href: `/pdf-protect${p}`,     title: 'Protect PDF',      description: 'Encrypt with a password',                icon: <Lock className="h-4 w-4" />,        iconBg: 'from-red-500 to-rose-600' },
      { href: `/pdf-sign${p}`,        title: 'Sign PDF',         description: 'Draw and embed a signature',             icon: <PenLine className="h-4 w-4" />,     iconBg: 'from-indigo-500 to-violet-600' },
      { href: `/reorder-pages${p}`,   title: 'Reorder Pages',    description: 'Drag thumbnails into a new order',       icon: <ArrowUpDown className="h-4 w-4" />, iconBg: 'from-indigo-500 to-indigo-600' },
      { href: `/remove-pages${p}`,    title: 'Remove Pages',     description: 'Delete specific page numbers',           icon: <Trash2 className="h-4 w-4" />,      iconBg: 'from-red-500 to-red-600' },
      { href: `/page-numbers${p}`,    title: 'Page Numbers',     description: 'Stamp numbers at any edge',              icon: <Hash className="h-4 w-4" />,        iconBg: 'from-teal-500 to-cyan-600' },
      { href: `/flatten-pdf${p}`,     title: 'Flatten Forms',    description: 'Bake form fields into static content',   icon: <Layers className="h-4 w-4" />,      iconBg: 'from-amber-500 to-orange-600' },
      { href: `/crop-pages${p}`,      title: 'Crop Pages',       description: 'Trim margins from each page',            icon: <Crop className="h-4 w-4" />,        iconBg: 'from-lime-500 to-green-600' },
      { href: `/header-footer${p}`,   title: 'Header / Footer',  description: 'Add text to top or bottom of pages',    icon: <PanelTop className="h-4 w-4" />,    iconBg: 'from-fuchsia-500 to-pink-600' },
      { href: `/edit-metadata${p}`,   title: 'Edit Metadata',    description: 'Update title, author, keywords',        icon: <Tag className="h-4 w-4" />,         iconBg: 'from-cyan-500 to-teal-600' },
      { href: `/pdf-to-docx${p}`,     title: 'PDF to DOCX',      description: 'Convert to editable Word document',      icon: <FileOutput className="h-4 w-4" />,  iconBg: 'from-sky-500 to-sky-600' },
      { href: `/pdf-unlock${p}`,      title: 'PDF Unlock',       description: 'Remove password encryption',              icon: <LockOpen className="h-4 w-4" />,    iconBg: 'from-emerald-500 to-green-600' },
    ].filter(Boolean) as ToolOption[];
    groups.push({ label: 'PDF Tools', dot: 'bg-indigo-500', badge: 'bg-indigo-500/10 text-indigo-400', tools });
  }

  if (hasImage) {
    const tools: ToolOption[] = [
      { href: `/image-to-pdf${p}`,           title: 'Image to PDF',      description: 'Compile images into a PDF',              icon: <FileImage className="h-4 w-4" />,       iconBg: 'from-blue-500 to-blue-600' },
      { href: `/image-format-converter${p}`, title: 'Format Converter',  description: 'Convert to JPG, PNG, WebP, etc.',        icon: <Repeat2 className="h-4 w-4" />,         iconBg: 'from-pink-500 to-rose-600' },
      { href: `/background-remover${p}`,     title: 'Remove Background', description: 'AI strips background to transparent',    icon: <Wand2 className="h-4 w-4" />,           iconBg: 'from-emerald-500 to-teal-600' },
      { href: `/image-crop${p}`,             title: 'Crop & Resize',     description: 'Drag handles to crop any region',        icon: <BoxSelect className="h-4 w-4" />,       iconBg: 'from-orange-500 to-amber-600' },
      { href: `/image-upscaler${p}`,         title: 'Upscale Image',     description: 'Enlarge to 2× or 4× resolution',        icon: <ZoomIn className="h-4 w-4" />,          iconBg: 'from-sky-500 to-cyan-600' },
      { href: `/image-to-text${p}`,          title: 'Extract Text (OCR)',description: 'Pull text from photos/screenshots',      icon: <ScanText className="h-4 w-4" />,        iconBg: 'from-teal-500 to-cyan-600' },
      multiImg && { href: `/batch-compress${p}`, title: 'Batch Compress',description: 'Compress all images at once',            icon: <SlidersHorizontal className="h-4 w-4" />,iconBg: 'from-violet-500 to-purple-600' },
    ].filter(Boolean) as ToolOption[];
    groups.push({ label: 'Image Tools', dot: 'bg-pink-500', badge: 'bg-pink-500/10 text-pink-400', tools });
  }

  if (hasWord) {
    const tools: ToolOption[] = [
      { href: `/docx-to-text${p}`,          title: 'DOCX to Text',   description: 'Extract all text content',             icon: <FileText className="h-4 w-4" />,   iconBg: 'from-blue-500 to-blue-600' },
      { href: `/docx-to-html${p}`,          title: 'DOCX to HTML',   description: 'Convert to clean HTML markup',         icon: <Code className="h-4 w-4" />,       iconBg: 'from-purple-500 to-purple-600' },
      { href: `/docx-to-pdf${p}`,           title: 'DOCX to PDF',    description: 'Export as a PDF document',             icon: <FileOutput className="h-4 w-4" />, iconBg: 'from-red-500 to-red-600' },
      { href: `/docx-find-replace${p}`,     title: 'Find & Replace', description: 'Bulk replace text in document',        icon: <Search className="h-4 w-4" />,     iconBg: 'from-amber-500 to-yellow-600' },
      { href: `/docx-metadata${p}`,         title: 'Edit Metadata',  description: 'Update title, author, company',        icon: <Tag className="h-4 w-4" />,        iconBg: 'from-indigo-500 to-indigo-600' },
      { href: `/docx-extract-images${p}`,   title: 'Extract Images', description: 'Export all embedded images as ZIP',    icon: <ImageIcon className="h-4 w-4" />,  iconBg: 'from-pink-500 to-rose-600' },
      multiWord && { href: `/merge-docx${p}`, title: 'Merge DOCX',   description: 'Combine documents into one',           icon: <Files className="h-4 w-4" />,      iconBg: 'from-emerald-500 to-teal-600' },
      { href: `/docx-to-markdown${p}`,  title: 'DOCX to Markdown', description: 'Convert to clean .md format',          icon: <FileCode className="h-4 w-4" />,   iconBg: 'from-indigo-500 to-violet-600' },
      { href: `/docx-word-count${p}`,   title: 'Word Count',       description: 'Analyse words, sentences, reading time', icon: <BarChart3 className="h-4 w-4" />, iconBg: 'from-sky-500 to-cyan-600' },
    ].filter(Boolean) as ToolOption[];
    groups.push({ label: 'Word / DOCX Tools', dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-400', tools });
  }

  if (hasExcel) {
    const tools: ToolOption[] = [
      { href: `/excel-to-csv${p}`,   title: 'Excel to CSV',  description: 'Export any sheet as CSV',           icon: <Table2 className="h-4 w-4" />,      iconBg: 'from-green-500 to-emerald-600' },
      { href: `/excel-to-json${p}`,  title: 'Excel to JSON', description: 'Convert rows to JSON array',        icon: <Braces className="h-4 w-4" />,      iconBg: 'from-amber-500 to-yellow-600' },
      multiXls && { href: `/merge-excel${p}`, title: 'Merge Excel', description: 'Combine workbooks into one', icon: <FilePlus2 className="h-4 w-4" />,   iconBg: 'from-purple-500 to-violet-600' },
    ].filter(Boolean) as ToolOption[];
    groups.push({ label: 'Excel Tools', dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-400', tools });
  }

  if (hasCsv) {
    groups.push({
      label: 'CSV Tools', dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400',
      tools: [
        { href: `/csv-to-excel${p}`, title: 'CSV to Excel', description: 'Convert to a formatted .xlsx workbook', icon: <FileSpreadsheet className="h-4 w-4" />, iconBg: 'from-blue-500 to-blue-600' },
      ],
    });
  }

  if (hasJson) {
    groups.push({
      label: 'JSON Tools', dot: 'bg-amber-400', badge: 'bg-amber-500/10 text-amber-400',
      tools: [
        { href: `/json-formatter${p}`, title: 'JSON Formatter', description: 'Prettify, minify and validate JSON', icon: <Braces className="h-4 w-4" />, iconBg: 'from-amber-500 to-yellow-600' },
        { href: `/json-to-excel${p}`,  title: 'JSON to Excel',  description: 'Convert JSON array to .xlsx',        icon: <FileSpreadsheet className="h-4 w-4" />, iconBg: 'from-green-500 to-emerald-600' },
      ],
    });
  }

  return groups;
}

function fmt(b: number) {
  return b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

const INITIAL_VISIBLE = 6;

interface ConversionOptionsProps {
  files: File[];
  onClose: () => void;
}

const ConversionOptions: React.FC<ConversionOptionsProps> = ({ files, onClose }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fileParam = files.length > 0 ? `?filename=${encodeURIComponent(files[0].name)}` : '';
  const groups = buildGroups(files, fileParam);

  const primaryCat = files.length > 0 ? detectCategory(files[0]) : 'unknown';
  const meta = CATEGORY_META[primaryCat];

  const toggleGroup = (label: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) { next.delete(label); } else { next.add(label); }
      return next;
    });

  return (
    <div className="bg-[#0d0d0f] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col max-h-[85vh]">
      {/* Header — file info */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
        <div className={cn('shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold', meta.bg, meta.color)}>
          {meta.label}
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium text-white/80 truncate">{files[0]?.name ?? 'No file'}</p>
          <p className="text-xs text-white/30">
            {files.length === 1 ? fmt(files[0].size) : `${files.length} files selected`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sub-heading */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Suggested tools</p>
      </div>

      {/* Scrollable tool groups */}
      <div className="overflow-y-auto flex-grow px-4 pb-4 space-y-5">
        {groups.length === 0 && (
          <div className="text-center py-10 text-white/30">
            <p className="text-sm">No tools found for this file type.</p>
            <p className="text-xs mt-1 text-white/20">Try uploading a PDF, image, DOCX, XLSX or CSV.</p>
          </div>
        )}

        {groups.map((group) => {
          const isExpanded = expanded.has(group.label);
          const visible = isExpanded ? group.tools : group.tools.slice(0, INITIAL_VISIBLE);
          const extra = group.tools.length - INITIAL_VISIBLE;

          return (
            <div key={group.label}>
              {/* Group label */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', group.dot)} />
                <span className="text-xs font-semibold text-white/50">{group.label}</span>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', group.badge)}>
                  {group.tools.length}
                </span>
              </div>

              {/* Tool cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {visible.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={onClose}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
                  >
                    <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0', tool.iconBg)}>
                      {tool.icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-white/75 leading-tight">{tool.title}</p>
                      <p className="text-xs text-white/30 truncate mt-0.5">{tool.description}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>

              {extra > 0 && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="mt-2 w-full py-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  {isExpanded ? 'Show fewer ↑' : `Show ${extra} more ↓`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancel */}
      <div className="shrink-0 px-5 py-3 border-t border-white/[0.05]">
        <button
          onClick={onClose}
          className="w-full py-1.5 text-sm text-white/25 hover:text-white/50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConversionOptions;
