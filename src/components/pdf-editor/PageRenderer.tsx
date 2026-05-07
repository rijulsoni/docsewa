"use client"

import React, { useEffect, useRef } from 'react';
import { renderPdfPage } from './hooks/use-pdf-document';
import { AnnotationLayer } from './AnnotationLayer';
import { useEditorStore } from './store';

interface Props {
  doc: Parameters<typeof renderPdfPage>[0];
  pageIndex: number;
  width: number;   // PDF points
  height: number;  // PDF points
}

export const PageRenderer: React.FC<Props> = ({ doc, pageIndex, width, height }) => {
  const scale = useEditorStore((s) => s.scale);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const task = renderPdfPage(doc, pageIndex + 1, canvasRef.current, scale);
    task.promise.catch((err) => console.error('PDF render error', err));
    return () => task.cancel();
  }, [doc, pageIndex, scale]);

  return (
    <div className="relative" data-page-index={pageIndex}>
      {/* Page number badge */}
      <div className="absolute -left-3 top-3 -translate-x-full hidden lg:flex items-center gap-2 z-10 pointer-events-none">
        <span className="inline-flex items-center justify-center min-w-[28px] h-[24px] px-2 rounded-full bg-white/[0.06] border border-white/[0.10] text-[11px] font-mono font-semibold text-white/55 backdrop-blur-sm">
          {pageIndex + 1}
        </span>
      </div>

      <div
        className="relative bg-white rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)]"
        style={{ width: width * scale, height: height * scale }}
      >
        <canvas ref={canvasRef} className="block rounded-md" />
        <AnnotationLayer pageIndex={pageIndex} pageWidth={width} pageHeight={height} />
      </div>
    </div>
  );
};
