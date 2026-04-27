"use client"
import React from 'react';
import { FileImage, Files, Scissors, FileText, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ConversionOptionsProps {
  files: File[];
  onClose: () => void;
}

const ConversionOptions: React.FC<ConversionOptionsProps> = ({ files, onClose }) => {
  const fileTypes = files.map((f) => f.type);
  const hasImages = fileTypes.some((t) => t.startsWith('image/'));
  const hasPdfs = fileTypes.some((t) => t === 'application/pdf');
  const fileParam = files.length > 0 ? `?filename=${encodeURIComponent(files[0].name)}` : '';

  const options = [
    {
      show: hasImages,
      href: `/image-to-pdf${fileParam}`,
      icon: <FileImage className="h-5 w-5" />,
      title: 'Image to PDF',
      description: 'Convert your images into a PDF document',
      iconBg: 'from-blue-500 to-blue-600',
      hoverBorder: 'hover:border-blue-500/30',
      hoverBg: 'hover:bg-blue-500/[0.06]',
    },
    {
      show: hasPdfs && files.length > 1,
      href: `/merge-pdf${fileParam}`,
      icon: <Files className="h-5 w-5" />,
      title: 'Merge PDFs',
      description: 'Combine multiple PDFs into one file',
      iconBg: 'from-emerald-500 to-teal-600',
      hoverBorder: 'hover:border-emerald-500/30',
      hoverBg: 'hover:bg-emerald-500/[0.06]',
    },
    {
      show: hasPdfs,
      href: `/pdf-split${fileParam}`,
      icon: <Scissors className="h-5 w-5" />,
      title: 'Split PDF',
      description: 'Extract pages or a custom range',
      iconBg: 'from-rose-500 to-pink-600',
      hoverBorder: 'hover:border-rose-500/30',
      hoverBg: 'hover:bg-rose-500/[0.06]',
    },
    {
      show: hasPdfs || hasImages,
      href: `/extract-text${fileParam}`,
      icon: <FileText className="h-5 w-5" />,
      title: 'Extract Text',
      description: 'Pull all text content from PDFs',
      iconBg: 'from-orange-500 to-amber-600',
      hoverBorder: 'hover:border-orange-500/30',
      hoverBg: 'hover:bg-orange-500/[0.06]',
    },
    {
      show: hasPdfs,
      href: `/pdf-to-image${fileParam}`,
      icon: <FileImage className="h-5 w-5" />,
      title: 'PDF to Image',
      description: 'Convert PDF pages to PNG or JPG',
      iconBg: 'from-violet-500 to-purple-600',
      hoverBorder: 'hover:border-violet-500/30',
      hoverBg: 'hover:bg-violet-500/[0.06]',
    },
  ].filter((o) => o.show);

  return (
    <div className="bg-[#0d0d0f] rounded-2xl border border-white/[0.08] p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">What would you like to do?</h3>
          <p className="text-xs text-white/35 mt-0.5">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {options.length === 0 && (
        <div className="text-center py-10 text-white/30">
          <p className="text-sm">No conversion options available.</p>
          <p className="text-xs mt-1">Please upload a PDF or image file.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className={cn(
              'group flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] transition-all duration-200',
              option.hoverBorder,
              option.hoverBg
            )}
          >
            <div
              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${option.iconBg} flex items-center justify-center text-white shrink-0 shadow-sm`}
            >
              {option.icon}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-white/80">{option.title}</p>
              <p className="text-xs text-white/35 mt-0.5 truncate">{option.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

export default ConversionOptions;
