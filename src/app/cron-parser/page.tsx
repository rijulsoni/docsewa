"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Inline cron parser ───────────────────────────────────────────────────────

interface CronFields {
  second: number[];
  minute: number[];
  hour: number[];
  dom: number[];
  month: number[];
  dow: number[];
}

function parseField(field: string, min: number, max: number): number[] | null {
  const values: number[] = [];
  const parts = field.split(',');
  for (const part of parts) {
    if (part === '*') {
      for (let i = min; i <= max; i++) values.push(i);
    } else if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2));
      if (isNaN(step) || step <= 0) return null;
      for (let i = min; i <= max; i += step) values.push(i);
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      if (isNaN(a) || isNaN(b) || a > b) return null;
      for (let i = Math.max(a, min); i <= Math.min(b, max); i++) values.push(i);
    } else if (part.includes('/')) {
      const [range, step] = part.split('/');
      const s = parseInt(step);
      if (isNaN(s) || s <= 0) return null;
      const [a, b] = range.split('-').map(Number);
      if (isNaN(a) || isNaN(b)) return null;
      for (let i = a; i <= b; i += s) values.push(i);
    } else {
      const n = parseInt(part);
      if (isNaN(n) || n < min || n > max) return null;
      values.push(n);
    }
  }
  return [...new Set(values)].sort((a, b) => a - b);
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function parseCron(expr: string): { fields: CronFields; error: string } | { fields: null; error: string } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) {
    return { fields: null, error: 'Expected 5 or 6 fields (sec? min hr dom mon dow)' };
  }
  const has6 = parts.length === 6;
  const [secF, minF, hrF, domF, monF, dowF] = has6
    ? parts
    : ['0', ...parts];

  const second = parseField(secF, 0, 59);
  const minute = parseField(minF, 0, 59);
  const hour   = parseField(hrF,  0, 23);
  const dom    = parseField(domF, 1, 31);
  const month  = parseField(monF, 1, 12);
  const dow    = parseField(dowF, 0, 6);

  if (!second || !minute || !hour || !dom || !month || !dow) {
    return { fields: null, error: 'Invalid field value' };
  }
  return { fields: { second, minute, hour, dom, month, dow }, error: '' };
}

function getNextRuns(fields: CronFields, count = 5): Date[] {
  const results: Date[] = [];
  const now = new Date();
  now.setMilliseconds(0);
  const cur = new Date(now.getTime() + 1000); // start 1 second ahead
  cur.setMilliseconds(0);

  for (let iter = 0; iter < 525600 && results.length < count; iter++) {
    if (
      fields.month.includes(cur.getMonth() + 1) &&
      fields.dom.includes(cur.getDate()) &&
      fields.dow.includes(cur.getDay()) &&
      fields.hour.includes(cur.getHours()) &&
      fields.minute.includes(cur.getMinutes()) &&
      fields.second.includes(cur.getSeconds())
    ) {
      results.push(new Date(cur));
    }
    cur.setSeconds(cur.getSeconds() + 1);
  }
  return results;
}

function describeField(values: number[], min: number, max: number, names?: string[]): string {
  if (values.length === max - min + 1) return 'every ' + (names ? (names[0] + '–' + names[names.length - 1]) : `${min}–${max}`);
  if (values.length === 1) return names ? names[values[0] - min] ?? String(values[0]) : String(values[0]);
  if (names) return values.map((v) => names[v - min] ?? v).join(', ');
  return values.join(', ');
}

function describeCron(fields: CronFields): string {
  const { minute, hour, dom, month, dow } = fields;

  const allMin  = minute.length === 60;
  const allHr   = hour.length === 24;
  const allDom  = dom.length === 31;
  const allMon  = month.length === 12;
  const allDow  = dow.length === 7;

  const parts: string[] = [];

  if (allMin && allHr) {
    parts.push('every minute');
  } else if (allMin) {
    parts.push(`every minute of hour ${describeField(hour, 0, 23)}`);
  } else if (allHr) {
    parts.push(`at minute ${describeField(minute, 0, 59)}`);
  } else {
    const hrLabel  = hour.map((h) => `${h.toString().padStart(2,'0')}:${minute.map((m) => m.toString().padStart(2,'0')).join(',')}`).join(', ');
    parts.push(`at ${hrLabel}`);
  }

  if (!allDom) parts.push(`on day ${describeField(dom, 1, 31)}`);
  if (!allMon) parts.push(`in ${describeField(month, 1, 12, MONTH_NAMES)}`);
  if (!allDow) parts.push(`on ${describeField(dow, 0, 6, DOW_NAMES)}`);

  return parts.join(', ');
}

const PRESETS = [
  { label: 'Every minute',     expr: '* * * * *' },
  { label: 'Weekdays 9 AM',    expr: '0 9 * * 1-5' },
  { label: 'Daily midnight',   expr: '0 0 * * *' },
  { label: 'Every 15 min',     expr: '*/15 * * * *' },
  { label: '1st of month',     expr: '0 0 1 * *' },
];

export default function CronParserPage() {
  const [expr, setExpr] = useState('0 9 * * 1-5');

  const parsed = useMemo(() => parseCron(expr), [expr]);
  const explanation = useMemo(() => {
    if (!parsed.fields) return '';
    return describeCron(parsed.fields);
  }, [parsed]);
  const nextRuns = useMemo(() => {
    if (!parsed.fields) return [];
    return getNextRuns(parsed.fields);
  }, [parsed]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <ToolPageLayout
      title="Cron Expression Parser"
      description="Explain any cron expression in plain English and preview the next 5 scheduled run times."
      icon={<Clock className="h-7 w-7" />}
      accentColor="rgba(34,197,94,0.35)"
      features={[
        'Explain any cron expression in plain English',
        'Shows the next 5 scheduled run times',
        'Supports */n, ranges, and lists',
        'Quick presets for common schedules',
        '5 and 6 field cron support',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Cron Expression</p>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="e.g. 0 9 * * 1-5"
            spellCheck={false}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-green-500/40 font-mono"
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(({ label, expr: pe }) => (
              <button
                key={pe}
                onClick={() => setExpr(pe)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-green-300 hover:border-green-500/30 hover:bg-green-500/5 transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {parsed.error ? (
          <div className="glass-card rounded-2xl p-5">
            <p className="text-sm text-red-400">{parsed.error}</p>
          </div>
        ) : (
          <>
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Explanation</p>
              <p className="text-base text-white/80 font-medium capitalize">{explanation}</p>
            </div>

            {/* Field breakdown */}
            {parsed.fields && (
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Field Breakdown</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Second',  values: parsed.fields.second, min: 0, max: 59 },
                    { label: 'Minute',  values: parsed.fields.minute, min: 0, max: 59 },
                    { label: 'Hour',    values: parsed.fields.hour,   min: 0, max: 23 },
                    { label: 'Day (month)', values: parsed.fields.dom, min: 1, max: 31 },
                    { label: 'Month',   values: parsed.fields.month,  min: 1, max: 12, names: MONTH_NAMES },
                    { label: 'Day (week)',  values: parsed.fields.dow,  min: 0, max: 6,  names: DOW_NAMES },
                  ].map(({ label, values, min, max, names }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-xs text-white/60 font-mono truncate">
                        {describeField(values, min, max, names)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next runs */}
            {nextRuns.length > 0 && (
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Next 5 Runs</p>
                <ul className="space-y-1.5">
                  {nextRuns.map((date, i) => {
                    const str = date.toLocaleString();
                    return (
                      <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                        <span className="text-sm text-white/60 font-mono">{str}</span>
                        <button
                          onClick={() => copy(str)}
                          className="shrink-0 text-white/20 hover:text-green-300 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {nextRuns.length === 0 && (
                  <p className="text-sm text-white/30">No upcoming runs found in the next year.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
