"use client"

import React, { useRef, useState } from 'react';
import type { Annotation } from './types';
import { useEditorStore } from './store';
import { clampRect } from './utils/coordinates';

interface Props {
  annotation: Annotation;
  pageWidth: number;   // PDF points
  pageHeight: number;  // PDF points
}

/** Renders a single annotation positioned in PDF coords scaled to screen via store.scale.
 *  When tool='select', click selects, drag moves. Otherwise non-interactive (layer handles creation). */
export const AnnotationItem: React.FC<Props> = ({ annotation, pageWidth, pageHeight }) => {
  const scale = useEditorStore((s) => s.scale);
  const tool = useEditorStore((s) => s.tool);
  const selectedId = useEditorStore((s) => s.selectedId);
  const select = useEditorStore((s) => s.select);
  const updateAnnotation = useEditorStore((s) => s.updateAnnotation);

  const isSelected = selectedId === annotation.id;
  const interactive = tool === 'select';

  const ref = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ pointerId: number; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    select(annotation.id);
    if (annotation.type === 'text' && isSelected) return; // don't move while editing text
    dragStart.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: annotation.x,
      origY: annotation.y,
    };
    ref.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = (e.clientX - dragStart.current.startX) / scale;
    const dy = (e.clientY - dragStart.current.startY) / scale;
    setDragOffset({ dx, dy });
  };

  const onPointerUp = () => {
    if (!dragStart.current) return;
    if (dragOffset) {
      const next = clampRect(
        dragStart.current.origX + dragOffset.dx,
        dragStart.current.origY + dragOffset.dy,
        annotation.w,
        annotation.h,
        pageWidth,
        pageHeight,
      );
      updateAnnotation(annotation.id, { x: next.x, y: next.y });
    }
    dragStart.current = null;
    setDragOffset(null);
  };

  // Effective on-screen position (with drag preview offset)
  const left = (annotation.x + (dragOffset?.dx ?? 0)) * scale;
  const top = (annotation.y + (dragOffset?.dy ?? 0)) * scale;
  const width = annotation.w * scale;
  const height = annotation.h * scale;

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={
        'absolute' +
        (interactive ? ' cursor-move' : ' pointer-events-none')
      }
      style={{ left, top, width, height }}
    >
      <AnnotationVisual annotation={annotation} scale={scale} />
      {isSelected && (
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ width: '100%', height: '100%' }}
          aria-hidden
        >
          <rect
            x="-1"
            y="-1"
            width="calc(100% + 2px)"
            height="calc(100% + 2px)"
            className="ds-selection-rect"
            rx="2"
          />
        </svg>
      )}
    </div>
  );
};

/** Renders just the visual content of an annotation (no positioning, no interactivity). */
export const AnnotationVisual: React.FC<{ annotation: Annotation; scale: number }> = ({ annotation, scale }) => {
  switch (annotation.type) {
    case 'whiteout':
      return <div className="absolute inset-0 bg-white" />;

    case 'text': {
      const a = annotation;
      return (
        <div
          className="absolute inset-0 flex"
          style={{
            color: a.color,
            fontSize: a.fontSize * scale,
            fontWeight: a.bold ? 700 : 400,
            fontStyle: a.italic ? 'italic' : 'normal',
            lineHeight: 1.2,
            fontFamily: 'Helvetica, Arial, sans-serif',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 2,
          }}
        >
          {a.text || <span className="text-white/30">Type…</span>}
        </div>
      );
    }

    case 'shape': {
      const a = annotation;
      const sw = a.strokeWidth * scale;
      if (a.shape === 'rectangle') {
        return (
          <div
            className="absolute inset-0"
            style={{
              border: `${sw}px solid ${a.stroke}`,
              background: a.fill ?? 'transparent',
            }}
          />
        );
      }
      if (a.shape === 'ellipse') {
        return (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `${sw}px solid ${a.stroke}`,
              background: a.fill ?? 'transparent',
            }}
          />
        );
      }
      // Arrow: line from top-left to bottom-right of the box, with arrowhead
      return (
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <marker
              id={`arrow-${a.id}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={a.stroke} />
            </marker>
          </defs>
          <line
            x1="0"
            y1="100%"
            x2="100%"
            y2="0"
            stroke={a.stroke}
            strokeWidth={sw}
            markerEnd={`url(#arrow-${a.id})`}
          />
        </svg>
      );
    }

    case 'draw': {
      const a = annotation;
      if (a.path.length < 2) return null;
      const sw = a.strokeWidth * scale;
      const d =
        `M ${a.path[0][0] * scale} ${a.path[0][1] * scale} ` +
        a.path.slice(1).map(([x, y]) => `L ${x * scale} ${y * scale}`).join(' ');
      return (
        <svg
          className="absolute inset-0 overflow-visible"
          width={a.w * scale}
          height={a.h * scale}
          style={{ opacity: a.opacity }}
        >
          <path d={d} stroke={a.stroke} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    case 'image': {
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={annotation.src}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        />
      );
    }

    default:
      return null;
  }
};
