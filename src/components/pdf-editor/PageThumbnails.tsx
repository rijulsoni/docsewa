"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from './store';
import { renderPdfPage } from './hooks/use-pdf-document';
import { cn } from '@/lib/utils';

const THUMB_SCALE = 0.18;

interface Props {
  doc: Parameters<typeof renderPdfPage>[0];
}

export const PageThumbnails: React.FC<Props> = ({ doc }) => {
  const pages = useEditorStore((s) => s.pages);
  const annotations = useEditorStore((s) => s.annotations);
  const activePage = useEditorStore((s) => s.activePage);
  const setActivePage = useEditorStore((s) => s.setActivePage);
  const deletedPages = useEditorStore((s) => s.deletedPages);
  const pageRotations = useEditorStore((s) => s.pageRotations);

  // Track which page is closest to the top of the viewport via IntersectionObserver
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-page-index]'));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const idx = Number(visible[0].target.getAttribute('data-page-index'));
          if (!Number.isNaN(idx)) setActivePage(idx);
        }
      },
      { threshold: [0.1, 0.5, 0.9] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [pages.length, setActivePage]);

  const scrollToPage = (i: number) => {
    const el = document.querySelector<HTMLElement>(`[data-page-index="${i}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="w-[148px] shrink-0 overflow-y-auto overflow-x-hidden border-r border-white/[0.06] bg-[#08080b] py-3 px-3 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 px-1 mb-2">
        Pages
      </p>
      {pages.map((p, i) => {
        if (deletedPages.includes(i)) return null;
        const annCount = Object.values(annotations).filter((a) => a.pageIndex === i).length;
        return (
          <ThumbnailCard
            key={i}
            doc={doc}
            pageIndex={i}
            width={p.width}
            height={p.height}
            active={activePage === i}
            annCount={annCount}
            rotation={pageRotations[i] ?? 0}
            onClick={() => scrollToPage(i)}
          />
        );
      })}
    </aside>
  );
};

interface CardProps {
  doc: Parameters<typeof renderPdfPage>[0];
  pageIndex: number;
  width: number;
  height: number;
  active: boolean;
  annCount: number;
  rotation: number;
  onClick: () => void;
}

const ThumbnailCard: React.FC<CardProps> = ({ doc, pageIndex, width, height, active, annCount, rotation, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const [rendered, setRendered] = useState(false);

  // Lazy render when scrolled near
  useEffect(() => {
    if (rendered) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let activeTask: ReturnType<typeof renderPdfPage> | null = null;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !rendered && canvasRef.current && !activeTask) {
          activeTask = renderPdfPage(doc, pageIndex + 1, canvasRef.current, THUMB_SCALE);
          activeTask.promise
            .then(() => setRendered(true))
            .catch(() => {/* ignore */})
            .finally(() => {
              activeTask = null;
            });
        }
      },
      { rootMargin: '300px' },
    );
    obs.observe(wrapper);
    return () => {
      obs.disconnect();
      activeTask?.cancel();
    };
  }, [doc, pageIndex, rendered]);

  const isQuarter = rotation === 90 || rotation === 270;
  const w = Math.round((isQuarter ? height : width) * THUMB_SCALE);
  const h = Math.round((isQuarter ? width : height) * THUMB_SCALE);
  const innerW = Math.round(width * THUMB_SCALE);
  const innerH = Math.round(height * THUMB_SCALE);

  return (
    <button
      ref={wrapperRef}
      onClick={onClick}
      className={cn(
        'relative w-full flex flex-col items-center gap-1.5 group',
      )}
      title={`Go to page ${pageIndex + 1}`}
    >
      <div
        className={cn(
          'relative bg-white rounded-md overflow-hidden transition-all',
          active
            ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#08080b] shadow-[0_4px_20px_rgba(99,102,241,0.4)]'
            : 'ring-1 ring-white/[0.10] group-hover:ring-white/30 shadow-md',
        )}
        style={{ width: w, height: h }}
      >
        <div
          className="absolute origin-center"
          style={{
            width: innerW,
            height: innerH,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
        {annCount > 0 && (
          <span
            className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold shadow-sm"
            title={`${annCount} annotation${annCount > 1 ? 's' : ''}`}
          >
            {annCount}
          </span>
        )}
      </div>
      <span
        className={cn(
          'text-[11px] font-mono transition-colors',
          active ? 'text-indigo-300 font-semibold' : 'text-white/45 group-hover:text-white/70',
        )}
      >
        {pageIndex + 1}
      </span>
    </button>
  );
};
