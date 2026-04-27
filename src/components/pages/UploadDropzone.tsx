"use client"
import React, { useState } from 'react';
import { Upload, FileText, FileImage, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** E.g. "PDF" | "images" | "PDF or images" */
  fileLabel?: string;
  /** Short hint under the label */
  hint?: string;
  accentClass?: string;           // e.g. "border-indigo-500/60 bg-indigo-500/[0.06]"
  buttonClass?: string;           // e.g. "bg-indigo-500 hover:bg-indigo-400"
  icon?: 'file' | 'image' | 'upload';
}

const ICONS = {
  file:   <FileText className="h-8 w-8" />,
  image:  <FileImage className="h-8 w-8" />,
  upload: <Upload className="h-8 w-8" />,
};

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFiles,
  accept = '*',
  multiple = false,
  fileLabel = 'file',
  hint,
  accentClass = 'border-indigo-500/60 bg-indigo-500/[0.06] shadow-[0_0_40px_rgba(94,106,210,0.15)]',
  buttonClass = 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_4px_16px_rgba(94,106,210,0.4)]',
  icon = 'upload',
}) => {
  const [isDrag, setIsDrag] = useState(false);
  const inputId = React.useId();

  const collect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFiles(Array.from(files));
  };

  return (
    <label
      htmlFor={inputId}
      onDrop={(e) => { e.preventDefault(); setIsDrag(false); collect(e.dataTransfer.files); }}
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDrag(false); }}
      className={cn(
        'group relative flex flex-col items-center justify-center w-full cursor-pointer',
        'border-2 border-dashed rounded-2xl px-8 py-14 text-center',
        'transition-all duration-300 select-none overflow-hidden',
        isDrag ? accentClass : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]'
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => collect(e.target.files)}
      />

      {/* Ambient glow when dragging */}
      {isDrag && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(94,106,210,0.08) 0%, transparent 70%)' }} />
      )}

      {/* Icon */}
      <div className={cn(
        'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300',
        isDrag ? 'scale-110' : 'group-hover:scale-105',
        'bg-white/[0.04] border border-white/[0.06]'
      )}>
        <span className={cn('transition-all duration-300', isDrag ? 'text-indigo-300' : 'text-white/25 group-hover:text-white/40')}>
          {isDrag ? <Sparkles className="h-8 w-8" /> : ICONS[icon]}
        </span>
      </div>

      <p className={cn('text-lg font-semibold mb-1.5 transition-colors', isDrag ? 'text-white/90' : 'text-white/55 group-hover:text-white/70')}>
        {isDrag ? `Drop your ${fileLabel} here` : `Upload your ${fileLabel}`}
      </p>

      <p className="text-sm text-white/30 mb-8 max-w-xs leading-relaxed">
        {hint ?? `Drag & drop or click to browse${multiple ? ' — multiple files OK' : ''}`}
      </p>

      <div className={cn(
        'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200',
        buttonClass
      )}>
        <Upload className="h-4 w-4" />
        Choose {multiple ? 'Files' : 'File'}
      </div>
    </label>
  );
};

export default UploadDropzone;
