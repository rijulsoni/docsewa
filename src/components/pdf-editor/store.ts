"use client"

import { create } from 'zustand';
import type { Annotation, PageInfo, Tool } from './types';

interface HistorySnapshot {
  annotations: Record<string, Annotation>;
}

interface EditorState {
  // Document
  pdfBytes: ArrayBuffer | null;
  pdfFileName: string | null;
  pages: PageInfo[];

  // View
  scale: number;

  // Tools
  tool: Tool;

  // Annotations
  annotations: Record<string, Annotation>;
  selectedId: string | null;

  // History
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions
  setDocument: (bytes: ArrayBuffer, fileName: string, pages: PageInfo[]) => void;
  clearDocument: () => void;
  setScale: (scale: number) => void;
  setTool: (tool: Tool) => void;
  addAnnotation: (a: Annotation) => void;
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  select: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

function snapshot(annotations: Record<string, Annotation>): HistorySnapshot {
  return { annotations: { ...annotations } };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  pdfBytes: null,
  pdfFileName: null,
  pages: [],
  scale: 1,
  tool: 'select',
  annotations: {},
  selectedId: null,
  past: [],
  future: [],

  setDocument: (pdfBytes, pdfFileName, pages) =>
    set({
      pdfBytes,
      pdfFileName,
      pages,
      annotations: {},
      selectedId: null,
      past: [],
      future: [],
    }),

  clearDocument: () =>
    set({
      pdfBytes: null,
      pdfFileName: null,
      pages: [],
      annotations: {},
      selectedId: null,
      past: [],
      future: [],
      tool: 'select',
    }),

  setScale: (scale) => set({ scale }),

  setTool: (tool) => set({ tool, selectedId: tool === 'select' ? get().selectedId : null }),

  addAnnotation: (a) => {
    const state = get();
    const past = [...state.past, snapshot(state.annotations)].slice(-MAX_HISTORY);
    set({
      annotations: { ...state.annotations, [a.id]: a },
      past,
      future: [],
      selectedId: a.id,
    });
  },

  updateAnnotation: (id, patch) => {
    const state = get();
    const existing = state.annotations[id];
    if (!existing) return;
    const past = [...state.past, snapshot(state.annotations)].slice(-MAX_HISTORY);
    set({
      annotations: { ...state.annotations, [id]: { ...existing, ...patch } as Annotation },
      past,
      future: [],
    });
  },

  deleteAnnotation: (id) => {
    const state = get();
    if (!state.annotations[id]) return;
    const past = [...state.past, snapshot(state.annotations)].slice(-MAX_HISTORY);
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
    const future = [snapshot(state.annotations), ...state.future].slice(0, MAX_HISTORY);
    set({
      annotations: previous.annotations,
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
    const past = [...state.past, snapshot(state.annotations)].slice(-MAX_HISTORY);
    set({
      annotations: next.annotations,
      past,
      future,
      selectedId: null,
    });
  },
}));

/** Stable id generator for new annotations. */
let counter = 0;
export function nextId(): string {
  counter += 1;
  return `a_${Date.now().toString(36)}_${counter.toString(36)}`;
}
