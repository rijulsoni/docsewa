import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

const toolGroups = [
  {
    heading: 'Convert',
    links: [
      { href: '/image-to-pdf',  label: 'Image to PDF' },
      { href: '/pdf-to-image',  label: 'PDF to Image' },
      { href: '/extract-text',  label: 'Extract Text' },
    ],
  },
  {
    heading: 'Organise',
    links: [
      { href: '/merge-pdf',     label: 'Merge PDF' },
      { href: '/pdf-split',     label: 'Split PDF' },
      { href: '/reorder-pages', label: 'Reorder Pages' },
      { href: '/remove-pages',  label: 'Remove Pages' },
    ],
  },
  {
    heading: 'Edit',
    links: [
      { href: '/rotate-pdf',    label: 'Rotate PDF' },
      { href: '/watermark-pdf', label: 'Watermark PDF' },
      { href: '/page-numbers',  label: 'Page Numbers' },
      { href: '/crop-pages',    label: 'Crop Pages' },
      { href: '/header-footer', label: 'Header / Footer' },
    ],
  },
  {
    heading: 'Optimise',
    links: [
      { href: '/compress-pdf',  label: 'Compress PDF' },
      { href: '/flatten-pdf',   label: 'Flatten Forms' },
      { href: '/edit-metadata', label: 'Edit Metadata' },
    ],
  },
  {
    heading: 'Word',
    links: [
      { href: '/docx-to-text',        label: 'DOCX to Text' },
      { href: '/docx-to-html',        label: 'DOCX to HTML' },
      { href: '/docx-to-pdf',         label: 'DOCX to PDF' },
      { href: '/merge-docx',          label: 'Merge DOCX' },
      { href: '/docx-find-replace',   label: 'Find & Replace' },
      { href: '/docx-metadata',       label: 'DOCX Metadata' },
      { href: '/pdf-to-docx',         label: 'PDF to DOCX' },
      { href: '/docx-extract-images', label: 'Extract Images' },
    ],
  },
];

const company = [
  { href: '/pricing', label: 'Pricing' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
  { href: '#', label: 'Contact' },
  { href: '#', label: 'FAQ' },
];

const Footer = () => {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-8 gap-10 mb-12">

          {/* Brand — spans 2 cols on md */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold accent-gradient-text">DocSewa</span>
            </Link>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs">
              97 professional tools for PDF, Word, Image, Excel & more. Everything runs locally — your files never touch our servers.
            </p>
          </div>

          {/* Tool groups */}
          {toolGroups.map((group) => (
            <div key={group.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">
                {group.heading}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} DocSewa. All rights reserved.</p>
          <p className="text-xs text-white/20">Built for speed · Designed for privacy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
