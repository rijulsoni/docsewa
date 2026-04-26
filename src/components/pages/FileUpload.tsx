import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  acceptedFileTypes: string;
  multiple?: boolean;
  maxFileSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  fileDescription: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  acceptedFileTypes,
  multiple = false,
  maxFileSizeMB = 10,
  onFilesSelected,
  fileDescription
}) => {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      handleFiles(filesArray);
    }
  };

  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
      // Check file type
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const acceptedTypes = acceptedFileTypes.split(',');
      
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          // Handle extension based validation
          return `.${fileExtension}` === type;
        } else {
          // Handle MIME type validation
          return fileType.match(new RegExp(type.replace('*', '.*')));
        }
      });
      
      if (!isValidType) {
        toast.error(`File type not accepted: ${file.name}`);
        return false;
      }
      
      // Check file size
      const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(`File too large: ${file.name} (Max: ${maxFileSizeMB}MB)`);
        return false;
      }
      
      return true;
    });
  };

  const handleFiles = (files: File[]) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      if (!multiple && validFiles.length > 1) {
        const singleFile = [validFiles[0]];
        setSelectedFiles(singleFile);
        onFilesSelected(singleFile);
        toast.info('Only the first file was selected as multiple files are not allowed');
      } else {
        setSelectedFiles(validFiles);
        onFilesSelected(validFiles);
        if (validFiles.length > 0) {
          toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} selected`);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      handleFiles(filesArray);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFilesSelected([]);
  };

  const getFileTypeDescription = () => {
    if (acceptedFileTypes.includes('*')) return 'All files';
    const types = [];
    if (acceptedFileTypes.includes('image')) types.push('Images');
    if (acceptedFileTypes.includes('pdf')) types.push('PDFs');
    if (acceptedFileTypes.includes('doc') || acceptedFileTypes.includes('word')) types.push('Documents');
    if (acceptedFileTypes.includes('xls') || acceptedFileTypes.includes('sheet')) types.push('Spreadsheets');
    if (acceptedFileTypes.includes('ppt') || acceptedFileTypes.includes('presentation')) types.push('Presentations');
    
    return types.length > 0 ? types.join(', ') : 'Selected file types';
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${dragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />
        
        <div className="mx-auto w-16 h-16 mb-4 text-blue-500 flex items-center justify-center rounded-full bg-blue-50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        
        <p className="mb-2 text-lg font-medium text-gray-700">
          {selectedFiles.length > 0 ? (
            <span>{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected</span>
          ) : (
            <span>Drop {fileDescription} here or click to upload</span>
          )}
        </p>
        
        <p className="text-sm text-gray-500">
          {getFileTypeDescription()}
          {multiple ? ' (Multiple files allowed)' : ''}
        </p>
        
        {selectedFiles.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto text-left">
            <ul className="space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-700 truncate px-2 py-1 bg-gray-50 rounded">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              clearFiles();
            }}
          >
            Clear Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
