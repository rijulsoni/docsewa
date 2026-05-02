"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Calendar } from 'lucide-react';

function calcAge(dob: Date, asOf: Date) {
  let years  = asOf.getFullYear()  - dob.getFullYear();
  let months = asOf.getMonth()     - dob.getMonth();
  let days   = asOf.getDate()      - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years  -= 1;
    months += 12;
  }
  return { years, months, days };
}

function totalDays(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

function daysUntilNextBirthday(dob: Date, asOf: Date): number {
  const nextBday = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday <= asOf) nextBday.setFullYear(asOf.getFullYear() + 1);
  return Math.ceil((nextBday.getTime() - asOf.getTime()) / 86400000);
}

function toLocalDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function AgeCalculatorPage() {
  const today = toLocalDateString(new Date());
  const [dob,    setDob]    = useState('');
  const [asOfRaw, setAsOf]  = useState(today);

  const result = useMemo(() => {
    if (!dob) return null;
    const dobDate  = new Date(dob  + 'T00:00:00');
    const asOfDate = new Date((asOfRaw || today) + 'T00:00:00');
    if (isNaN(dobDate.getTime()) || isNaN(asOfDate.getTime())) return null;
    if (dobDate > asOfDate) return null;
    const { years, months, days } = calcAge(dobDate, asOfDate);
    const td = totalDays(dobDate, asOfDate);
    const hours = td * 24;
    const nextBday = daysUntilNextBirthday(dobDate, asOfDate);
    return { years, months, days, totalDays: td, hours, nextBday };
  }, [dob, asOfRaw, today]);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-blue-500/40";

  return (
    <ToolPageLayout
      title="Age Calculator"
      description="Calculate your exact age in years, months and days — plus total days lived, hours, and your next birthday countdown."
      icon={<Calendar className="h-7 w-7" />}
      accentColor="rgba(59,130,246,0.35)"
      features={[
        'Calculate exact age from date of birth',
        'Shows years, months and days',
        'Total days and hours lived',
        'Days until next birthday',
        'Calculate age as of any date',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Dates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={today} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Calculate As Of</label>
              <input type="date" value={asOfRaw} onChange={(e) => setAsOf(e.target.value)} className={inputCls} />
            </div>
          </div>
          {dob && !result && (
            <p className="text-xs text-red-400/70">Date of birth must be before the &quot;as of&quot; date.</p>
          )}
        </div>

        {result && (
          <>
            {/* Main age display */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Your Age</p>
              <div className="flex items-end justify-center gap-4">
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
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Days Lived</p>
                <p className="text-2xl font-bold text-blue-400">{result.totalDays.toLocaleString()}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Hours</p>
                <p className="text-2xl font-bold text-white/80">{result.hours.toLocaleString()}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Next Birthday In</p>
                <p className="text-2xl font-bold text-white/80">
                  {result.nextBday === 0 ? '🎂 Today!' : `${result.nextBday} days`}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
