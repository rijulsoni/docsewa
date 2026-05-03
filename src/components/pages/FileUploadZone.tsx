"use client"
import React, { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';

interface FileUploadZoneProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  multiple?: boolean;
  acceptedFileTypes?: string;
  label?: string;
  sublabel?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileChange,
  onDrop,
  onDragOver,
  multiple = false,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.webp,.bmp,.heic,.svg,.docx,.doc,.xlsx,.xls,.csv',
  label,
  sublabel,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragActive(false);
    onDrop(e);
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto mb-5 sm:mb-8"
      onDrop={handleDrop}
      onDragOver={onDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <label className="cursor-pointer block">
        <input
          type="file"
          onChange={onFileChange}
          onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
          className="hidden"
          accept={acceptedFileTypes}
          multiple={multiple}
        />
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center
            transition-all duration-300 select-none overflow-hidden
            ${isDragActive
              ? 'border-indigo-500/70 bg-indigo-500/[0.06] shadow-[0_0_40px_rgba(94,106,210,0.15)]'
              : 'border-white/[0.08] bg-white/[0.02] hover:border-indigo-500/40 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(94,106,210,0.08)]'
            }
          `}
        >
          {/* Background glow when dragging */}
          {isDragActive && (
            <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-sm pointer-events-none" />
          )}

          {/* Icon */}
          <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
            isDragActive
              ? 'bg-indigo-500/20 shadow-[0_0_24px_rgba(94,106,210,0.3)]'
              : 'bg-white/[0.04]'
          }`}>
            {isDragActive ? (
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
            ) : (
              <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-white/30" />
            )}
          </div>

          <h3 className={`text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 transition-colors ${isDragActive ? 'text-indigo-300' : 'text-white/70'}`}>
            {isDragActive ? 'Drop your files here' : (label || 'Upload your files')}
          </h3>

          <p className="text-xs sm:text-sm text-white/35 text-center mb-4 max-w-xs leading-relaxed">
            {sublabel || (
              <>Drag & drop here, or click to browse<br />
                <span className="text-white/20 text-xs">PDF, Image, DOCX, XLSX, CSV — any file</span>
              </>
            )}
          </p>

          <div className="relative flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(94,106,210,0.4)] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(94,106,210,0.55)]">
            <Upload className="h-4 w-4" />
            Choose Files
          </div>
        </div>
      </label>
    </div>
  );
};

export default FileUploadZone;
