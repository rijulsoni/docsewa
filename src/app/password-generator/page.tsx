"use client"
import React, { useState, useCallback, useEffect } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { KeyRound, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean; noAmbiguous: boolean }): string {
  let chars = '';
  if (opts.upper)   chars += opts.noAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lower)   chars += opts.noAmbiguous ? 'abcdefghjkmnpqrstuvwxyz'  : 'abcdefghijklmnopqrstuvwxyz';
  if (opts.numbers) chars += opts.noAmbiguous ? '23456789' : '0123456789';
  if (opts.symbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((n) => chars[n % chars.length]).join('');
}

function getStrength(pw: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 20) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: 'Weak',      color: 'bg-red-500',    width: 'w-1/4' };
  if (score <= 3) return { label: 'Fair',      color: 'bg-amber-500',  width: 'w-2/4' };
  if (score <= 4) return { label: 'Strong',    color: 'bg-blue-500',   width: 'w-3/4' };
  return             { label: 'Very Strong', color: 'bg-emerald-500', width: 'w-full' };
}

export default function PasswordGeneratorPage() {
  const [length,      setLength]      = useState(16);
  const [upper,       setUpper]       = useState(true);
  const [lower,       setLower]       = useState(true);
  const [numbers,     setNumbers]     = useState(true);
  const [symbols,     setSymbols]     = useState(false);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [password,    setPassword]    = useState('');

  const generate = useCallback(() => {
    setPassword(generatePassword(length, { upper, lower, numbers, symbols, noAmbiguous }));
  }, [length, upper, lower, numbers, symbols, noAmbiguous]);

  useEffect(() => { generate(); }, [generate]);

  const copy = () => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied!');
  };

  const strength = password ? getStrength(password) : null;

  const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </div>
      <span className="text-sm text-white/60">{label}</span>
    </label>
  );

  return (
    <ToolPageLayout
      title="Password Generator"
      description="Generate cryptographically secure passwords with custom length, character sets, and a visual strength meter."
      icon={<KeyRound className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Cryptographically secure via crypto.getRandomValues',
        'Control length from 8 to 64 characters',
        'Mix uppercase, lowercase, numbers and symbols',
        'Exclude ambiguous characters like O and 0',
        'Visual strength indicator',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Password output */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-lg text-white/80 break-all leading-relaxed">{password}</code>
          </div>
          {strength && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/30">
                <span>Strength</span>
                <span className={strength.label === 'Very Strong' ? 'text-emerald-400' : strength.label === 'Strong' ? 'text-blue-400' : strength.label === 'Fair' ? 'text-amber-400' : 'text-red-400'}>{strength.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(34,197,94,0.3)]">
              <Copy className="h-4 w-4" /> Copy Password
            </button>
            <button onClick={generate} className="px-4 py-2.5 border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-xl transition-all">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Length */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Length</p>
            <span className="text-sm font-mono text-white/60">{length}</span>
          </div>
          <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-emerald-500" />
          <div className="flex justify-between text-xs text-white/20">
            <span>8</span><span>64</span>
          </div>
        </div>

        {/* Options */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Character Sets</p>
          <Toggle label="Uppercase (A–Z)" checked={upper} onChange={setUpper} />
          <Toggle label="Lowercase (a–z)" checked={lower} onChange={setLower} />
          <Toggle label="Numbers (0–9)" checked={numbers} onChange={setNumbers} />
          <Toggle label="Symbols (!@#$…)" checked={symbols} onChange={setSymbols} />
          <div className="h-px bg-white/[0.05]" />
          <Toggle label="Exclude ambiguous characters (O, 0, l, 1, I)" checked={noAmbiguous} onChange={setNoAmbiguous} />
        </div>
      </div>
    </ToolPageLayout>
  );
}
