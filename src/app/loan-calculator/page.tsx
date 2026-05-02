"use client"
import React, { useState, useMemo } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { BarChart3 } from 'lucide-react';

interface AmortRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function calcAmortization(principal: number, annualRate: number, years: number): AmortRow[] {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const rows: AmortRow[] = [];
  let balance = principal;

  for (let i = 1; i <= n; i++) {
    const interestPayment = balance * r;
    let payment: number;
    if (r === 0) {
      payment = principal / n;
    } else {
      payment = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }
    const principalPayment = payment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    rows.push({ month: i, payment, principal: principalPayment, interest: interestPayment, balance });
  }
  return rows;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LoanCalculatorPage() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');

  const result = useMemo(() => {
    const p = parseFloat(amount);
    const r = parseFloat(rate);
    const y = parseFloat(years);
    if (!p || !r || !y || p <= 0 || r <= 0 || y <= 0) return null;
    const rows = calcAmortization(p, r, y);
    if (rows.length === 0) return null;
    const monthly = rows[0].payment;
    const total = monthly * y * 12;
    const interest = total - p;
    const preview = [
      ...rows.slice(0, 3),
      ...(rows.length > 3 ? [rows[rows.length - 1]] : []),
    ];
    return { monthly, total, interest, preview, lastMonth: rows.length };
  }, [amount, rate, years]);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-red-500/40";

  return (
    <ToolPageLayout
      title="Loan Calculator"
      description="Calculate your monthly loan payment, total interest and see a mini amortization schedule — instantly as you type."
      icon={<BarChart3 className="h-7 w-7" />}
      accentColor="rgba(239,68,68,0.35)"
      features={[
        'Calculate monthly loan payment',
        'Shows total payment and total interest',
        'Mini amortization schedule',
        'Supports any loan amount and term',
        'Instantly recalculates as you type',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Inputs */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Loan Details</p>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Loan Amount ($)</label>
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="200000" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Annual Interest Rate (%)</label>
            <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="6.5" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Loan Term (years)</label>
            <input type="number" min="1" max="50" value={years} onChange={(e) => setYears(e.target.value)} placeholder="30" className={inputCls} />
          </div>
        </div>

        {result && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass-card rounded-2xl p-5 text-center col-span-1">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Monthly Payment</p>
                <p className="text-4xl font-bold text-white/90">${fmt(result.monthly)}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Payment</p>
                <p className="text-2xl font-bold text-white/80">${fmt(result.total)}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Interest</p>
                <p className="text-2xl font-bold text-red-400">${fmt(result.interest)}</p>
              </div>
            </div>

            {/* Amortization preview */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Amortization Preview</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-white/50">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Month', 'Payment', 'Principal', 'Interest', 'Balance'].map((h) => (
                        <th key={h} className="text-left pb-2 pr-4 text-white/30 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((row, idx) => (
                      <React.Fragment key={row.month}>
                        {idx === 3 && result.preview.length === 4 && (
                          <tr>
                            <td colSpan={5} className="text-center text-white/20 py-1 text-[10px]">⋯ month {result.lastMonth - 1} rows hidden</td>
                          </tr>
                        )}
                        <tr className="border-b border-white/[0.04]">
                          <td className="py-2 pr-4">{row.month === result.lastMonth ? `${row.month} (last)` : row.month}</td>
                          <td className="py-2 pr-4">${fmt(row.payment)}</td>
                          <td className="py-2 pr-4">${fmt(row.principal)}</td>
                          <td className="py-2 pr-4">${fmt(row.interest)}</td>
                          <td className="py-2">${fmt(row.balance)}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
