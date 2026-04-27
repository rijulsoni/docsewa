import React from 'react';
import FeatureCard from './FeatureCard';
import {
  FileImage, FileText, Files, Scissors, FileDown,
  RotateCw, Stamp, Trash2, Hash, ArrowUpDown,
  Minimize2, Layers, Crop, PanelTop, Tag,
} from 'lucide-react';

const tools = [
  {
    title: 'Image to PDF',
    description: 'Convert JPG, PNG and WebP images into a polished, print-ready PDF.',
    icon: <FileImage className="h-5 w-5" />,
    path: '/image-to-pdf',
    iconBg: 'from-blue-500 to-blue-600',
    badge: 'Popular',
  },
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one. Drag to reorder pages before merging.',
    icon: <Files className="h-5 w-5" />,
    path: '/merge-pdf',
    iconBg: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Split PDF',
    description: 'Extract individual pages or a custom range into a new PDF.',
    icon: <Scissors className="h-5 w-5" />,
    path: '/pdf-split',
    iconBg: 'from-rose-500 to-pink-600',
  },
  {
    title: 'PDF to Image',
    description: 'Render any PDF page as a high-resolution PNG or JPG in your browser.',
    icon: <FileDown className="h-5 w-5" />,
    path: '/pdf-to-image',
    iconBg: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Extract Text',
    description: 'Pull all readable text from any PDF. Copy or download as .txt.',
    icon: <FileText className="h-5 w-5" />,
    path: '/extract-text',
    iconBg: 'from-orange-500 to-amber-600',
    badge: 'Fast',
  },
  {
    title: 'Rotate PDF',
    description: 'Rotate all or specific pages by 90°, 180°, or 270° in one click.',
    icon: <RotateCw className="h-5 w-5" />,
    path: '/rotate-pdf',
    iconBg: 'from-yellow-500 to-yellow-600',
  },
  {
    title: 'Watermark PDF',
    description: 'Stamp custom text diagonally across every page with adjustable opacity.',
    icon: <Stamp className="h-5 w-5" />,
    path: '/watermark-pdf',
    iconBg: 'from-purple-500 to-fuchsia-600',
  },
  {
    title: 'Remove Pages',
    description: 'Delete one or more pages from a PDF by entering their page numbers.',
    icon: <Trash2 className="h-5 w-5" />,
    path: '/remove-pages',
    iconBg: 'from-red-500 to-red-600',
  },
  {
    title: 'Page Numbers',
    description: 'Stamp page numbers at any position with custom format and font size.',
    icon: <Hash className="h-5 w-5" />,
    path: '/page-numbers',
    iconBg: 'from-teal-500 to-cyan-600',
  },
  {
    title: 'Reorder Pages',
    description: 'Drag thumbnail previews into a new order, then download the rebuilt PDF.',
    icon: <ArrowUpDown className="h-5 w-5" />,
    path: '/reorder-pages',
    iconBg: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'Compress PDF',
    description: 'Shrink file size by removing dead objects and compressing internal streams.',
    icon: <Minimize2 className="h-5 w-5" />,
    path: '/compress-pdf',
    iconBg: 'from-sky-500 to-sky-600',
    badge: 'New',
  },
  {
    title: 'Flatten Forms',
    description: 'Bake interactive form fields into static content — locks answers permanently.',
    icon: <Layers className="h-5 w-5" />,
    path: '/flatten-pdf',
    iconBg: 'from-amber-500 to-orange-600',
    badge: 'New',
  },
  {
    title: 'Crop Pages',
    description: 'Trim margins from PDF pages by specifying points to remove from each edge.',
    icon: <Crop className="h-5 w-5" />,
    path: '/crop-pages',
    iconBg: 'from-lime-500 to-green-600',
    badge: 'New',
  },
  {
    title: 'Header / Footer',
    description: 'Stamp custom text at the top or bottom of every page with alignment options.',
    icon: <PanelTop className="h-5 w-5" />,
    path: '/header-footer',
    iconBg: 'from-fuchsia-500 to-pink-600',
    badge: 'New',
  },
  {
    title: 'Edit Metadata',
    description: 'Update the title, author, subject and keywords stored in your PDF properties.',
    icon: <Tag className="h-5 w-5" />,
    path: '/edit-metadata',
    iconBg: 'from-cyan-500 to-teal-600',
    badge: 'New',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-4">Tools</p>
          <h2 className="text-3xl md:text-5xl font-extrabold gradient-text leading-tight mb-4">
            Everything for your PDFs
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-base">
            15 essential tools — all free, all private
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {tools.map((tool) => (
            <FeatureCard
              key={tool.path}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
              gradient=""
              iconBg={tool.iconBg}
              badge={tool.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
