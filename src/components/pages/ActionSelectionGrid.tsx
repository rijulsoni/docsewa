import React from 'react';
import Link from 'next/link';
import { FileText, ImageIcon, FileType, Files, Scissors, ArrowRight } from 'lucide-react';

interface ActionOption {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  iconBg: string;
}

interface ActionSelectionGridProps {
  filename?: string;
}

const ActionSelectionGrid: React.FC<ActionSelectionGridProps> = ({ filename }) => {
  const param = filename ? `?filename=${encodeURIComponent(filename)}` : '';

  const fileOptions: ActionOption[] = [
    {
      title: 'Image to PDF',
      description: 'Convert images to PDF format',
      icon: <ImageIcon className="h-4 w-4" />,
      path: `/image-to-pdf${param}`,
      iconBg: 'from-blue-500 to-blue-600',
    },
    {
      title: 'PDF to Image',
      description: 'Convert PDF pages to images',
      icon: <FileType className="h-4 w-4" />,
      path: `/pdf-to-image${param}`,
      iconBg: 'from-violet-500 to-violet-600',
    },
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one',
      icon: <Files className="h-4 w-4" />,
      path: `/merge-pdf${param}`,
      iconBg: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Split PDF',
      description: 'Extract pages from a PDF',
      icon: <Scissors className="h-4 w-4" />,
      path: `/pdf-split${param}`,
      iconBg: 'from-rose-500 to-pink-600',
    },
    {
      title: 'Extract Text',
      description: 'Pull text content from PDFs',
      icon: <FileText className="h-4 w-4" />,
      path: `/extract-text${param}`,
      iconBg: 'from-orange-500 to-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2">
      {fileOptions.map((option) => (
        <Link
          key={option.path}
          href={option.path}
          className="group flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.05] transition-all"
        >
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.iconBg} flex items-center justify-center text-white shrink-0`}>
            {option.icon}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">{option.title}</p>
            <p className="text-xs text-white/30 mt-0.5">{option.description}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      ))}
    </div>
  );
};

export default ActionSelectionGrid;
