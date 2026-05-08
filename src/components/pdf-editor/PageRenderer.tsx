"use client"

import React, { useEffect, useRef } from 'react';
import { renderPdfPage } from './hooks/use-pdf-document';
import { AnnotationLayer } from './AnnotationLayer';
import { useEditorStore } from './store';
import { RotateCcw, RotateCw, Trash2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  doc: Parameters<typeof renderPdfPage>[0];
  pageIndex: number;
  width: number;   // PDF points (unrotated)
  height: number;  // PDF points (unrotated)
}

export const PageRenderer: React.FC<Props> = ({ doc, pageIndex, width, height }) => {
  const scale = useEditorStore((s) => s.scale);
  const rotation = useEditorStore((s) => s.pageRotations[pageIndex] ?? 0);
  const isDeleted = useEditorStore((s) => s.deletedPages.includes(pageIndex));
  const rotatePage = useEditorStore((s) => s.rotatePage);
  const deletePage = useEditorStore((s) => s.deletePage);
  const restorePage = useEditorStore((s) => s.restorePage);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || isDeleted) return;
    const task = renderPdfPage(doc, pageIndex + 1, canvasRef.current, scale);
    task.promise.catch((err) => console.error('PDF render error', err));
    return () => task.cancel();
  }, [doc, pageIndex, scale, isDeleted]);

  // For rotated pages, swap displayed dimensions so layout reflects orientation
  const isQuarter = rotation === 90 || rotation === 270;
  const displayWidth = (isQuarter ? height : width) * scale;
  const displayHeight = (isQuarter ? width : height) * scale;
  const innerWidth = width * scale;
  const innerHeight = height * scale;

  if (isDeleted) {
    return (
      <div
        data-page-index={pageIndex}
        className="relative mx-auto rounded-md border border-dashed border-red-500/30 bg-red-500/[0.04] flex items-center justify-center text-red-300/80"
        style={{ width: displayWidth, height: 80 }}
      >
        <div className="flex items-center gap-3">
          <Trash2 className="h-4 w-4" />
          <span className="text-[12px] font-semibold">Page {pageIndex + 1} removed</span>
          <button
            onClick={() => restorePage(pageIndex)}
            className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-[11px] font-semibold text-white/80 transition-colors"
          >
            <Undo2 className="h-3 w-3" /> Restore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group" data-page-index={pageIndex}>
      {/* Page number badge */}
      <div className="absolute -left-3 top-3 -translate-x-full hidden lg:flex items-center gap-2 z-10 pointer-events-none">
        <span className="inline-flex items-center justify-center min-w-[28px] h-[24px] px-2 rounded-full bg-white/[0.06] border border-white/[0.10] text-[11px] font-mono font-semibold text-white/55 backdrop-blur-sm">
          {pageIndex + 1}
        </span>
      </div>

      {/* Hover page toolbar */}
      <div className="absolute -right-3 top-3 translate-x-full hidden lg:flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <PageActionButton
          title={`Rotate page left · ${rotation}° → ${(rotation + 270) % 360}°`}
          onClick={() => rotatePage(pageIndex, -1)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </PageActionButton>
        <PageActionButton
          title={`Rotate page right · ${rotation}° → ${(rotation + 90) % 360}°`}
          onClick={() => rotatePage(pageIndex, 1)}
        >
          <RotateCw className="h-3.5 w-3.5" />
        </PageActionButton>
        <PageActionButton
          title="Delete page"
          variant="danger"
          onClick={() => deletePage(pageIndex)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </PageActionButton>
      </div>

      {/* Outer rotated frame; inner stays in original coords so annotations align */}
      <div
        className="relative bg-white rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
        style={{ width: displayWidth, height: displayHeight }}
      >
        <div
          className="absolute origin-center"
          style={{
            width: innerWidth,
            height: innerHeight,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          }}
        >
          <canvas ref={canvasRef} className="block rounded-md" />
          <AnnotationLayer pageIndex={pageIndex} pageWidth={width} pageHeight={height} />
        </div>
      </div>
    </div>
  );
};

const PageActionButton: React.FC<{
  title: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  children: React.ReactNode;
}> = ({ title, onClick, variant, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      'h-8 w-8 flex items-center justify-center rounded-lg border backdrop-blur-md transition-all shadow-md',
      variant === 'danger'
        ? 'border-red-500/30 bg-red-500/[0.10] text-red-300 hover:bg-red-500/20 hover:border-red-400/50'
        : 'border-white/[0.12] bg-[#0a0a0d]/85 text-white/70 hover:text-white hover:bg-white/[0.10]',
    )}
  >
    {children}
  </button>
);
