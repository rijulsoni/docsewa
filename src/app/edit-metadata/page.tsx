"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Tag, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function EditMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle]       = useState('');
  const [author, setAuthor]     = useState('');
  const [subject, setSubject]   = useState('');
  const [keywords, setKeywords] = useState('');
  const [creator, setCreator]   = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setResultUrl(null);
  };

  const handleApply = async () => {
    if (!file) { toast.error('Please select a PDF file.'); return; }
    if (!title && !author && !subject && !keywords && !creator) {
      toast.error('Fill in at least one metadata field.'); return;
    }
    setIsProcessing(true); setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title',    title);
      fd.append('author',   author);
      fd.append('subject',  subject);
      fd.append('keywords', keywords);
      fd.append('creator',  creator);
      const res = await fetch('/api/edit-metadata', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
      toast.success('Metadata updated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update metadata.');
    } finally { setIsProcessing(false); }
  };

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const Field = ({ label, value, onChange, placeholder, hint }: {
    label: string; value: string; onChange: (v: string) => void; placeholder: string; hint?: string;
  }) => (
    <div>
      <p className="text-xs text-white/40 mb-1.5">
        {label} {hint && <span className="text-white/20">{hint}</span>}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
      />
    </div>
  );

  return (
    <ToolPageLayout
      title="Edit Metadata"
      description="Set the title, author, subject, and keywords embedded in your PDF's document properties."
      icon={<Tag className="h-7 w-7" />}
      accentColor="rgba(6,182,212,0.35)"
      features={[
        'Edit Title, Author, Subject, Keywords, Creator',
        'Metadata visible in PDF viewers and search engines',
        'Only filled fields are updated — others unchanged',
        'Modification date is updated automatically',
        'Processed server-side with pdf-lib',
        'Works on any standard PDF',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="application/pdf"
          fileLabel="PDF"
          hint="Drop a PDF — update its embedded document properties"
          accentClass="border-cyan-500/60 bg-cyan-500/[0.06] shadow-[0_0_40px_rgba(6,182,212,0.12)]"
          buttonClass="bg-cyan-500 hover:bg-cyan-400 shadow-[0_4px_16px_rgba(6,182,212,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setResultUrl(null); }} className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-white/70">Document properties</p>
            <p className="text-xs text-white/30 -mt-2">Leave fields blank to keep existing values.</p>

            <Field label="Title"    value={title}    onChange={setTitle}    placeholder="e.g. Annual Report 2025" />
            <Field label="Author"   value={author}   onChange={setAuthor}   placeholder="e.g. Jane Smith" />
            <Field label="Subject"  value={subject}  onChange={setSubject}  placeholder="e.g. Financial Summary" />
            <Field label="Keywords" value={keywords} onChange={setKeywords} placeholder="e.g. finance, 2025, Q4" hint="— comma-separated" />
            <Field label="Creator"  value={creator}  onChange={setCreator}  placeholder="e.g. DocSewa" />
          </div>

          {resultUrl && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-300">Metadata updated</p>
              </div>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = resultUrl!; a.download = 'updated-metadata.pdf'; a.click(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(6,182,212,0.3)]"
          >
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : <><Tag className="h-4 w-4" /> Save Metadata</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
