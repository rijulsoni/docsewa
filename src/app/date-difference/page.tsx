"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Calendar, ArrowLeftRight } from 'lucide-react';

function toLocalDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function calcDiff(start: Date, end: Date) {
  const isNeg = end < start;
  const [a, b] = isNeg ? [end, start] : [start, end];

  let years  = b.getFullYear()  - a.getFullYear();
  let months = b.getMonth()     - a.getMonth();
  let days   = b.getDate()      - a.getDate();

  if (days < 0) {
    months -= 1;
    const prev = new Date(b.getFullYear(), b.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years  -= 1;
    months += 12;
  }

  const totalDays  = Math.abs(Math.round((b.getTime() - a.getTime()) / 86400000));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  return { years, months, days, totalDays, totalWeeks, totalHours, negative: isNeg };
}

export default function DateDifferencePage() {
  const today = toLocalDateString(new Date());
  const [start, setStart] = useState('');
  const [end,   setEnd]   = useState('');

  const result = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end   + 'T00:00:00');
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    return calcDiff(s, e);
  }, [start, end]);

  const swap = () => {
    setStart(end);
    setEnd(start);
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-teal-500/40";

  return (
    <ToolPageLayout
      title="Date Difference Calculator"
      description="Find the exact difference between two dates — in years, months, days, weeks and hours."
      icon={<Calendar className="h-7 w-7" />}
      accentColor="rgba(20,184,166,0.35)"
      features={[
        'Calculate the difference between two dates',
        'Shows years, months, days, weeks and hours',
        'Swap start and end dates with one click',
        '"Use today" shortcut for either field',
        'Works with any date range',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Date inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Select Dates</p>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/40">Start Date</label>
                <button onClick={() => setStart(today)} className="text-xs text-teal-400/70 hover:text-teal-400 transition-colors">Use today</button>
              </div>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
            </div>

            <button onClick={swap} title="Swap dates" className="p-2.5 rounded-xl border border-white/[0.08] text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all shrink-0 mb-0.5">
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/40">End Date</label>
                <button onClick={() => setEnd(today)} className="text-xs text-teal-400/70 hover:text-teal-400 transition-colors">Use today</button>
              </div>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {result && (
          <>
            {/* Main breakdown */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                {result.negative ? 'End is before start — showing absolute difference' : 'Difference'}
              </p>
              <div className="flex items-end justify-center gap-4 flex-wrap">
                {[
                  { value: result.years,  label: 'Years'  },
                  { value: result.months, label: 'Months' },
                  { value: result.days,   label: 'Days'   },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-5xl font-extrabold text-white/90 leading-none">{item.value}</p>
                    <p className="text-xs text-white/30 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Total Days',  value: result.totalDays.toLocaleString(),  color: 'text-teal-400' },
                { label: 'Total Weeks', value: result.totalWeeks.toLocaleString(), color: 'text-white/80' },
                { label: 'Total Hours', value: result.totalHours.toLocaleString(), color: 'text-white/80' },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
