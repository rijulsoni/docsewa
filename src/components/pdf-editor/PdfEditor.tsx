"use client"

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FileText, X, Type, Pencil, Highlighter, Square, Image as ImageIcon,
  PenLine, Eraser, ShieldCheck, Zap, Sparkles, Undo2, Redo2, ChevronUp, ChevronDown,
  Minus, StickyNote, Stamp, Check,
} from 'lucide-react';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { cn } from '@/lib/utils';
import { useEditorStore, nextId } from './store';
import { usePdfDocument } from './hooks/use-pdf-document';
import { PageRenderer } from './PageRenderer';
import { PageThumbnails } from './PageThumbnails';
import { Toolbar } from './Toolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { SignaturePad } from './SignaturePad';
import { StatusBar } from './StatusBar';
import { savePdfWithAnnotations, downloadPdfBytes } from './utils/save-pdf';

export const PdfEditor: React.FC = () => {
  const pdfBytes = useEditorStore((s) => s.pdfBytes);
  const pdfFileName = useEditorStore((s) => s.pdfFileName);
  const pages = useEditorStore((s) => s.pages);
  const annotations = useEditorStore((s) => s.annotations);
  const selectedId = useEditorStore((s) => s.selectedId);
  const pageRotations = useEditorStore((s) => s.pageRotations);
  const deletedPages = useEditorStore((s) => s.deletedPages);
  const setDocument = useEditorStore((s) => s.setDocument);
  const clearDocument = useEditorStore((s) => s.clearDocument);
  const addAnnotation = useEditorStore((s) => s.addAnnotation);
  const updateAnnotation = useEditorStore((s) => s.updateAnnotation);
  const duplicateAnnotation = useEditorStore((s) => s.duplicateAnnotation);
  const copyAnnotation = useEditorStore((s) => s.copyAnnotation);
  const pasteAnnotation = useEditorStore((s) => s.pasteAnnotation);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteAnn = useEditorStore((s) => s.deleteAnnotation);
  const setTool = useEditorStore((s) => s.setTool);
  const select = useEditorStore((s) => s.select);
  const hydrate = useEditorStore((s) => s.hydrate);

  const docState = usePdfDocument(pdfBytes);
  const [isSaving, setIsSaving] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  const placeQuickStamp = (text = 'DRAFT', color = '#dc2626') => {
    const activePage = useEditorStore.getState().activePage;
    const page = pages[activePage] ?? pages[0];
    const fontSize = 28;
    const w = Math.max(140, text.length * 14 + 32);
    const h = fontSize + 24;
    const x = page ? Math.max(0, (page.width - w) / 2) : 50;
    const y = page ? Math.max(0, (page.height - h) / 2) : 50;

    addAnnotation({
      type: 'stamp',
      id: nextId(),
      pageIndex: activePage,
      x,
      y,
      w,
      h,
      text,
      color,
      fontSize,
      rotation: -8,
    });
    setTool('select');
    toast.success(`${text} stamp placed`);
  };

  useEffect(() => {
    if (docState.status === 'ready' && docState.loaded && pages.length === 0 && pdfBytes && pdfFileName) {
      setDocument(pdfBytes, pdfFileName, docState.loaded.pages);
    }
  }, [docState, pages.length, pdfBytes, pdfFileName, setDocument]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (typing) return;
      const cmd = e.ctrlKey || e.metaKey;

      // Save (Ctrl/Cmd + S)
      if (cmd && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault();
        // We trigger save via a synthetic click on the toolbar — but easier to call directly.
        void onSave();
        return;
      }

      // Undo / redo
      if (cmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }

      // Duplicate selected annotation
      if (cmd && e.key.toLowerCase() === 'c' && selectedId) {
        e.preventDefault();
        copyAnnotation(selectedId);
        toast.success('Annotation copied');
        return;
      }

      if (cmd && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteAnnotation();
        return;
      }

      if (cmd && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        duplicateAnnotation(selectedId);
        return;
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteAnn(selectedId);
        return;
      }

      // Arrow-key nudge for selected annotation
      if (selectedId && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const a = useEditorStore.getState().annotations[selectedId];
        if (!a) return;
        if (a.locked) return;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        updateAnnotation(selectedId, { x: a.x + dx, y: a.y + dy });
        return;
      }

      // Page navigation
      if (e.key === 'PageDown' || (e.key === 'ArrowDown' && !selectedId && cmd)) {
        e.preventDefault();
        scrollToPage(useEditorStore.getState().activePage + 1);
        return;
      }
      if (e.key === 'PageUp' || (e.key === 'ArrowUp' && !selectedId && cmd)) {
        e.preventDefault();
        scrollToPage(useEditorStore.getState().activePage - 1);
        return;
      }

      if (e.key === 'Escape') {
        select(null);
        return;
      }

      // Tool shortcuts
      const map: Record<string, string> = {
        v: 'select', t: 'text', p: 'pen', h: 'highlighter', r: 'rectangle',
        o: 'ellipse', l: 'line', a: 'arrow', i: 'image', w: 'whiteout',
        b: 'redact', s: 'signature', n: 'note', m: 'stamp', c: 'check', x: 'cross',
      };
      const toolKey = map[e.key.toLowerCase()];
      if (toolKey) {
        e.preventDefault();
        if (toolKey === 'image') {
          // toolbar handles via file input
        } else if (toolKey === 'signature') {
          setSignOpen(true);
        } else if (toolKey === 'stamp') {
          placeQuickStamp();
        } else {
          setTool(toolKey as Parameters<typeof setTool>[0]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redo, undo, deleteAnn, select, setTool, selectedId, updateAnnotation, duplicateAnnotation, copyAnnotation, pasteAnnotation]);

  const onUpload = async (files: File[]) => {
    const f = files[0];
    if (!f || f.type !== 'application/pdf') {
      toast.error('Please upload a PDF.');
      return;
    }
    const buf = await f.arrayBuffer();
    setDocument(buf, f.name, []);
    toast.success(`Loaded ${f.name}`);
  };

  const onSave = async () => {
    if (!pdfBytes) return;
    setIsSaving(true);
    try {
      const bytes = await savePdfWithAnnotations(
        pdfBytes,
        pages,
        Object.values(annotations),
        pageRotations,
        deletedPages,
      );
      const downloadName = (pdfFileName ?? 'document.pdf').replace(/\.pdf$/i, '_edited.pdf');
      downloadPdfBytes(bytes, downloadName);
      toast.success('PDF saved!');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save annotations + page mutations to localStorage, keyed by file fingerprint.
  const autoSaveKey = pdfFileName && pdfBytes ? `docsewa:pdf-editor:${pdfFileName}:${pdfBytes.byteLength}` : null;
  useEffect(() => {
    if (!autoSaveKey) return;
    if (Object.keys(annotations).length === 0 && Object.keys(pageRotations).length === 0 && deletedPages.length === 0) {
      // Nothing to save — clear any prior state for this fingerprint
      try { localStorage.removeItem(autoSaveKey); } catch { /* ignore */ }
      return;
    }
    try {
      localStorage.setItem(
        autoSaveKey,
        JSON.stringify({ annotations, pageRotations, deletedPages, savedAt: Date.now() }),
      );
    } catch {
      /* quota exceeded — ignore */
    }
  }, [autoSaveKey, annotations, pageRotations, deletedPages]);

  // Restore previously saved state once the PDF finishes loading.
  const [restoredFor, setRestoredFor] = useState<string | null>(null);
  useEffect(() => {
    if (!autoSaveKey || restoredFor === autoSaveKey) return;
    if (docState.status !== 'ready') return;
    if (Object.keys(annotations).length > 0 || Object.keys(pageRotations).length > 0 || deletedPages.length > 0) {
      setRestoredFor(autoSaveKey);
      return;
    }
    try {
      const raw = localStorage.getItem(autoSaveKey);
      if (!raw) { setRestoredFor(autoSaveKey); return; }
      const parsed = JSON.parse(raw);
      if (parsed?.annotations || parsed?.pageRotations || parsed?.deletedPages) {
        hydrate({
          annotations: parsed.annotations ?? {},
          pageRotations: parsed.pageRotations ?? {},
          deletedPages: parsed.deletedPages ?? [],
        });
        const annCount = Object.keys(parsed.annotations ?? {}).length;
        toast.success(`Restored ${annCount} previous annotation${annCount === 1 ? '' : 's'}`);
      }
    } catch {
      /* ignore parse errors */
    }
    setRestoredFor(autoSaveKey);
  }, [autoSaveKey, docState.status, restoredFor, annotations, pageRotations, deletedPages, hydrate]);

  const onSignatureConfirmed = (dataUrl: string) => {
    // Drop the signature near the bottom-center of the currently visible page
    const activePage = useEditorStore.getState().activePage;
    const page = pages[activePage] ?? pages[0];
    const w = 200;
    const h = 80;
    const x = page ? Math.max(0, (page.width - w) / 2) : 50;
    const y = page ? Math.max(0, page.height - h - 60) : 50;
    addAnnotation({
      type: 'image',
      id: nextId(),
      pageIndex: activePage,
      x,
      y,
      w,
      h,
      src: dataUrl,
      mime: 'image/png',
    });
    // Switch to Select so the signature is immediately draggable
    setTool('select');
    toast.success('Signature placed — drag to reposition');
  };

  if (!pdfBytes) return <WelcomeScreen onUpload={onUpload} />;

  if (docState.status === 'loading' || docState.status === 'idle') {
    return (
      <div className="flex items-center justify-center py-20 text-white/55">
        Loading PDF…
      </div>
    );
  }
  if (docState.status === 'error') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-red-300 mb-3">Failed to load PDF: {docState.error}</p>
        <button
          onClick={clearDocument}
          className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-semibold"
        >
          Try another file
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar: file info + toolbar */}
      <div className="px-4 pt-3 space-y-2">
        <div className="flex items-center justify-between text-[11.5px] text-white/65 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <span className="truncate font-semibold text-white max-w-[420px]">{pdfFileName}</span>
            <span className="text-white/35 font-mono">
              {pages.length} page{pages.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={clearDocument}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>

        <Toolbar onSave={onSave} onSign={() => setSignOpen(true)} isSaving={isSaving} />
      </div>

      {/* Three-column: thumbnails | pages | properties */}
      <div className="flex-1 flex gap-0 overflow-hidden mt-3 min-h-0">
        {docState.loaded && <PageThumbnails doc={docState.loaded.doc} />}

        {/* Pages canvas area */}
        <div
          className="relative flex-1 overflow-auto"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '24px 24px, 16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        >
          {/* Floating undo/redo cluster — sticky to viewport top-right of canvas area */}
          <div className="sticky top-3 z-20 flex justify-end pr-4 pointer-events-none">
            <FloatingHistoryCluster />
          </div>

          <div className="flex flex-col items-center gap-8 py-2 pb-12 px-4 lg:px-12 -mt-10">
            {docState.loaded && pages.map((p, i) => (
              <PageRenderer
                key={i}
                doc={docState.loaded!.doc}
                pageIndex={i}
                width={p.width}
                height={p.height}
              />
            ))}
          </div>
        </div>

        {/* Properties */}
        <aside className="hidden lg:block w-[280px] shrink-0 overflow-y-auto border-l border-white/[0.06] bg-[#08080b]">
          <PropertiesPanel />
        </aside>
      </div>

      <StatusBar />

      <SignaturePad
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onConfirm={onSignatureConfirmed}
      />
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

function scrollToPage(pageIndex: number) {
  const el = document.querySelector<HTMLElement>(`[data-page-index="${pageIndex}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Floating history + page nav cluster (in canvas area) ──────────────────

const FloatingHistoryCluster: React.FC = () => {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const pages = useEditorStore((s) => s.pages);
  const activePage = useEditorStore((s) => s.activePage);
  const deletedPages = useEditorStore((s) => s.deletedPages);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Find prev/next non-deleted page
  const findVisible = (start: number, dir: 1 | -1): number | null => {
    let i = start;
    while (i >= 0 && i < pages.length) {
      if (!deletedPages.includes(i)) return i;
      i += dir;
    }
    return null;
  };
  const prevPage = findVisible(activePage - 1, -1);
  const nextPage = findVisible(activePage + 1, 1);
  const visibleCount = pages.length - deletedPages.length;
  const visiblePosition = pages.slice(0, activePage + 1).filter((_, i) => !deletedPages.includes(i)).length;

  return (
    <div className="pointer-events-auto inline-flex items-center gap-0.5 p-1 rounded-xl border border-white/[0.10] bg-[#0a0a0d]/85 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <FloatingButton
        title={`Undo${canUndo ? ` · ${past.length} step${past.length === 1 ? '' : 's'}` : ''} (⌘Z)`}
        disabled={!canUndo}
        onClick={undo}
        accent={canUndo}
      >
        <Undo2 className="h-4 w-4" />
      </FloatingButton>
      {canUndo && (
        <span className="text-[10px] font-mono font-bold text-white/40 tabular-nums px-1 select-none">
          {past.length}
        </span>
      )}
      <FloatingButton
        title={`Redo${canRedo ? ` · ${future.length} step${future.length === 1 ? '' : 's'}` : ''} (⌘⇧Z)`}
        disabled={!canRedo}
        onClick={redo}
        accent={canRedo}
      >
        <Redo2 className="h-4 w-4" />
      </FloatingButton>
      {canRedo && (
        <span className="text-[10px] font-mono font-bold text-white/40 tabular-nums px-1 select-none">
          {future.length}
        </span>
      )}

      <div className="w-px h-5 bg-white/[0.08] mx-1" />

      <FloatingButton
        title="Previous page (PageUp)"
        disabled={prevPage === null}
        onClick={() => prevPage !== null && scrollToPage(prevPage)}
      >
        <ChevronUp className="h-4 w-4" />
      </FloatingButton>
      <span className="text-[10px] font-mono font-bold text-white/55 tabular-nums px-1.5 select-none">
        {visiblePosition}/{visibleCount}
      </span>
      <FloatingButton
        title="Next page (PageDown)"
        disabled={nextPage === null}
        onClick={() => nextPage !== null && scrollToPage(nextPage)}
      >
        <ChevronDown className="h-4 w-4" />
      </FloatingButton>
    </div>
  );
};

const FloatingButton: React.FC<{
  title: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, disabled, accent, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'h-8 w-8 flex items-center justify-center rounded-lg transition-all',
      disabled
        ? 'text-white/20 cursor-not-allowed'
        : accent
        ? 'text-indigo-200 hover:text-white hover:bg-indigo-500/15'
        : 'text-white/55 hover:text-white hover:bg-white/[0.06]',
    )}
  >
    {children}
  </button>
);

// ── Welcome screen ─────────────────────────────────────────────────────────

interface WelcomeProps {
  onUpload: (files: File[]) => void;
}

const FEATURES = [
  { icon: <Type className="h-4 w-4" />,        label: 'Add text',     desc: 'Click anywhere to type', color: 'from-indigo-500 to-violet-600' },
  { icon: <StickyNote className="h-4 w-4" />,  label: 'Sticky notes',  desc: 'Add editable comments', color: 'from-amber-400 to-orange-500' },
  { icon: <Pencil className="h-4 w-4" />,      label: 'Draw',         desc: 'Pen and freehand strokes', color: 'from-blue-500 to-cyan-600' },
  { icon: <Highlighter className="h-4 w-4" />, label: 'Highlight',    desc: 'Mark important content', color: 'from-amber-400 to-yellow-500' },
  { icon: <Minus className="h-4 w-4" />,       label: 'Lines',        desc: 'Line and arrow markup', color: 'from-sky-500 to-blue-600' },
  { icon: <Square className="h-4 w-4" />,      label: 'Shapes',       desc: 'Rectangles and circles', color: 'from-rose-500 to-pink-600' },
  { icon: <ImageIcon className="h-4 w-4" />,   label: 'Insert image', desc: 'Drop in any PNG or JPG', color: 'from-emerald-500 to-teal-600' },
  { icon: <PenLine className="h-4 w-4" />,     label: 'Sign',         desc: 'Draw your signature', color: 'from-purple-500 to-fuchsia-600' },
  { icon: <Stamp className="h-4 w-4" />,       label: 'Stamps',       desc: 'Draft, approved, paid, more', color: 'from-cyan-500 to-indigo-600' },
  { icon: <Check className="h-4 w-4" />,       label: 'Form marks',   desc: 'Add check and cross marks', color: 'from-lime-500 to-emerald-600' },
  { icon: <Eraser className="h-4 w-4" />,      label: 'Whiteout',     desc: 'Cover anything you want gone', color: 'from-slate-400 to-slate-500' },
  { icon: <Square className="h-4 w-4" />,      label: 'Blackout',     desc: 'Cover sensitive areas', color: 'from-zinc-500 to-neutral-700' },
  { icon: <Sparkles className="h-4 w-4" />,    label: 'Save & flatten', desc: 'Download a finished PDF', color: 'from-indigo-400 to-purple-500' },
];

const WelcomeScreen: React.FC<WelcomeProps> = ({ onUpload }) => (
  <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    {/* Ambient glow */}
    <div
      aria-hidden
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none -z-10 opacity-60"
      style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18), transparent 70%)' }}
    />

    <div className="text-center ds-float-in">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.10] bg-white/[0.04] text-[11px] text-white/65 backdrop-blur-sm mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Free · No sign-up · Private
      </div>
      <h1 className="text-3xl sm:text-5xl font-extrabold gradient-text leading-[1.04] mb-3 tracking-tight">
        PDF Editor
      </h1>
      <p className="text-sm sm:text-[15px] text-white/65 max-w-xl mx-auto leading-relaxed mb-8">
        One canvas, every annotation. Add text, sign, draw, whiteout, insert images — and save a finished PDF.
        <span className="block text-white/85 font-medium mt-1">All in your browser. Your file never leaves your device.</span>
      </p>

      <div className="ds-float-in" style={{ animationDelay: '80ms' }}>
        <div className="max-w-xl mx-auto">
          <UploadDropzone
            onFiles={onUpload}
            accept="application/pdf"
            fileLabel="PDF"
            hint="Drop a PDF or click to browse"
            accentClass="border-indigo-500/60 bg-indigo-500/[0.08] shadow-[0_0_60px_rgba(99,102,241,0.20)]"
            buttonClass="bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-[0_8px_30px_rgba(99,102,241,0.45)]"
            icon="file"
          />
        </div>
      </div>

      {/* Trust row */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-5 text-[11px] text-white/55 font-medium ds-float-in" style={{ animationDelay: '160ms' }}>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          Files never uploaded
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          Instant
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" />
          No watermarks
        </span>
      </div>
    </div>

    {/* Feature grid */}
    <div className="mt-12 sm:mt-16 ds-float-in" style={{ animationDelay: '240ms' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 text-center mb-5">
        Everything you can do
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="relative group p-4 rounded-2xl border border-white/[0.06] bg-white/[0.018] hover:bg-white/[0.045] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-md mb-2.5`}>
              {f.icon}
            </div>
            <p className="text-[13px] font-bold text-white/90">{f.label}</p>
            <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
