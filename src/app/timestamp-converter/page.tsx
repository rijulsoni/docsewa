"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toLocalIsoString(d: Date): string {
  const pad = (n: number, l = 2) => String(n).padStart(l, '0');
  const tz  = -d.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  const abs  = Math.abs(tz);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

function relativeTime(d: Date): string {
  const diffMs   = Date.now() - d.getTime();
  const diffSec  = Math.round(diffMs / 1000);
  const diffMin  = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay  = Math.round(diffHour / 24);
  const abs      = Math.abs;
  const future   = diffMs < 0;
  const suffix   = future ? 'from now' : 'ago';
  if (abs(diffSec) < 60)   return `${abs(diffSec)} second${abs(diffSec) !== 1 ? 's' : ''} ${suffix}`;
  if (abs(diffMin) < 60)   return `${abs(diffMin)} minute${abs(diffMin) !== 1 ? 's' : ''} ${suffix}`;
  if (abs(diffHour) < 24)  return `${abs(diffHour)} hour${abs(diffHour) !== 1 ? 's' : ''} ${suffix}`;
  return `${abs(diffDay)} day${abs(diffDay) !== 1 ? 's' : ''} ${suffix}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TimestampConverterPage() {
  // Unix → Human
  const [unixInput, setUnixInput] = useState('');
  const [humanResults, setHumanResults] = useState<{ label: string; value: string }[]>([]);

  // Human → Unix
  const [datetimeInput, setDatetimeInput] = useState('');
  const [unixResults, setUnixResults]     = useState<{ label: string; value: string }[]>([]);

  const convertUnixToHuman = useCallback((raw: string) => {
    setUnixInput(raw);
    const ts = parseFloat(raw.trim());
    if (isNaN(ts)) { setHumanResults([]); return; }
    const d = new Date(ts * 1000);
    if (isNaN(d.getTime())) { setHumanResults([]); return; }
    setHumanResults([
      { label: 'UTC',          value: d.toUTCString() },
      { label: 'Local ISO',    value: toLocalIsoString(d) },
      { label: 'ISO 8601',     value: d.toISOString() },
      { label: 'Locale string',value: d.toLocaleString() },
      { label: 'Relative',     value: relativeTime(d) },
    ]);
  }, []);

  const convertHumanToUnix = useCallback((raw: string) => {
    setDatetimeInput(raw);
    if (!raw) { setUnixResults([]); return; }
    const d = new Date(raw);
    if (isNaN(d.getTime())) { setUnixResults([]); return; }
    const sec = Math.floor(d.getTime() / 1000);
    setUnixResults([
      { label: 'Unix (seconds)',      value: String(sec) },
      { label: 'Unix (milliseconds)', value: String(d.getTime()) },
      { label: 'ISO 8601',            value: d.toISOString() },
      { label: 'UTC',                 value: d.toUTCString() },
    ]);
  }, []);

  const useNow = () => {
    const nowSec = Math.floor(Date.now() / 1000).toString();
    convertUnixToHuman(nowSec);
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`Copied ${label}!`);
  };

  return (
    <ToolPageLayout
      title="Timestamp Converter"
      description="Convert Unix timestamps to human-readable dates and vice versa. Supports UTC, local, ISO, and relative formats."
      icon={<Clock className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Convert Unix timestamps to human-readable dates',
        'Convert any date to a Unix timestamp',
        '"Use current time" fills the current timestamp',
        'Shows UTC, local, ISO and relative formats',
        'Copy any result to clipboard',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* ── Unix → Human ── */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Unix → Human-Readable</p>

          <div className="flex gap-2">
            <input
              type="number"
              value={unixInput}
              onChange={(e) => convertUnixToHuman(e.target.value)}
              placeholder="Unix timestamp in seconds, e.g. 1714556400"
              className="flex-grow bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={useNow}
              className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-white/50 hover:text-teal-300 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all whitespace-nowrap"
            >
              Use now
            </button>
          </div>

          {humanResults.length > 0 && (
            <div className="space-y-2">
              {humanResults.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5">
                  <span className="text-xs text-white/30 w-28 shrink-0">{label}</span>
                  <span className="flex-grow text-sm font-mono text-white/60 break-all">{value}</span>
                  <button
                    onClick={() => copy(value, label)}
                    className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-teal-300 hover:bg-teal-500/5 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {unixInput && humanResults.length === 0 && (
            <p className="text-sm text-red-400/60">Invalid timestamp</p>
          )}
        </div>

        {/* ── Human → Unix ── */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Human-Readable → Unix</p>

          <input
            type="datetime-local"
            value={datetimeInput}
            onChange={(e) => convertHumanToUnix(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-teal-500/40 [color-scheme:dark]"
          />

          {unixResults.length > 0 && (
            <div className="space-y-2">
              {unixResults.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5">
                  <span className="text-xs text-white/30 w-36 shrink-0">{label}</span>
                  <span className="flex-grow text-sm font-mono text-white/60 break-all">{value}</span>
                  <button
                    onClick={() => copy(value, label)}
                    className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-teal-300 hover:bg-teal-500/5 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {datetimeInput && unixResults.length === 0 && (
            <p className="text-sm text-red-400/60">Invalid date</p>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
