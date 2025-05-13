"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, MoveVertical, FileImage, File } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { toast } from 'sonner';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface FileRearrangementProps {
  files: File[];
  onFilesReordered: (files: File[]) => void;
  onClose: () => void;
  onContinue: () => void;
}

const FileRearrangement: React.FC<FileRearrangementProps> = ({
  files,
  onFilesReordered,
  onClose,
  onContinue,
}) => {
  const [filesWithPreview, setFilesWithPreview] = useState<FileWithPreview[]>(() => 
    files.map((file) => ({
      file,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : '',
      id: crypto.randomUUID(),
    }))
  );
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // Handle drag operations
  const handleDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
    const draggedOverItem = filesWithPreview[index];
    
    if (draggedItemId && draggedOverItem.id !== draggedItemId) {
      const draggedItemIndex = filesWithPreview.findIndex(item => item.id === draggedItemId);
      if (draggedItemIndex === -1) return;

      // Reorder the array
      const newFiles = [...filesWithPreview];
      const [draggedItem] = newFiles.splice(draggedItemIndex, 1);
      newFiles.splice(index, 0, draggedItem);
      
      setFilesWithPreview(newFiles);
      // Update the parent component's files array
      onFilesReordered(newFiles.map(item => item.file));
    }
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOver(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <File className="h-6 w-6 text-red-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <File className="h-6 w-6 text-blue-600" />;
    } else if (file.type.includes('excel') || file.type.includes('sheet')) {
      return <File className="h-6 w-6 text-green-600" />;
    } else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
      return <File className="h-6 w-6 text-orange-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const handlePreviewClick = (index: number) => {
    setActiveFileIndex(index);
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'Document';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'Spreadsheet';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'Presentation';
    return 'File';
  };

  const renderFilePreview = () => {
    if (filesWithPreview.length === 0) return <div className="text-center p-8">No files selected</div>;
    
    const activeFile = filesWithPreview[activeFileIndex];
    
    if (activeFile.file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={activeFile.preview} 
            alt={`Preview of ${activeFile.file.name}`} 
            className="max-w-full max-h-full object-contain" 
          />
        </div>
      );
    } else {
      const fileIcon = getFileIcon(activeFile.file);
      const fileType = getFileTypeLabel(activeFile.file.type);
      
      return (
        <div className="flex flex-col items-center justify-center h-full">
          {React.cloneElement(fileIcon, { className: "h-16 w-16 mb-4" })}
          <p className="text-center text-gray-700">
            {activeFile.file.name}
            <br />
            <span className="text-sm text-gray-500">
              {fileType} - {(activeFile.file.size / (1024 * 1024)).toFixed(2)} MB
              <br />
              Preview not available. The file will be included in the conversion.
            </span>
          </p>
        </div>
      );
    }
  };

  const handleRemoveFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFiles = filesWithPreview.filter(item => item.id !== id);
    setFilesWithPreview(newFiles);
    onFilesReordered(newFiles.map(item => item.file));
    
    if (newFiles.length === 0) {
      onClose();
      return;
    }
    
    // Adjust active index if necessary
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(Math.max(0, newFiles.length - 1));
    }
    
    toast.success("File removed");
  };

  return (
    <div className="w-full h-[500px] bg-white rounded-lg overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <MoveVertical className="h-5 w-5" /> 
                Arrange Files ({filesWithPreview.length})
              </h3>
              <p className="text-sm text-gray-500">Drag and drop to reorder files</p>
            </div>
            
            <ScrollArea className="flex-grow">
              <ul className="p-2">
                {filesWithPreview.map((fileItem, index) => (
                  <li 
                    key={fileItem.id}
                    draggable
                    onDragStart={() => handleDragStart(fileItem.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOver(null)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 mb-2 p-3 rounded-md cursor-grab border hover:bg-gray-50 transition-colors ${
                      draggedItemId === fileItem.id ? 'opacity-50' : ''
                    } ${activeFileIndex === index ? 'bg-gray-100' : ''} ${
                      dragOver === index && draggedItemId !== fileItem.id ? 'border-docsewa-400 bg-docsewa-50' : ''
                    }`}
                    onClick={() => handlePreviewClick(index)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 shrink-0 text-sm font-medium text-gray-700">
                      {index + 1}
                    </div>
                    <div className="shrink-0">
                      {getFileIcon(fileItem.file)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate" title={fileItem.file.name}>
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getFileTypeLabel(fileItem.file.type)} • {(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handlePreviewClick(index)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleRemoveFile(e, fileItem.id)}
                        title="Remove"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={75}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </h3>
              {filesWithPreview.length > 0 && (
                <p className="text-sm text-gray-500">
                  Viewing {activeFileIndex + 1} of {filesWithPreview.length}: {filesWithPreview[activeFileIndex]?.file.name}
                </p>
              )}
            </div>
            
            <div className="flex-grow overflow-auto bg-gray-50 p-4">
              {renderFilePreview()}
            </div>
            
            <div className="p-4 border-t flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="bg-docsewa-600 hover:bg-docsewa-700"
                onClick={onContinue}
                disabled={filesWithPreview.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default FileRearrangement;