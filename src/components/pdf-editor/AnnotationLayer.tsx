"use client"

import React, { useRef, useState } from 'react';
import { useEditorStore, nextId } from './store';
import type { Annotation, Tool, Point } from './types';
import { AnnotationItem, AnnotationVisual } from './AnnotationItem';
import { SelectionHandles } from './SelectionHandles';
import { clamp } from './utils/coordinates';
import { cn } from '@/lib/utils';

const DRAG_THRESHOLD = 4; // PDF points

interface Props {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
}

/** Default styling for newly created annotations. Tunable per-tool. */
function buildAnnotation(
  tool: Tool,
  pageIndex: number,
  x: number,
  y: number,
  w: number,
  h: number,
  drawPath?: Point[],
  imageData?: { src: string; mime: 'image/png' | 'image/jpeg' },
): Annotation | null {
  const id = nextId();
  switch (tool) {
    case 'whiteout':
      return { type: 'whiteout', id, pageIndex, x, y, w, h };
    case 'redact':
      return { type: 'redaction', id, pageIndex, x, y, w, h };
    case 'text':
      return {
        type: 'text', id, pageIndex,
        x, y, w: Math.max(w, 120), h: Math.max(h, 28),
        text: '', fontSize: 16, color: '#111111', fontFamily: 'helvetica', background: null, backgroundOpacity: 0.85,
      };
    case 'rectangle':
      return { type: 'shape', id, pageIndex, x, y, w, h, shape: 'rectangle', stroke: '#ef4444', strokeWidth: 2, fill: null };
    case 'ellipse':
      return { type: 'shape', id, pageIndex, x, y, w, h, shape: 'ellipse', stroke: '#ef4444', strokeWidth: 2, fill: null };
    case 'line':
      return { type: 'shape', id, pageIndex, x, y, w, h, shape: 'line', stroke: '#ef4444', strokeWidth: 2 };
    case 'arrow':
      return { type: 'shape', id, pageIndex, x, y, w, h, shape: 'arrow', stroke: '#ef4444', strokeWidth: 2 };
    case 'check':
      return { type: 'mark', id, pageIndex, x, y, w: Math.max(w, 20), h: Math.max(h, 20), mark: 'check', color: '#16a34a', strokeWidth: 3 };
    case 'cross':
      return { type: 'mark', id, pageIndex, x, y, w: Math.max(w, 20), h: Math.max(h, 20), mark: 'cross', color: '#dc2626', strokeWidth: 3 };
    case 'pen':
      return drawPath
        ? { type: 'draw', id, pageIndex, x, y, w, h, mode: 'pen', path: drawPath, stroke: '#1d4ed8', strokeWidth: 2, opacity: 1 }
        : null;
    case 'highlighter':
      return drawPath
        ? { type: 'draw', id, pageIndex, x, y, w, h, mode: 'highlighter', path: drawPath, stroke: '#fde047', strokeWidth: 14, opacity: 0.45 }
        : null;
    case 'image':
      return imageData
        ? { type: 'image', id, pageIndex, x, y, w, h, src: imageData.src, mime: imageData.mime }
        : null;
    case 'signature':
      return imageData
        ? { type: 'image', id, pageIndex, x, y, w, h, src: imageData.src, mime: imageData.mime }
        : null;
    case 'note':
      return {
        type: 'note', id, pageIndex,
        x, y,
        w: Math.max(w, 140),
        h: Math.max(h, 90),
        text: '',
        background: '#fef3c7',
        color: '#451a03',
        fontSize: 13,
      };
    default:
      return null;
  }
}

interface DragRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  shiftKey: boolean;
}

interface DrawState {
  path: Point[];
  minX: number; minY: number; maxX: number; maxY: number;
}

export const AnnotationLayer: React.FC<Props> = ({ pageIndex, pageWidth, pageHeight }) => {
  const tool = useEditorStore((s) => s.tool);
  const scale = useEditorStore((s) => s.scale);
  const annotations = useEditorStore((s) => s.annotations);
  const selectedId = useEditorStore((s) => s.selectedId);
  const select = useEditorStore((s) => s.select);
  const addAnnotation = useEditorStore((s) => s.addAnnotation);
  const setTool = useEditorStore((s) => s.setTool);

  const layerRef = useRef<HTMLDivElement>(null);
  const [dragRect, setDragRect] = useState<DragRect | null>(null);
  const [drawState, setDrawState] = useState<DrawState | null>(null);

  const pageAnns = Object.values(annotations)
    .filter((a) => a.pageIndex === pageIndex)
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0) || a.id.localeCompare(b.id));
  const isCreationTool = tool !== 'select' && tool !== 'image' && tool !== 'signature' && tool !== 'stamp';
  const isDrawTool = tool === 'pen' || tool === 'highlighter';

  const layerCoords = (e: React.PointerEvent): { x: number; y: number } => {
    const rect = layerRef.current!.getBoundingClientRect();
    return {
      x: clamp((e.clientX - rect.left) / scale, 0, pageWidth),
      y: clamp((e.clientY - rect.top) / scale, 0, pageHeight),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Click on empty layer
    if (e.target !== layerRef.current) return; // bubbled from a child (annotation) — ignore
    if (tool === 'select') {
      select(null);
      return;
    }
    if (!isCreationTool) return;
    const { x, y } = layerCoords(e);
    layerRef.current!.setPointerCapture(e.pointerId);
    if (isDrawTool) {
      setDrawState({ path: [[0, 0]], minX: x, minY: y, maxX: x, maxY: y });
    } else {
      setDragRect({ startX: x, startY: y, endX: x, endY: y, shiftKey: e.shiftKey });
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (drawState) {
      const { x, y } = layerCoords(e);
      const minX = Math.min(drawState.minX, x);
      const minY = Math.min(drawState.minY, y);
      const maxX = Math.max(drawState.maxX, x);
      const maxY = Math.max(drawState.maxY, y);
      // Re-base path relative to current minX/minY
      const path: Point[] = [...drawState.path, [x, y]];
      setDrawState({ path, minX, minY, maxX, maxY });
      return;
    }
    if (dragRect) {
      const { x, y } = layerCoords(e);
      setDragRect({ ...dragRect, endX: x, endY: y, shiftKey: e.shiftKey });
    }
  };

  /** Apply Shift-constrain to a draft rect:
   *  - shapes/whiteout/text/image/redact: equal w & h (square / circle)
   *  - line/arrow: snap to nearest axis or 45°
   */
  const constrainRect = (r: DragRect, t: Tool): DragRect => {
    if (!r.shiftKey) return r;
    const dx = r.endX - r.startX;
    const dy = r.endY - r.startY;
    if (t === 'line' || t === 'arrow') {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const ratio = Math.min(adx, ady) / Math.max(adx, ady || 1);
      if (ratio < 0.4) {
        // Snap to dominant axis
        if (adx > ady) return { ...r, endY: r.startY };
        return { ...r, endX: r.startX };
      }
      // Snap to 45°: equalize abs dx/dy preserving sign
      const m = Math.max(adx, ady);
      return {
        ...r,
        endX: r.startX + Math.sign(dx) * m,
        endY: r.startY + Math.sign(dy) * m,
      };
    }
    // Square/circle: equal magnitudes
    const m = Math.max(Math.abs(dx), Math.abs(dy));
    return {
      ...r,
      endX: r.startX + Math.sign(dx || 1) * m,
      endY: r.startY + Math.sign(dy || 1) * m,
    };
  };

  const onPointerUp = () => {
    if (drawState) {
      const { minX, minY, maxX, maxY, path } = drawState;
      const w = maxX - minX;
      const h = maxY - minY;
      if (w >= DRAG_THRESHOLD || h >= DRAG_THRESHOLD) {
        // Convert absolute path to relative to (minX, minY)
        const rel: Point[] = path
          .filter((_, i) => i > 0) // drop placeholder first point
          .map(([px, py]) => [px - minX, py - minY] as Point);
        const ann = buildAnnotation(tool, pageIndex, minX, minY, Math.max(w, 4), Math.max(h, 4), rel);
        if (ann) addAnnotation(ann);
      }
      setDrawState(null);
      return;
    }
    if (dragRect) {
      const cr = constrainRect(dragRect, tool);
      const x = Math.min(cr.startX, cr.endX);
      const y = Math.min(cr.startY, cr.endY);
      const w = Math.abs(cr.endX - cr.startX);
      const h = Math.abs(cr.endY - cr.startY);
      if ((tool === 'line' || tool === 'arrow') ? (w >= DRAG_THRESHOLD || h >= DRAG_THRESHOLD) : (w >= DRAG_THRESHOLD && h >= DRAG_THRESHOLD)) {
        const ann = buildAnnotation(
          tool,
          pageIndex,
          x,
          y,
          tool === 'line' || tool === 'arrow' ? Math.max(w, 4) : w,
          tool === 'line' || tool === 'arrow' ? Math.max(h, 4) : h,
        );
        if (ann) {
          addAnnotation(ann);
          if (tool === 'text' || tool === 'note') {
            // After placing text/note, switch to select so user can immediately type
            setTool('select');
          }
          if (tool === 'check' || tool === 'cross') {
            setTool('select');
          }
        }
      } else if (tool === 'text') {
        // Click without drag → spawn a default-sized text box
        const ann = buildAnnotation(tool, pageIndex, x, y, 160, 28);
        if (ann) {
          addAnnotation(ann);
          setTool('select');
        }
      } else if (tool === 'note') {
        // Click without drag → spawn a default-sized sticky note
        const ann = buildAnnotation(tool, pageIndex, x, y, 160, 100);
        if (ann) {
          addAnnotation(ann);
          setTool('select');
        }
      } else if (tool === 'check' || tool === 'cross') {
        const ann = buildAnnotation(tool, pageIndex, x, y, 26, 26);
        if (ann) {
          addAnnotation(ann);
          setTool('select');
        }
      }
      setDragRect(null);
    }
  };

  const cursor =
    tool === 'select'
      ? 'default'
      : tool === 'image' || tool === 'signature'
      ? 'default'
      : isDrawTool
      ? 'crosshair'
      : 'crosshair';

  const layerWidth = pageWidth * scale;
  const layerHeight = pageHeight * scale;

  // Live drag preview rectangle (for shape/whiteout/text)
  let preview: React.ReactNode = null;
  if (dragRect) {
    const cr = constrainRect(dragRect, tool);
    const x = Math.min(cr.startX, cr.endX) * scale;
    const y = Math.min(cr.startY, cr.endY) * scale;
    const w = Math.abs(cr.endX - cr.startX) * scale;
    const h = Math.abs(cr.endY - cr.startY) * scale;
    if (tool === 'line' || tool === 'arrow') {
      const previewW = Math.max(w, 4 * scale);
      const previewH = Math.max(h, 4 * scale);
      preview = (
        <svg
          className="absolute pointer-events-none overflow-visible"
          style={{ left: x, top: y, width: previewW, height: previewH }}
        >
          {tool === 'arrow' && (
            <defs>
              <marker
                id="draft-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
              </marker>
            </defs>
          )}
          <line
            x1="0"
            y1="100%"
            x2="100%"
            y2="0"
            stroke="#818cf8"
            strokeWidth={2 * scale}
            strokeLinecap="round"
            markerEnd={tool === 'arrow' ? 'url(#draft-arrow)' : undefined}
          />
        </svg>
      );
    } else if (tool === 'check' || tool === 'cross') {
      preview = (
        <svg
          className="absolute pointer-events-none overflow-visible"
          style={{ left: x, top: y, width: Math.max(w, 20), height: Math.max(h, 20) }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {tool === 'check' ? (
            <path d="M 14 55 L 40 80 L 86 20" stroke="#4ade80" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <line x1="20" y1="20" x2="80" y2="80" stroke="#f87171" strokeWidth="10" strokeLinecap="round" />
              <line x1="80" y1="20" x2="20" y2="80" stroke="#f87171" strokeWidth="10" strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    } else {
      preview = (
        <div
          className={cn(
            'absolute pointer-events-none border border-indigo-400 bg-indigo-400/10',
            tool === 'whiteout' && 'bg-white/60 border-white',
            tool === 'redact' && 'bg-black/50 border-black',
          )}
          style={{ left: x, top: y, width: w, height: h }}
        />
      );
    }
  }

  // Live draw preview path
  let drawPreview: React.ReactNode = null;
  if (drawState && drawState.path.length > 1) {
    const isHighlighter = tool === 'highlighter';
    const stroke = isHighlighter ? '#fde047' : '#1d4ed8';
    const strokeWidth = isHighlighter ? 14 : 2;
    const opacity = isHighlighter ? 0.45 : 1;
    const d =
      `M ${drawState.path[1][0] * scale} ${drawState.path[1][1] * scale} ` +
      drawState.path.slice(2).map(([x, y]) => `L ${x * scale} ${y * scale}`).join(' ');
    drawPreview = (
      <svg
        className="absolute inset-0 pointer-events-none overflow-visible"
        width={layerWidth}
        height={layerHeight}
        style={{ opacity }}
      >
        <path d={d} stroke={stroke} strokeWidth={strokeWidth * scale} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const selected = selectedId ? annotations[selectedId] : null;
  const selectedOnThisPage = selected && selected.pageIndex === pageIndex ? selected : null;

  return (
    <div
      ref={layerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="absolute inset-0"
      style={{ width: layerWidth, height: layerHeight, cursor, touchAction: 'none' }}
    >
      {pageAnns.map((a) => (
        <AnnotationItem key={a.id} annotation={a} pageWidth={pageWidth} pageHeight={pageHeight} />
      ))}
      {preview}
      {drawPreview}
      {selectedOnThisPage && !selectedOnThisPage.locked && (
        <SelectionHandles annotation={selectedOnThisPage} pageWidth={pageWidth} pageHeight={pageHeight} />
      )}
    </div>
  );
};

// Suppress unused export warnings for AnnotationVisual (used elsewhere)
export { AnnotationVisual };
