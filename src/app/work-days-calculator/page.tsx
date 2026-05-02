"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Briefcase } from 'lucide-react';

function toLocalDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function parseHolidays(raw: string): Set<string> {
  const set = new Set<string>();
  raw.split(/[,\n]+/).forEach((s) => {
    const trimmed = s.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) set.add(trimmed);
  });
  return set;
}

function calcWorkDays(startStr: string, endStr: string, holidays: Set<string>) {
  const start = new Date(startStr + 'T00:00:00');
  const end   = new Date(endStr   + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

  let totalDays = 0;
  let weekends  = 0;
  let holidayCount = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const dow = cur.getDay();
    const ds  = toLocalDateString(cur);
    if (dow === 0 || dow === 6) {
      weekends++;
    } else if (holidays.has(ds)) {
      holidayCount++;
    }
    totalDays++;
    cur.setDate(cur.getDate() + 1);
  }

  const workDays = totalDays - weekends - holidayCount;
  return { totalDays, weekends, workDays, holidayCount };
}

export default function WorkDaysCalculatorPage() {
  const today = toLocalDateString(new Date());
  const [start,    setStart]    = useState('');
  const [end,      setEnd]      = useState('');
  const [holidays, setHolidays] = useState('');

  const result = useMemo(() => {
    if (!start || !end) return null;
    const holidaySet = parseHolidays(holidays);
    return calcWorkDays(start, end, holidaySet);
  }, [start, end, holidays]);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/40";

  return (
    <ToolPageLayout
      title="Work Days Calculator"
      description="Count working days between two dates — excludes weekends, with optional custom holidays."
      icon={<Briefcase className="h-7 w-7" />}
      accentColor="rgba(251,146,60,0.35)"
      features={[
        'Count working days between two dates',
        'Excludes weekends automatically',
        'Add custom holidays to exclude',
        'Shows total, working, and weekend days',
        'Works with any date range',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Date inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Date Range</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/40">Start Date</label>
                <button onClick={() => setStart(today)} className="text-xs text-orange-400/70 hover:text-orange-400 transition-colors">Today</button>
              </div>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/40">End Date</label>
                <button onClick={() => setEnd(today)} className="text-xs text-orange-400/70 hover:text-orange-400 transition-colors">Today</button>
              </div>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Holidays */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Custom Holidays (Optional)</p>
          <textarea
            value={holidays}
            onChange={(e) => setHolidays(e.target.value)}
            placeholder="2024-12-25, 2024-01-01&#10;One date per line or comma-separated (YYYY-MM-DD)"
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-orange-500/40 resize-none font-mono placeholder:font-sans"
          />
          <p className="text-xs text-white/25">Format: YYYY-MM-DD, comma or newline separated</p>
        </div>

        {/* Results */}
        {result && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Days',    value: result.totalDays,    color: 'text-white/80' },
                { label: 'Working Days',  value: result.workDays,     color: 'text-orange-400' },
                { label: 'Weekends',      value: result.weekends,     color: 'text-white/50' },
                { label: 'Holidays',      value: result.holidayCount, color: 'text-white/50' },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Summary</p>
                <div className="space-y-2">
                  {[
                    { label: 'Calendar days in range', value: result.totalDays },
                    { label: 'Weekend days (Sat + Sun)', value: result.weekends },
                    { label: 'Custom holiday days', value: result.holidayCount },
                    { label: 'Net working days', value: result.workDays, highlight: true },
                  ].map((row) => (
                    <div key={row.label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${row.highlight ? 'bg-orange-500/[0.08] border border-orange-500/20' : 'border border-white/[0.04]'}`}>
                      <span className={`text-sm ${row.highlight ? 'text-orange-300 font-semibold' : 'text-white/50'}`}>{row.label}</span>
                      <span className={`text-sm font-bold ${row.highlight ? 'text-orange-300' : 'text-white/60'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
