'use client';

import React from 'react';
import { FileText, Image, FileType, Files } from 'lucide-react';
import Link from 'next/link';

interface ActionOption {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

interface ActionSelectionGridProps {
  filename?: string;
}

const ActionSelectionGrid: React.FC<ActionSelectionGridProps> = ({ filename }) => {
  const fileOptions: ActionOption[] = [
    { 
      title: "Image to PDF", 
      description: "Convert your images to PDF format", 
      icon: <Image className="h-6 w-6" />, 
      path: `/image-to-pdf${filename ? `?filename=${filename}` : ''}` 
    },
    { 
      title: "PDF to Image", 
      description: "Convert PDF pages to image files", 
      icon: <FileType className="h-6 w-6" />, 
      path: `/pdf-to-image${filename ? `?filename=${filename}` : ''}` 
    },
    { 
      title: "Merge PDF", 
      description: "Combine multiple PDFs into one file", 
      icon: <Files className="h-6 w-6" />, 
      path: `/merge-pdf${filename ? `?filename=${filename}` : ''}` 
    },
    { 
      title: "Extract Text", 
      description: "Extract text from images with OCR", 
      icon: <FileText className="h-6 w-6" />, 
      path: `/extract-text${filename ? `?filename=${filename}` : ''}` 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
      {fileOptions.map((option, index) => (
        <Link 
          key={index}
          href={option.path}
          className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-docsewa-100 flex items-center justify-center mr-4 text-docsewa-600">
            {option.icon}
          </div>
          <div>
            <h4 className="font-medium">{option.title}</h4>
            <p className="text-sm text-gray-500">{option.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ActionSelectionGrid;