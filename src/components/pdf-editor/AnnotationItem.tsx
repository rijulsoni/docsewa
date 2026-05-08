"use client"

import React, { useEffect, useRef, useState } from 'react';
import type { Annotation } from './types';
import { useEditorStore } from './store';
import { clampRect } from './utils/coordinates';

interface Props {
  annotation: Annotation;
  pageWidth: number;   // PDF points
  pageHeight: number;  // PDF points
}

function fontFamilyCss(family?: string) {
  if (family === 'times') return 'Times New Roman, Times, serif';
  if (family === 'courier') return 'Courier New, Courier, monospace';
  return 'Helvetica, Arial, sans-serif';
}

function colorWithOpacity(color: string | null | undefined, opacity = 1) {
  if (!color) return 'transparent';
  const match = /^#?([0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return color;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
  const [editing, setEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);

  // Exit edit mode when this annotation is deselected
  useEffect(() => {
    if (!isSelected && editing) setEditing(false);
  }, [isSelected, editing]);

  // Focus the contentEditable when entering edit mode
  useEffect(() => {
    if (editing && editableRef.current) {
      const el = editableRef.current;
      el.focus();
      // Move caret to end
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
    }
  }, [editing]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    if (editing) return; // pass through to caret placement in contentEditable
    e.stopPropagation();
    select(annotation.id);
    if (annotation.locked) return;
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

  const canInlineEdit = annotation.type === 'text' || annotation.type === 'note' || annotation.type === 'stamp';

  const onDoubleClick = (e: React.MouseEvent) => {
    if (!canInlineEdit || !interactive) return;
    e.stopPropagation();
    select(annotation.id);
    setEditing(true);
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

  const isEditableText = canInlineEdit && editing;

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      className={
        'absolute' +
        (interactive ? (isEditableText ? ' cursor-text' : annotation.locked ? ' cursor-default' : ' cursor-move') : ' pointer-events-none')
      }
      style={{ left, top, width, height }}
    >
      {isEditableText && (annotation.type === 'text' || annotation.type === 'note' || annotation.type === 'stamp') ? (
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            updateAnnotation(annotation.id, { text: e.currentTarget.innerText } as Partial<Annotation>);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setEditing(false);
            }
            e.stopPropagation();
          }}
          className="absolute inset-0 outline-none whitespace-pre-wrap break-words"
          style={{
            color: annotation.color,
            fontSize: annotation.fontSize * scale,
            fontWeight: annotation.type === 'text' ? (annotation.bold ? 700 : 400) : annotation.type === 'stamp' ? 800 : 400,
            fontStyle: annotation.type === 'text' && annotation.italic ? 'italic' : 'normal',
            textTransform: annotation.type === 'stamp' ? 'uppercase' : 'none',
            letterSpacing: annotation.type === 'stamp' ? '0.10em' : 'normal',
            lineHeight: 1.2,
            fontFamily: annotation.type === 'text' ? fontFamilyCss(annotation.fontFamily) : 'Helvetica, Arial, sans-serif',
            opacity: annotation.opacity ?? 1,
            padding: annotation.type === 'note' ? 6 * scale : 2,
            background: annotation.type === 'note'
              ? annotation.background
              : annotation.type === 'stamp'
              ? 'rgba(99, 102, 241, 0.06)'
              : colorWithOpacity(annotation.background, annotation.backgroundOpacity ?? 0.85) || 'rgba(99, 102, 241, 0.08)',
            boxShadow: 'inset 0 0 0 1.5px #818cf8',
            borderRadius: 2,
          }}
        >
          {annotation.text}
        </div>
      ) : (
        <div className="absolute inset-0" style={{ opacity: annotation.opacity ?? 1 }}>
          <AnnotationVisual annotation={annotation} scale={scale} />
        </div>
      )}
      {isSelected && !isEditableText && (
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

    case 'redaction':
      return <div className="absolute inset-0 bg-black" />;

    case 'mark': {
      const a = annotation;
      const sw = a.strokeWidth * scale;
      return (
        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {a.mark === 'check' ? (
            <path
              d="M 14 55 L 40 80 L 86 20"
              stroke={a.color}
              strokeWidth={sw}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <line x1="20" y1="20" x2="80" y2="80" stroke={a.color} strokeWidth={sw} strokeLinecap="round" />
              <line x1="80" y1="20" x2="20" y2="80" stroke={a.color} strokeWidth={sw} strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    }

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
            fontFamily: fontFamilyCss(a.fontFamily),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 2,
            background: colorWithOpacity(a.background, a.backgroundOpacity ?? 0.85),
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
      if (a.shape === 'line') {
        return (
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            <line
              x1="0"
              y1="100%"
              x2="100%"
              y2="0"
              stroke={a.stroke}
              strokeWidth={sw}
              strokeLinecap="round"
            />
          </svg>
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
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={annotation.src}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        />
      );
    }

    case 'note': {
      const a = annotation;
      return (
        <div
          className="absolute inset-0 rounded-md flex"
          style={{
            background: a.background,
            color: a.color,
            fontSize: a.fontSize * scale,
            lineHeight: 1.25,
            fontFamily: 'Helvetica, Arial, sans-serif',
            padding: 6 * scale,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: `0 ${2 * scale}px ${5 * scale}px rgba(0,0,0,0.18), inset 0 ${1 * scale}px 0 rgba(255,255,255,0.55)`,
          }}
        >
          {/* Folded-corner detail */}
          <span
            aria-hidden
            className="absolute top-0 right-0 pointer-events-none"
            style={{
              width: 0,
              height: 0,
              borderTop: `${10 * scale}px solid rgba(0,0,0,0.10)`,
              borderLeft: `${10 * scale}px solid transparent`,
            }}
          />
          {a.text || <span style={{ opacity: 0.5 }}>Note…</span>}
        </div>
      );
    }

    case 'stamp': {
      const a = annotation;
      const rotate = a.rotation ?? 0;
      return (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${rotate}deg)` }}
        >
          <div
            className="px-3 py-1.5 inline-flex items-center justify-center font-extrabold uppercase tracking-[0.10em]"
            style={{
              color: a.color,
              fontSize: a.fontSize * scale,
              border: `${Math.max(2, 3 * scale)}px solid ${a.color}`,
              borderRadius: 4 * scale,
              background: 'transparent',
              fontFamily: 'Helvetica, Arial, sans-serif',
              boxShadow: `inset 0 0 0 ${1 * scale}px ${a.color}`,
              whiteSpace: 'nowrap',
            }}
          >
            {a.text}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
