"use client"

import { useEffect, useState } from 'react';
import type { PageInfo } from '../types';

// pdfjs-dist types
type PdfRenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

type PdfPageProxy = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    canvas?: HTMLCanvasElement;
  }) => PdfRenderTask;
};

type PdfDocumentProxy = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPageProxy>;
};

interface LoadedPdf {
  doc: PdfDocumentProxy;
  pages: PageInfo[];
}

interface State {
  status: 'idle' | 'loading' | 'ready' | 'error';
  loaded: LoadedPdf | null;
  error: string | null;
}

const initial: State = { status: 'idle', loaded: null, error: null };

/** Loads a PDF from ArrayBuffer using pdfjs-dist and exposes per-page info + the doc proxy. */
export function usePdfDocument(pdfBytes: ArrayBuffer | null) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    if (!pdfBytes) {
      setState(initial);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setState({ status: 'loading', loaded: null, error: null });
        const pdfjs = await import('pdfjs-dist');
        // Locally hosted worker (copied from node_modules/pdfjs-dist/build/) so it always
        // matches the API version and doesn't depend on a flaky CDN path.
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const doc = (await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise) as unknown as PdfDocumentProxy;
        const pages: PageInfo[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          pages.push({ width: vp.width, height: vp.height });
        }
        if (cancelled) return;
        setState({ status: 'ready', loaded: { doc, pages }, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: 'error',
          loaded: null,
          error: err instanceof Error ? err.message : 'Failed to load PDF',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfBytes]);

  return state;
}

/**
 * Start rendering a PDF page into the given canvas at the given scale.
 * Returns a handle whose .cancel() aborts the render so the canvas can
 * be reused safely (e.g. when scale changes mid-render in StrictMode).
 */
export function renderPdfPage(
  doc: PdfDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number,
): { promise: Promise<void>; cancel: () => void } {
  let cancelled = false;
  let task: PdfRenderTask | null = null;

  const promise = (async () => {
    const page = await doc.getPage(pageNum);
    if (cancelled) return;
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx || cancelled) return;
    task = page.render({ canvasContext: ctx, viewport, canvas });
    try {
      await task.promise;
    } catch (err) {
      // pdfjs throws RenderingCancelledException when we cancel — that's expected
      const name = (err as { name?: string })?.name;
      if (name !== 'RenderingCancelledException') throw err;
    }
  })();

  return {
    promise,
    cancel: () => {
      cancelled = true;
      task?.cancel();
    },
  };
}
