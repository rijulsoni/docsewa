"use client"

import { create } from 'zustand';
import type { Annotation, PageInfo, Tool } from './types';

interface HistorySnapshot {
  // Snapshots include both annotations and page mutations so undo restores everything together.
  annotations: Record<string, Annotation>;
  pageRotations: Record<number, number>;
  deletedPages: number[];
}

type AlignTarget = 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom';

interface EditorState {
  // Document
  pdfBytes: ArrayBuffer | null;
  pdfFileName: string | null;
  pages: PageInfo[];

  // View
  scale: number;
  activePage: number;

  // Tools
  tool: Tool;

  // Annotations
  annotations: Record<string, Annotation>;
  selectedId: string | null;
  clipboard: Annotation | null;

  // Page mutations (applied at save time)
  pageRotations: Record<number, number>; // pageIndex -> degrees (0/90/180/270)
  deletedPages: number[];                 // pageIndices

  // History
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions
  setDocument: (bytes: ArrayBuffer, fileName: string, pages: PageInfo[]) => void;
  clearDocument: () => void;
  setScale: (scale: number) => void;
  setActivePage: (n: number) => void;
  setTool: (tool: Tool) => void;
  addAnnotation: (a: Annotation) => void;
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  duplicateAnnotation: (id: string) => void;
  copyAnnotation: (id: string) => void;
  pasteAnnotation: () => void;
  toggleAnnotationLock: (id: string) => void;
  bringAnnotationForward: (id: string) => void;
  sendAnnotationBackward: (id: string) => void;
  bringAnnotationToFront: (id: string) => void;
  sendAnnotationToBack: (id: string) => void;
  centerAnnotation: (id: string, axis: 'x' | 'y' | 'both') => void;
  alignAnnotation: (id: string, target: AlignTarget) => void;
  applyAnnotationToAllPages: (id: string) => void;
  clearAnnotations: () => void;
  rotatePage: (pageIndex: number, direction?: 1 | -1) => void;
  rotateAllPages: (direction?: 1 | -1) => void;
  deletePage: (pageIndex: number) => void;
  restorePage: (pageIndex: number) => void;
  restoreAllPages: () => void;
  clearAllEdits: () => void;
  /** Replace all live state (used by auto-save restore). */
  hydrate: (snapshot: HistorySnapshot) => void;
  select: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

function snapshot(s: {
  annotations: Record<string, Annotation>;
  pageRotations: Record<number, number>;
  deletedPages: number[];
}): HistorySnapshot {
  return {
    annotations: { ...s.annotations },
    pageRotations: { ...s.pageRotations },
    deletedPages: [...s.deletedPages],
  };
}

function maxZ(annotations: Record<string, Annotation>, pageIndex?: number): number {
  return Object.values(annotations)
    .filter((a) => pageIndex === undefined || a.pageIndex === pageIndex)
    .reduce((max, a) => Math.max(max, a.zIndex ?? 0), 0);
}

function clampAnnotationToPage(a: Annotation, page?: PageInfo): Annotation {
  if (!page) return a;
  return {
    ...a,
    x: Math.max(0, Math.min(a.x, Math.max(0, page.width - a.w))),
    y: Math.max(0, Math.min(a.y, Math.max(0, page.height - a.h))),
  } as Annotation;
}

function cloneAnnotationForPage(
  source: Annotation,
  pageIndex: number,
  page: PageInfo | undefined,
  zIndex: number,
): Annotation {
  return clampAnnotationToPage(
    {
      ...source,
      id: nextId(),
      pageIndex,
      zIndex,
    } as Annotation,
    page,
  );
}

export const useEditorStore = create<EditorState>((set, get) => ({
  pdfBytes: null,
  pdfFileName: null,
  pages: [],
  scale: 1,
  activePage: 0,
  tool: 'select',
  annotations: {},
  selectedId: null,
  clipboard: null,
  pageRotations: {},
  deletedPages: [],
  past: [],
  future: [],

  setDocument: (pdfBytes, pdfFileName, pages) =>
    set({
      pdfBytes,
      pdfFileName,
      pages,
      activePage: 0,
      annotations: {},
      selectedId: null,
      clipboard: null,
      pageRotations: {},
      deletedPages: [],
      past: [],
      future: [],
    }),

  clearDocument: () =>
    set({
      pdfBytes: null,
      pdfFileName: null,
      pages: [],
      activePage: 0,
      annotations: {},
      selectedId: null,
      clipboard: null,
      pageRotations: {},
      deletedPages: [],
      past: [],
      future: [],
      tool: 'select',
    }),

  setScale: (scale) => set({ scale }),
  setActivePage: (activePage) => set({ activePage }),

  setTool: (tool) => set({ tool, selectedId: tool === 'select' ? get().selectedId : null }),

  addAnnotation: (a) => {
    const state = get();
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    const annotation = {
      ...a,
      zIndex: a.zIndex ?? maxZ(state.annotations, a.pageIndex) + 1,
    } as Annotation;
    set({
      annotations: { ...state.annotations, [annotation.id]: annotation },
      past,
      future: [],
      selectedId: annotation.id,
    });
  },

  updateAnnotation: (id, patch) => {
    const state = get();
    const existing = state.annotations[id];
    if (!existing) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: { ...state.annotations, [id]: { ...existing, ...patch } as Annotation },
      past,
      future: [],
    });
  },

  deleteAnnotation: (id) => {
    const state = get();
    if (!state.annotations[id]) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    const next = { ...state.annotations };
    delete next[id];
    set({
      annotations: next,
      past,
      future: [],
      selectedId: state.selectedId === id ? null : state.selectedId,
    });
  },

  select: (selectedId) => set({ selectedId }),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    const past = state.past.slice(0, -1);
    const future = [snapshot(state), ...state.future].slice(0, MAX_HISTORY);
    set({
      annotations: previous.annotations,
      pageRotations: previous.pageRotations,
      deletedPages: previous.deletedPages,
      past,
      future,
      selectedId: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const next = state.future[0];
    const future = state.future.slice(1);
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: next.annotations,
      pageRotations: next.pageRotations,
      deletedPages: next.deletedPages,
      past,
      future,
      selectedId: null,
    });
  },

  duplicateAnnotation: (id) => {
    const state = get();
    const src = state.annotations[id];
    if (!src) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    const offset = 14;
    const copy = clampAnnotationToPage(
      {
        ...src,
        id: nextId(),
        x: src.x + offset,
        y: src.y + offset,
        locked: false,
        zIndex: maxZ(state.annotations, src.pageIndex) + 1,
      } as Annotation,
      state.pages[src.pageIndex],
    );
    set({
      annotations: { ...state.annotations, [copy.id]: copy },
      past,
      future: [],
      selectedId: copy.id,
    });
  },

  copyAnnotation: (id) => {
    const state = get();
    const src = state.annotations[id];
    if (!src) return;
    set({ clipboard: { ...src } as Annotation });
  },

  pasteAnnotation: () => {
    const state = get();
    const src = state.clipboard;
    if (!src || state.pages.length === 0) return;
    const targetPage = state.deletedPages.includes(state.activePage)
      ? state.pages.findIndex((_, i) => !state.deletedPages.includes(i))
      : state.activePage;
    if (targetPage < 0) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    const copy = clampAnnotationToPage(
      {
        ...src,
        id: nextId(),
        pageIndex: targetPage,
        x: src.x + 18,
        y: src.y + 18,
        locked: false,
        zIndex: maxZ(state.annotations, targetPage) + 1,
      } as Annotation,
      state.pages[targetPage],
    );
    set({
      annotations: { ...state.annotations, [copy.id]: copy },
      past,
      future: [],
      selectedId: copy.id,
      activePage: targetPage,
    });
  },

  toggleAnnotationLock: (id) => {
    const state = get();
    const current = state.annotations[id];
    if (!current) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: {
        ...state.annotations,
        [id]: { ...current, locked: !current.locked } as Annotation,
      },
      past,
      future: [],
    });
  },

  bringAnnotationForward: (id) => {
    const state = get();
    const current = state.annotations[id];
    if (!current) return;
    const pageAnns = Object.values(state.annotations)
      .filter((a) => a.pageIndex === current.pageIndex)
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0) || a.id.localeCompare(b.id));
    const index = pageAnns.findIndex((a) => a.id === id);
    const next = pageAnns[index + 1];
    if (!next) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: {
        ...state.annotations,
        [current.id]: { ...current, zIndex: next.zIndex ?? index + 1 } as Annotation,
        [next.id]: { ...next, zIndex: current.zIndex ?? index } as Annotation,
      },
      past,
      future: [],
    });
  },

  sendAnnotationBackward: (id) => {
    const state = get();
    const current = state.annotations[id];
    if (!current) return;
    const pageAnns = Object.values(state.annotations)
      .filter((a) => a.pageIndex === current.pageIndex)
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0) || a.id.localeCompare(b.id));
    const index = pageAnns.findIndex((a) => a.id === id);
    const previous = pageAnns[index - 1];
    if (!previous) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: {
        ...state.annotations,
        [current.id]: { ...current, zIndex: previous.zIndex ?? index - 1 } as Annotation,
        [previous.id]: { ...previous, zIndex: current.zIndex ?? index } as Annotation,
      },
      past,
      future: [],
    });
  },

  bringAnnotationToFront: (id) => {
    const state = get();
    const current = state.annotations[id];
    if (!current) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: {
        ...state.annotations,
        [id]: { ...current, zIndex: maxZ(state.annotations, current.pageIndex) + 1 } as Annotation,
      },
      past,
      future: [],
    });
  },

  sendAnnotationToBack: (id) => {
    const state = get();
    const current = state.annotations[id];
    if (!current) return;
    const min = Object.values(state.annotations)
      .filter((a) => a.pageIndex === current.pageIndex)
      .reduce((lowest, a) => Math.min(lowest, a.zIndex ?? 0), 0);
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: {
        ...state.annotations,
        [id]: { ...current, zIndex: min - 1 } as Annotation,
      },
      past,
      future: [],
    });
  },

  centerAnnotation: (id, axis) => {
    const state = get();
    const current = state.annotations[id];
    const page = current ? state.pages[current.pageIndex] : null;
    if (!current || !page) return;
    const patch: Partial<Annotation> = {};
    if (axis === 'x' || axis === 'both') patch.x = Math.max(0, (page.width - current.w) / 2);
    if (axis === 'y' || axis === 'both') patch.y = Math.max(0, (page.height - current.h) / 2);
    get().updateAnnotation(id, patch);
  },

  alignAnnotation: (id, target) => {
    const state = get();
    const current = state.annotations[id];
    const page = current ? state.pages[current.pageIndex] : null;
    if (!current || !page) return;
    const patch: Partial<Annotation> = {};
    if (target === 'left') patch.x = 0;
    if (target === 'center-x') patch.x = Math.max(0, (page.width - current.w) / 2);
    if (target === 'right') patch.x = Math.max(0, page.width - current.w);
    if (target === 'top') patch.y = 0;
    if (target === 'center-y') patch.y = Math.max(0, (page.height - current.h) / 2);
    if (target === 'bottom') patch.y = Math.max(0, page.height - current.h);
    get().updateAnnotation(id, patch);
  },

  applyAnnotationToAllPages: (id) => {
    const state = get();
    const source = state.annotations[id];
    if (!source) return;
    const visiblePages = state.pages
      .map((_, pageIndex) => pageIndex)
      .filter((pageIndex) => !state.deletedPages.includes(pageIndex) && pageIndex !== source.pageIndex);
    if (visiblePages.length === 0) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    const copies: Record<string, Annotation> = {};
    for (const pageIndex of visiblePages) {
      const copy = cloneAnnotationForPage(
        source,
        pageIndex,
        state.pages[pageIndex],
        maxZ({ ...state.annotations, ...copies }, pageIndex) + 1,
      );
      copies[copy.id] = copy;
    }
    set({
      annotations: { ...state.annotations, ...copies },
      past,
      future: [],
      selectedId: id,
    });
  },

  clearAnnotations: () => {
    const state = get();
    if (Object.keys(state.annotations).length === 0) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({ annotations: {}, selectedId: null, past, future: [] });
  },

  rotatePage: (pageIndex, direction = 1) => {
    const state = get();
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    const cur = state.pageRotations[pageIndex] ?? 0;
    const next = (cur + direction * 90 + 360) % 360;
    const pageRotations = { ...state.pageRotations };
    if (next === 0) delete pageRotations[pageIndex];
    else pageRotations[pageIndex] = next;
    set({ pageRotations, past, future: [] });
  },

  rotateAllPages: (direction = 1) => {
    const state = get();
    if (state.pages.length === 0) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    const pageRotations = { ...state.pageRotations };
    state.pages.forEach((_, pageIndex) => {
      if (state.deletedPages.includes(pageIndex)) return;
      const cur = pageRotations[pageIndex] ?? 0;
      const next = (cur + direction * 90 + 360) % 360;
      if (next === 0) delete pageRotations[pageIndex];
      else pageRotations[pageIndex] = next;
    });
    set({ pageRotations, past, future: [] });
  },

  deletePage: (pageIndex) => {
    const state = get();
    if (state.deletedPages.includes(pageIndex)) return;
    if (state.deletedPages.length + 1 >= state.pages.length) return; // refuse to delete last
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      deletedPages: [...state.deletedPages, pageIndex],
      past,
      future: [],
    });
  },

  restorePage: (pageIndex) => {
    const state = get();
    if (!state.deletedPages.includes(pageIndex)) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      deletedPages: state.deletedPages.filter((p) => p !== pageIndex),
      past,
      future: [],
    });
  },

  restoreAllPages: () => {
    const state = get();
    if (state.deletedPages.length === 0) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({ deletedPages: [], past, future: [] });
  },

  clearAllEdits: () => {
    const state = get();
    if (
      Object.keys(state.annotations).length === 0 &&
      Object.keys(state.pageRotations).length === 0 &&
      state.deletedPages.length === 0
    ) return;
    const past = [...state.past, snapshot(state)].slice(-MAX_HISTORY);
    set({
      annotations: {},
      selectedId: null,
      pageRotations: {},
      deletedPages: [],
      past,
      future: [],
      tool: 'select',
    });
  },

  hydrate: (snap) => {
    set({
      annotations: snap.annotations,
      pageRotations: snap.pageRotations,
      deletedPages: snap.deletedPages,
      selectedId: null,
      past: [],
      future: [],
    });
  },
}));

/** Stable id generator for new annotations. */
let counter = 0;
export function nextId(): string {
  counter += 1;
  return `a_${Date.now().toString(36)}_${counter.toString(36)}`;
}
