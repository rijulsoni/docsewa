"use client"
import React, { useState } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Lock, Download, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function strengthLabel(pw: string): { label: string; color: string } {
  if (!pw) return { label: '', color: '' };
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 1) return { label: 'Weak', color: 'text-red-400' };
  if (score === 2) return { label: 'Fair', color: 'text-amber-400' };
  if (score === 3) return { label: 'Good', color: 'text-blue-400' };
  return { label: 'Strong', color: 'text-emerald-400' };
}

export default function PdfProtectPage() {
  const [file, setFile]           = useState<File | null>(null);
  const [userPw, setUserPw]       = useState('');
  const [ownerPw, setOwnerPw]     = useState('');
  const [showUser, setShowUser]   = useState(false);
  const [showOwner, setShowOwner] = useState(false);
  const [allowPrint, setAllowPrint]   = useState(true);
  const [allowCopy, setAllowCopy]     = useState(true);
  const [allowModify, setAllowModify] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [done, setDone]           = useState(false);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files are supported.'); return; }
    setFile(f); setDone(false);
  };

  const handleProtect = async () => {
    if (!file) return;
    if (!userPw) { toast.error('Enter a user password.'); return; }
    setProcessing(true); setDone(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('userPassword', userPw);
      fd.append('ownerPassword', ownerPw || userPw);
      fd.append('allowPrinting', String(allowPrint));
      fd.append('allowCopying', String(allowCopy));
      fd.append('allowModifying', String(allowModify));
      const res = await fetch('/api/pdf-protect', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, '') + '_protected.pdf';
      a.click();
      setDone(true);
      toast.success('PDF protected!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to protect PDF.');
    } finally { setProcessing(false); }
  };

  const strength = strengthLabel(userPw);
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <ToolPageLayout
      title="PDF Password Protect"
      description="Add an open password and optional owner permissions — encrypts your PDF instantly."
      icon={<Lock className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'Add an open password that viewers must enter',
        'Separate owner password controls permissions',
        'Restrict printing, text copying, and modifying',
        'Runs server-side — passwords are never logged',
        'AES encryption via @cantoo/pdf-lib',
        'Compatible with all PDF readers',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept=".pdf"
          fileLabel="PDF"
          hint="Drop a PDF to encrypt with a password"
          accentClass="border-red-500/60 bg-red-500/[0.06] shadow-[0_0_40px_rgba(239,68,68,0.12)]"
          buttonClass="bg-red-500 hover:bg-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
          icon="file"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setDone(false); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Password fields */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">User Password <span className="text-red-400">*</span></p>
                {strength.label && <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>}
              </div>
              <div className="relative">
                <input
                  type={showUser ? 'text' : 'password'}
                  value={userPw}
                  onChange={(e) => setUserPw(e.target.value)}
                  placeholder="Required to open the PDF"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-red-500/40 pr-10"
                />
                <button type="button" onClick={() => setShowUser((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showUser ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                Owner Password <span className="text-white/20 font-normal normal-case">(optional)</span>
              </p>
              <div className="relative">
                <input
                  type={showOwner ? 'text' : 'password'}
                  value={ownerPw}
                  onChange={(e) => setOwnerPw(e.target.value)}
                  placeholder="Controls permissions — defaults to user password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-red-500/40 pr-10"
                />
                <button type="button" onClick={() => setShowOwner((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showOwner ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Permissions for viewer</p>
            <div className="space-y-2.5">
              {([
                ['Allow printing',      allowPrint,  setAllowPrint],
                ['Allow copying text',  allowCopy,   setAllowCopy],
                ['Allow modifying PDF', allowModify, setAllowModify],
              ] as [string, boolean, React.Dispatch<React.SetStateAction<boolean>>][]).map(([label, val, set]) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)}
                    className="accent-red-500 w-4 h-4 rounded" />
                  <span className="text-sm text-white/50">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleProtect}
            disabled={isProcessing || !userPw}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Encrypting…</>
              : done
              ? <><Download className="h-4 w-4" /> Download Again</>
              : <><Lock className="h-4 w-4" /> Protect &amp; Download</>}
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
