import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  multiple?: boolean;
  acceptedFileTypes?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  onFileChange, 
  onDrop, 
  onDragOver,
  multiple = false,
  acceptedFileTypes = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
}) => {
  return (
    <div 
      className="w-full max-w-2xl mx-auto mb-8"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-white hover:border-docsewa-400 transition-all duration-300">
        <div className="w-16 h-16 rounded-full bg-docsewa-50 flex items-center justify-center mb-5">
          <Upload className="h-8 w-8 text-docsewa-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">Upload your files</h3>
        <p className="text-gray-500 text-center mb-5">
          Drag and drop your files here, or click to browse
          <br />
          <span className="text-sm">{multiple ? "You can select multiple files (PDF, Images, Documents)" : "(PDF, Images, Documents)"}</span>
        </p>
        <label className="cursor-pointer">
          <input
            type="file"
            onChange={onFileChange}
            className="hidden"
            accept={acceptedFileTypes}
            multiple={multiple}
          />
          <div className="py-2.5 px-5 bg-docsewa-500 text-white font-medium rounded-lg hover:bg-docsewa-600 transition-all duration-300 flex items-center">
            Browse Files
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileUploadZone;