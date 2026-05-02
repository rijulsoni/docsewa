"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { LockOpen, Download, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function strengthLabel(pw: string): { label: string; color: string } {
  if (!pw) return { label: '', color: '' };
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 1) return { label: 'Weak', color: 'text-red-400' };
  if (score === 2) return { label: 'Fair', color: 'text-amber-400' };
  if (score === 3) return { label: 'Good', color: 'text-blue-400' };
  return { label: 'Strong', color: 'text-emerald-400' };
}

export default function PdfUnlockPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [done, setDone]         = useState(false);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setDone(false);
  };

  const handleUnlock = async () => {
    if (!file || !password) return;
    setProcessing(true); setDone(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('password', password);
      const res = await fetch('/api/pdf-unlock', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, '') + '_unlocked.pdf';
      a.click();
      setDone(true);
      toast.success('PDF unlocked!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unlock PDF.');
    } finally { setProcessing(false); }
  };

  const strength = strengthLabel(password);
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="PDF Password Unlock"
      description="Remove the open password from an encrypted PDF — enter the correct password and download an unlocked copy."
      icon={<LockOpen className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Remove open password from any encrypted PDF',
        'Enter the correct user password to decrypt',
        'Downloaded PDF opens without any password prompt',
        'Processed server-side — password never logged or stored',
        'Compatible with AES-128 and AES-256 encrypted PDFs',
        'Works on all standard PDF readers',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".pdf"
          fileLabel="PDF"
          hint="Drop an encrypted PDF to remove its password"
          accentClass="border-green-500/60 bg-green-500/[0.06] shadow-[0_0_40px_rgba(34,197,94,0.12)]"
          buttonClass="bg-green-500 hover:bg-green-400 shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <LockOpen className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setDone(false); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-green-400 hover:bg-green-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Password field */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Password <span className="text-green-400">*</span></p>
                {strength.label && <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>}
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the PDF open password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-green-500/40 pr-10"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isProcessing || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Unlocking…</>
              : done
              ? <><Download className="h-4 w-4" /> Download Again</>
              : <><LockOpen className="h-4 w-4" /> Unlock &amp; Download</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
