"use client"

import React, { useRef, useState } from 'react';
import type { Annotation } from './types';
import { useEditorStore } from './store';
import { clamp } from './utils/coordinates';

interface Props {
  annotation: Annotation;
  pageWidth: number;
  pageHeight: number;
}

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLES: { key: Handle; cx: number; cy: number; cursor: string }[] = [
  { key: 'nw', cx: 0, cy: 0, cursor: 'nwse-resize' },
  { key: 'n',  cx: 0.5, cy: 0, cursor: 'ns-resize' },
  { key: 'ne', cx: 1, cy: 0, cursor: 'nesw-resize' },
  { key: 'e',  cx: 1, cy: 0.5, cursor: 'ew-resize' },
  { key: 'se', cx: 1, cy: 1, cursor: 'nwse-resize' },
  { key: 's',  cx: 0.5, cy: 1, cursor: 'ns-resize' },
  { key: 'sw', cx: 0, cy: 1, cursor: 'nesw-resize' },
  { key: 'w',  cx: 0, cy: 0.5, cursor: 'ew-resize' },
];

export const SelectionHandles: React.FC<Props> = ({ annotation, pageWidth, pageHeight }) => {
  const scale = useEditorStore((s) => s.scale);
  const update = useEditorStore((s) => s.updateAnnotation);

  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const [preview, setPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const onDown = (handle: Handle) => (e: React.PointerEvent) => {
    e.stopPropagation();
    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: annotation.x,
      origY: annotation.y,
      origW: annotation.w,
      origH: annotation.h,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    let { origX: x, origY: y, origW: w, origH: h } = d;
    const min = 8;

    if (d.handle.includes('e')) w = Math.max(min, d.origW + dx);
    if (d.handle.includes('s')) h = Math.max(min, d.origH + dy);
    if (d.handle.includes('w')) {
      const nw = Math.max(min, d.origW - dx);
      x = d.origX + (d.origW - nw);
      w = nw;
    }
    if (d.handle.includes('n')) {
      const nh = Math.max(min, d.origH - dy);
      y = d.origY + (d.origH - nh);
      h = nh;
    }

    x = clamp(x, 0, pageWidth - w);
    y = clamp(y, 0, pageHeight - h);
    setPreview({ x, y, w, h });
  };

  const onUp = () => {
    if (preview) update(annotation.id, preview);
    dragRef.current = null;
    setPreview(null);
  };

  const eff = preview ?? { x: annotation.x, y: annotation.y, w: annotation.w, h: annotation.h };
  const left = eff.x * scale;
  const top = eff.y * scale;
  const width = eff.w * scale;
  const height = eff.h * scale;

  return (
    <div className="absolute pointer-events-none" style={{ left, top, width, height }}>
      {HANDLES.map((h) => (
        <div
          key={h.key}
          onPointerDown={onDown(h.key)}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="absolute pointer-events-auto bg-white border-2 border-indigo-500 rounded-sm shadow"
          style={{
            width: 10,
            height: 10,
            left: `calc(${h.cx * 100}% - 5px)`,
            top: `calc(${h.cy * 100}% - 5px)`,
            cursor: h.cursor,
          }}
        />
      ))}
    </div>
  );
};
