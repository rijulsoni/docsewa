"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Binary, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Base = 'dec' | 'bin' | 'oct' | 'hex';

interface Field {
  key: Base;
  label: string;
  prefix: string;
  placeholder: string;
  radix: number;
  inputMode: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  pattern: RegExp;
}

const FIELDS: Field[] = [
  { key: 'dec', label: 'Decimal',     prefix: '',   placeholder: 'e.g. 255',   radix: 10, inputMode: 'numeric',  pattern: /^-?\d*$/ },
  { key: 'bin', label: 'Binary',      prefix: '0b', placeholder: 'e.g. 11111111', radix: 2,  inputMode: 'text',     pattern: /^[01]*$/ },
  { key: 'oct', label: 'Octal',       prefix: '0o', placeholder: 'e.g. 377',   radix: 8,  inputMode: 'numeric',  pattern: /^[0-7]*$/ },
  { key: 'hex', label: 'Hexadecimal', prefix: '0x', placeholder: 'e.g. FF',    radix: 16, inputMode: 'text',     pattern: /^[0-9a-fA-F]*$/ },
];

function parseValue(raw: string, radix: number): number | null {
  const clean = raw.trim();
  if (!clean || clean === '-') return null;
  const negative = clean.startsWith('-');
  const digits = negative ? clean.slice(1) : clean;
  if (!digits) return null;
  const val = parseInt(digits, radix);
  if (isNaN(val)) return null;
  return negative ? -val : val;
}

function convertTo(value: number, radix: number): string {
  if (value < 0) return '-' + (-value).toString(radix).toUpperCase();
  return value.toString(radix).toUpperCase();
}

export default function NumberBaseConverterPage() {
  const [values, setValues] = useState<Record<Base, string>>({
    dec: '255',
    bin: '11111111',
    oct: '377',
    hex: 'FF',
  });
  const [invalidKey, setInvalidKey] = useState<Base | null>(null);

  const handleChange = useCallback((key: Base, raw: string, radix: number) => {
    const field = FIELDS.find((f) => f.key === key)!;
    const cleanRaw = raw.replace(/^0[box]/i, '');

    if (cleanRaw !== '' && !field.pattern.test(cleanRaw)) return;

    if (!cleanRaw.trim()) {
      setValues({ dec: '', bin: '', oct: '', hex: '' });
      setInvalidKey(null);
      return;
    }

    const num = parseValue(cleanRaw, radix);
    if (num === null) {
      setValues((prev) => ({ ...prev, [key]: cleanRaw }));
      setInvalidKey(key);
      return;
    }

    setInvalidKey(null);
    const next: Record<Base, string> = { dec: '', bin: '', oct: '', hex: '' };
    for (const f of FIELDS) {
      next[f.key] = f.key === key ? cleanRaw : convertTo(num, f.radix);
    }
    setValues(next);
  }, []);

  const copy = (key: Base) => {
    const val = values[key];
    if (!val) return;
    const field = FIELDS.find((f) => f.key === key)!;
    navigator.clipboard.writeText(field.prefix + val);
    toast.success(`Copied ${field.label}!`);
  };

  return (
    <ToolPageLayout
      title="Number Base Converter"
      description="Convert numbers between decimal, binary, octal, and hexadecimal. Edit any field and all others update instantly."
      icon={<Binary className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Convert between decimal, binary, octal, and hex',
        'Edit any field and all others update instantly',
        'Supports large integers',
        'Invalid input is gracefully ignored',
        'Copy any result to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Enter any value</p>

          {FIELDS.map((field) => {
            const isInvalid = invalidKey === field.key;
            return (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/40">{field.label}</label>
                  <button
                    onClick={() => copy(field.key)}
                    disabled={!values[field.key] || isInvalid}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <div className="flex items-center gap-0">
                  {field.prefix && (
                    <span className="px-3 py-2.5 text-sm font-mono text-white/25 bg-white/[0.02] border border-r-0 border-white/[0.08] rounded-l-xl select-none">
                      {field.prefix}
                    </span>
                  )}
                  <input
                    type="text"
                    inputMode={field.inputMode}
                    value={values[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value, field.radix)}
                    placeholder={field.placeholder}
                    className={`flex-grow bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none font-mono transition-colors ${
                      field.prefix ? 'rounded-r-xl' : 'rounded-xl'
                    } ${isInvalid ? 'border-red-500/40 text-red-400/70' : 'focus:border-indigo-500/40'}`}
                  />
                </div>
                {isInvalid && (
                  <p className="text-xs text-red-400/60 pl-1">Invalid {field.label.toLowerCase()} value</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick reference */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Quick Reference</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Dec', values: ['0', '1', '2', '8', '10', '15', '16', '255'] },
              { label: 'Bin', values: ['0', '1', '10', '1000', '1010', '1111', '10000', '11111111'] },
              { label: 'Oct', values: ['0', '1', '2', '10', '12', '17', '20', '377'] },
              { label: 'Hex', values: ['0', '1', '2', '8', 'A', 'F', '10', 'FF'] },
            ].map(({ label, values: vals }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-white/25 uppercase mb-2">{label}</p>
                {vals.map((v) => (
                  <p key={v} className="text-xs font-mono text-white/30 leading-5">{v}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
