"use client"

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FileText, X, Type, Pencil, Highlighter, Square, Image as ImageIcon,
  PenLine, Eraser, ShieldCheck, Zap, Sparkles,
} from 'lucide-react';
import UploadDropzone from '@/components/pages/UploadDropzone';
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
  const setDocument = useEditorStore((s) => s.setDocument);
  const clearDocument = useEditorStore((s) => s.clearDocument);
  const addAnnotation = useEditorStore((s) => s.addAnnotation);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteAnn = useEditorStore((s) => s.deleteAnnotation);
  const setTool = useEditorStore((s) => s.setTool);
  const select = useEditorStore((s) => s.select);

  const docState = usePdfDocument(pdfBytes);
  const [isSaving, setIsSaving] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteAnn(selectedId);
        return;
      }
      if (e.key === 'Escape') {
        select(null);
        return;
      }
      const map: Record<string, string> = {
        v: 'select', t: 'text', p: 'pen', h: 'highlighter', r: 'rectangle',
        o: 'ellipse', a: 'arrow', i: 'image', w: 'whiteout', s: 'signature',
      };
      const tool = map[e.key.toLowerCase()];
      if (tool) {
        e.preventDefault();
        if (tool === 'image') {
          // toolbar handles
        } else if (tool === 'signature') {
          setSignOpen(true);
        } else {
          setTool(tool as Parameters<typeof setTool>[0]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [redo, undo, deleteAnn, select, setTool, selectedId]);

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
      const bytes = await savePdfWithAnnotations(pdfBytes, pages, Object.values(annotations));
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

  const onSignatureConfirmed = (dataUrl: string) => {
    addAnnotation({
      type: 'image',
      id: nextId(),
      pageIndex: 0,
      x: 50,
      y: 50,
      w: 200,
      h: 80,
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
          className="flex-1 overflow-auto"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '24px 24px, 16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        >
          <div className="flex flex-col items-center gap-8 py-8 px-4 lg:px-12">
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

// ── Welcome screen ─────────────────────────────────────────────────────────

interface WelcomeProps {
  onUpload: (files: File[]) => void;
}

const FEATURES = [
  { icon: <Type className="h-4 w-4" />,        label: 'Add text',     desc: 'Click anywhere to type', color: 'from-indigo-500 to-violet-600' },
  { icon: <Pencil className="h-4 w-4" />,      label: 'Draw',         desc: 'Pen and freehand strokes', color: 'from-blue-500 to-cyan-600' },
  { icon: <Highlighter className="h-4 w-4" />, label: 'Highlight',    desc: 'Mark important content', color: 'from-amber-400 to-yellow-500' },
  { icon: <Square className="h-4 w-4" />,      label: 'Shapes',       desc: 'Rectangles, circles, arrows', color: 'from-rose-500 to-pink-600' },
  { icon: <ImageIcon className="h-4 w-4" />,   label: 'Insert image', desc: 'Drop in any PNG or JPG', color: 'from-emerald-500 to-teal-600' },
  { icon: <PenLine className="h-4 w-4" />,     label: 'Sign',         desc: 'Draw your signature', color: 'from-purple-500 to-fuchsia-600' },
  { icon: <Eraser className="h-4 w-4" />,      label: 'Whiteout',     desc: 'Cover anything you want gone', color: 'from-slate-400 to-slate-500' },
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
