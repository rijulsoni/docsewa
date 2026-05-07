"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Trash2, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
}

export const SignaturePad: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [hasInk, setHasInk] = useState(false);

  const init = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    if (open) {
      // Allow canvas to mount
      requestAnimationFrame(init);
      setHasInk(false);
    }
  }, [open]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPos.current = p;
    setHasInk(true);
  };
  const onUp = () => {
    isDrawing.current = false;
  };

  const clear = () => {
    init();
    setHasInk(false);
  };

  const confirm = () => {
    if (!hasInk || !canvasRef.current) return;
    // Trim and produce a transparent-bg PNG by compositing onto a fresh canvas without the bg fill (we already use white-text-on-transparent canvas).
    onConfirm(canvasRef.current.toDataURL('image/png'));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-[#0a0a0d] border-white/[0.08] overflow-hidden [&>button:last-child]:hidden">
        <VisuallyHidden><DialogTitle>Draw signature</DialogTitle></VisuallyHidden>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white">Draw your signature</p>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <canvas
            ref={canvasRef}
            width={560}
            height={180}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            className="w-full rounded-xl border border-white/[0.10] bg-white cursor-crosshair touch-none"
            style={{ touchAction: 'none', height: 180 }}
          />
          {!hasInk && (
            <p className="text-xs text-white/35 text-center">Sign above with mouse, finger, or stylus</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={clear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.10] text-white/55 hover:text-white text-sm font-semibold transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
            <div className="flex-1" />
            <button
              onClick={confirm}
              disabled={!hasInk}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Check className="h-3.5 w-3.5" /> Place signature
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
