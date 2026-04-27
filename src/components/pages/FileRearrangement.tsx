"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, MoveVertical, FileImage, FileText, X } from 'lucide-react';
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
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      id: crypto.randomUUID(),
    }))
  );
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = (id: string) => setDraggedItemId(id);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
    const draggedOverItem = filesWithPreview[index];
    if (draggedItemId && draggedOverItem.id !== draggedItemId) {
      const draggedItemIndex = filesWithPreview.findIndex((item) => item.id === draggedItemId);
      if (draggedItemIndex === -1) return;
      const newFiles = [...filesWithPreview];
      const [draggedItem] = newFiles.splice(draggedItemIndex, 1);
      newFiles.splice(index, 0, draggedItem);
      setFilesWithPreview(newFiles);
      onFilesReordered(newFiles.map((item) => item.file));
    }
  };

  const handleDragEnd = () => { setDraggedItemId(null); setDragOver(null); };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-400" />;
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5 text-red-400" />;
    return <FileText className="h-5 w-5 text-white/40" />;
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'PDF';
    return 'File';
  };

  const renderFilePreview = () => {
    if (filesWithPreview.length === 0) return <div className="flex items-center justify-center h-full text-white/30 text-sm">No files selected</div>;
    const activeFile = filesWithPreview[activeFileIndex];
    if (activeFile.file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeFile.preview} alt={`Preview of ${activeFile.file.name}`} className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        {getFileIcon(activeFile.file)}
        <div className="text-center">
          <p className="text-sm text-white/60 font-medium">{activeFile.file.name}</p>
          <p className="text-xs text-white/30 mt-1">
            {getFileTypeLabel(activeFile.file.type)} · {(activeFile.file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p className="text-xs text-white/20 mt-1">Preview not available</p>
        </div>
      </div>
    );
  };

  const handleRemoveFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFiles = filesWithPreview.filter((item) => item.id !== id);
    setFilesWithPreview(newFiles);
    onFilesReordered(newFiles.map((item) => item.file));
    if (newFiles.length === 0) { onClose(); return; }
    if (activeFileIndex >= newFiles.length) setActiveFileIndex(Math.max(0, newFiles.length - 1));
    toast.success('File removed');
  };

  return (
    <div className="w-full h-[500px] bg-[#0d0d0f] rounded-lg overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={22}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <MoveVertical className="h-4 w-4 text-indigo-400" />
                Arrange Files ({filesWithPreview.length})
              </h3>
              <p className="text-xs text-white/30 mt-0.5">Drag and drop to reorder</p>
            </div>
            <ScrollArea className="flex-grow">
              <ul className="p-2 space-y-1">
                {filesWithPreview.map((fileItem, index) => (
                  <li
                    key={fileItem.id}
                    draggable
                    onDragStart={() => handleDragStart(fileItem.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOver(null)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-grab border transition-all ${
                      draggedItemId === fileItem.id ? 'opacity-30' : ''
                    } ${
                      activeFileIndex === index ? 'bg-indigo-500/[0.10] border-indigo-500/30' : 'border-transparent hover:bg-white/[0.04]'
                    } ${dragOver === index && draggedItemId !== fileItem.id ? 'border-indigo-500/50 bg-indigo-500/[0.08]' : ''}`}
                    onClick={() => setActiveFileIndex(index)}
                  >
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">
                      {index + 1}
                    </div>
                    <div className="shrink-0">{getFileIcon(fileItem.file)}</div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-medium truncate text-white/60" title={fileItem.file.name}>
                        {fileItem.file.name}
                      </p>
                      <p className="text-[10px] text-white/25">
                        {getFileTypeLabel(fileItem.file.type)}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                        onClick={() => setActiveFileIndex(index)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                        onClick={(e) => handleRemoveFile(e, fileItem.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-white/[0.06] hover:bg-indigo-500/30 transition-colors" withHandle />

        <ResizablePanel defaultSize={70}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-400" />
                Preview
              </h3>
              {filesWithPreview.length > 0 && (
                <p className="text-xs text-white/30 mt-0.5">
                  {activeFileIndex + 1} of {filesWithPreview.length}: {filesWithPreview[activeFileIndex]?.file.name}
                </p>
              )}
            </div>
            <div className="flex-grow overflow-auto bg-white/[0.02]">
              {renderFilePreview()}
            </div>
            <div className="p-4 border-t border-white/[0.06] flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all"
              >
                Cancel
              </button>
              <Button
                className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 shadow-[0_4px_12px_rgba(94,106,210,0.4)]"
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
