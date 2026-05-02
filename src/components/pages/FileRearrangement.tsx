"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, MoveVertical, FileImage, FileText, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  files, onFilesReordered, onClose, onContinue,
}) => {
  const [items, setItems] = useState<FileWithPreview[]>(() =>
    files.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      id: crypto.randomUUID(),
    }))
  );
  const [dragId, setDragId]       = useState<string | null>(null);
  const [dragOver, setDragOver]   = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  /* ── drag handlers ──────────────────────────────────────────────── */
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragId === null || dragId === targetId) return;
    setDragOver(targetId);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((i) => i.id === dragId);
    const to   = items.findIndex((i) => i.id === targetId);
    if (from === -1 || to === -1) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    onFilesReordered(next.map((i) => i.file));
    setActiveIdx(to);
    setDragId(null);
    setDragOver(null);
  };

  const onDragEnd = () => { setDragId(null); setDragOver(null); };

  /* ── move helpers ───────────────────────────────────────────────── */
  const move = (e: React.MouseEvent, id: string, dir: 'up' | 'down') => {
    e.stopPropagation();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const next = [...items];
    const target = dir === 'up' ? Math.max(0, idx - 1) : Math.min(next.length - 1, idx + 1);
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    setItems(next);
    onFilesReordered(next.map((i) => i.file));
    setActiveIdx(target);
  };

  const remove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    onFilesReordered(next.map((i) => i.file));
    if (next.length === 0) { onClose(); return; }
    if (activeIdx >= next.length) setActiveIdx(next.length - 1);
    toast.success('File removed');
  };

  /* ── preview ────────────────────────────────────────────────────── */
  const FileIcon = ({ file }: { file: File }) => {
    if (file.type.startsWith('image/')) return <FileImage className="h-4 w-4 text-blue-400" />;
    if (file.type === 'application/pdf')  return <FileText  className="h-4 w-4 text-red-400"  />;
    return <FileText className="h-4 w-4 text-white/30" />;
  };

  const renderPreview = () => {
    if (items.length === 0) return <p className="text-sm text-white/30 text-center">No files</p>;
    const active = items[activeIdx];
    if (active.file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active.preview} alt={active.file.name} className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <FileIcon file={active.file} />
        <p className="text-sm text-white/60 font-medium leading-tight">{active.file.name}</p>
        <p className="text-xs text-white/25">{(active.file.size / (1024 * 1024)).toFixed(2)} MB · Preview unavailable</p>
      </div>
    );
  };

  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden border border-white/[0.07] bg-[#0b0b0e]">
      <ResizablePanelGroup direction="horizontal">

        {/* ── File list ─────────────────────────────────────────── */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full flex flex-col">

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
              <MoveVertical className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white/70">Arrange Files</p>
                <p className="text-[10px] text-white/25 mt-px">Drag rows or use arrows to reorder</p>
              </div>
              <span className="ml-auto text-[10px] font-semibold bg-white/[0.06] text-white/30 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
              <ul className="p-2 space-y-1">
                {items.map((item, idx) => {
                  const isDragging  = dragId    === item.id;
                  const isDropTarget = dragOver  === item.id;
                  const isActive    = activeIdx === idx;

                  return (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item.id)}
                      onDragOver={(e)  => onDragOver(e, item.id)}
                      onDrop={(e)      => onDrop(e, item.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => setActiveIdx(idx)}
                      className={cn(
                        'group relative flex items-center gap-2 px-2.5 py-2 rounded-xl border select-none transition-all duration-150 cursor-pointer',
                        isDragging   ? 'opacity-30 scale-[0.98]' : '',
                        isDropTarget ? 'border-indigo-500/50 bg-indigo-500/[0.07] shadow-[0_0_0_1px_rgba(99,102,241,0.3)]' : '',
                        isActive && !isDropTarget
                          ? 'bg-indigo-500/[0.09] border-indigo-500/25 text-white'
                          : !isDropTarget ? 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]' : ''
                      )}
                    >
                      {/* ── Drag handle — always visible ─────────── */}
                      <div className="shrink-0 text-white/20 group-hover:text-white/50 transition-colors cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Index badge */}
                      <span className="w-5 h-5 shrink-0 rounded-md bg-white/[0.05] flex items-center justify-center text-[10px] font-bold text-white/30">
                        {idx + 1}
                      </span>

                      {/* File icon */}
                      <div className="shrink-0">
                        <FileIcon file={item.file} />
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-white/60 group-hover:text-white/80 transition-colors" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-white/25 mt-px">
                          {(item.file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => move(e, item.id, 'up')}
                          disabled={idx === 0}
                          className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          title="Move up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => move(e, item.id, 'down')}
                          disabled={idx === items.length - 1}
                          className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          title="Move down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => remove(e, item.id)}
                          className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-white/[0.05] hover:bg-indigo-500/20 transition-colors w-px" withHandle />

        {/* ── Preview ───────────────────────────────────────────── */}
        <ResizablePanel defaultSize={65}>
          <div className="h-full flex flex-col">

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white/70">Preview</p>
                {items.length > 0 && (
                  <p className="text-[10px] text-white/25 mt-px truncate max-w-[240px]">
                    {activeIdx + 1} of {items.length} · {items[activeIdx]?.file.name}
                  </p>
                )}
              </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto bg-white/[0.015]">
              {renderPreview()}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-lg transition-all"
              >
                Cancel
              </button>
              <Button
                onClick={onContinue}
                disabled={items.length === 0}
                className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 shadow-[0_4px_16px_rgba(99,102,241,0.35)] px-5"
              >
                Continue →
              </Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default FileRearrangement;
