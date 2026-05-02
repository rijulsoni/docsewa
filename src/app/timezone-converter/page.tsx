"use client"
import React, { useState, useEffect, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Globe, RefreshCw } from 'lucide-react';

const TIMEZONES = [
  { label: 'UTC',              zone: 'UTC' },
  { label: 'US / Eastern',     zone: 'America/New_York' },
  { label: 'US / Central',     zone: 'America/Chicago' },
  { label: 'US / Mountain',    zone: 'America/Denver' },
  { label: 'US / Pacific',     zone: 'America/Los_Angeles' },
  { label: 'Europe / London',  zone: 'Europe/London' },
  { label: 'Europe / Paris',   zone: 'Europe/Paris' },
  { label: 'Europe / Berlin',  zone: 'Europe/Berlin' },
  { label: 'Asia / Kolkata',   zone: 'Asia/Kolkata' },
  { label: 'Asia / Tokyo',     zone: 'Asia/Tokyo' },
  { label: 'Asia / Shanghai',  zone: 'Asia/Shanghai' },
  { label: 'Australia / Sydney', zone: 'Australia/Sydney' },
];

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatInZone(date: Date, zone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '—';
  }
}

function getOffsetLabel(date: Date, zone: string): string {
  try {
    const utcDate  = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const zoneDate = new Date(date.toLocaleString('en-US', { timeZone: zone }));
    const diffMin  = Math.round((zoneDate.getTime() - utcDate.getTime()) / 60000);
    const sign     = diffMin >= 0 ? '+' : '-';
    const abs      = Math.abs(diffMin);
    const h        = Math.floor(abs / 60);
    const m        = abs % 60;
    return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

export default function TimezoneConverterPage() {
  const [datetime,   setDatetime]   = useState(() => toLocalInputValue(new Date()));
  const [fromZone,   setFromZone]   = useState('UTC');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const getConvertedDate = useCallback((): Date | null => {
    if (!datetime) return null;
    try {
      // `datetime` is a local datetime-local string like "2024-05-01T14:30"
      // Treat it as if it represents that wall-clock time in `fromZone`.
      // Use Intl to find out what UTC offset fromZone has at the approximate moment,
      // then shift the epoch accordingly.
      const inputDate = new Date(datetime);
      if (isNaN(inputDate.getTime())) return null;

      // Find offset by comparing what the same epoch looks like in UTC vs fromZone
      const fmt = (d: Date, tz: string) =>
        new Intl.DateTimeFormat('en-US', {
          timeZone: tz, hour12: false,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).format(d);

      const utcStr  = fmt(inputDate, 'UTC');
      const zoneStr = fmt(inputDate, fromZone);
      const parse   = (s: string) => new Date(s.replace(/(\d+)\/(\d+)\/(\d+),\s/, '$3-$1-$2T') + 'Z');
      const offsetMs = parse(zoneStr).getTime() - parse(utcStr).getTime();
      return new Date(inputDate.getTime() - offsetMs);
    } catch {
      return null;
    }
  }, [datetime, fromZone]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setDatetime(toLocalInputValue(new Date())), 1000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const convertedDate = getConvertedDate();

  const inputCls = "bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-indigo-500/40";

  return (
    <ToolPageLayout
      title="Timezone Converter"
      description="Convert any date and time across 12 common time zones simultaneously — using the native Intl API, no libraries needed."
      icon={<Globe className="h-7 w-7" />}
      accentColor="rgba(99,102,241,0.35)"
      features={[
        'Convert time across 12+ time zones',
        'Uses native Intl.DateTimeFormat API',
        'Shows all zones simultaneously',
        'Auto-refresh for current time',
        'Pick any date and time to convert',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Input</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-white/40">Date & Time</label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => { setDatetime(e.target.value); setAutoRefresh(false); }}
                className={`w-full ${inputCls}`}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-white/40">From Timezone</label>
              <select value={fromZone} onChange={(e) => setFromZone(e.target.value)} className={`w-full ${inputCls}`}>
                {TIMEZONES.map((tz) => <option key={tz.zone} value={tz.zone}>{tz.label}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => {
                setAutoRefresh((v) => {
                  if (!v) setDatetime(toLocalInputValue(new Date()));
                  return !v;
                });
              }}
              className={`relative w-9 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-indigo-500/60' : 'bg-white/[0.08]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-4' : ''}`} />
            </div>
            <span className="flex items-center gap-1.5 text-sm text-white/50">
              <RefreshCw className="h-3.5 w-3.5" /> Auto-refresh current time
            </span>
          </label>
        </div>

        {/* Results table */}
        {convertedDate && (
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">All Timezones</p>
            <div className="space-y-1">
              {TIMEZONES.map((tz) => (
                <div
                  key={tz.zone}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-3 py-2.5 rounded-xl transition-colors ${tz.zone === fromZone ? 'bg-indigo-500/[0.08] border border-indigo-500/20' : 'hover:bg-white/[0.03]'}`}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-white/60 w-36">{tz.label}</span>
                    <span className="text-[10px] text-white/25 font-mono">{getOffsetLabel(convertedDate, tz.zone)}</span>
                  </div>
                  <span className="text-xs text-white/50 font-mono tabular-nums">{formatInZone(convertedDate, tz.zone)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
