"use client"
import React from 'react';
import { FileText, Split, Combine, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ConversionOptionsProps {
  files: File[];
  onClose: () => void;
}

const ConversionOptions: React.FC<ConversionOptionsProps> = ({ files, onClose }) => {
  const fileTypes = files.map(file => file.type);
  const hasImages = fileTypes.some(type => type.startsWith('image/'));
  const hasPdfs = fileTypes.some(type => type === 'application/pdf');
  const hasMultipleFiles = files.length > 1;
  
  // Build the file parameter for URLs
  const fileParam = files.length > 0 ? `?filename=${encodeURIComponent(files[0].name)}` : '';
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Choose what you want to do with your files:</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {hasImages && (
          <Link 
            href={`/image-to-pdf${fileParam}`}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <FileImage className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium">Image to PDF</h4>
            <p className="text-sm text-gray-500 text-center">Convert your images to PDF format</p>
          </Link>
        )}
        
        {hasPdfs && (
          <Link 
            href={`/pdf-merge${fileParam}`}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Combine className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium">Merge PDFs</h4>
            <p className="text-sm text-gray-500 text-center">Combine multiple PDFs into one file</p>
          </Link>
        )}
        
        {hasPdfs && (
          <Link 
            href="/pdf-split"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Split className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium">Split PDF</h4>
            <p className="text-sm text-gray-500 text-center">Divide a PDF into multiple files</p>
          </Link>
        )}
        
        {(hasPdfs || hasImages) && (
          <Link 
            href="/extract-text"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium">Extract Text</h4>
            <p className="text-sm text-gray-500 text-center">Extract text from PDFs or images with OCR</p>
          </Link>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ConversionOptions;
