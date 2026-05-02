"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Pipette, Copy } from 'lucide-react';
import { toast } from 'sonner';

// ── Conversion helpers ────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ColorConverterPage() {
  const [hex, setHex]     = useState('#ec4899');
  const [rgb, setRgb]     = useState('236, 72, 153');
  const [hsl, setHsl]     = useState('328°, 81%, 60%');
  const [previewColor, setPreviewColor] = useState('#ec4899');

  const updateFromHex = useCallback((raw: string) => {
    setHex(raw);
    const result = hexToRgb(raw);
    if (!result) return;
    const { r, g, b } = result;
    const h = rgbToHsl(r, g, b);
    setRgb(`${r}, ${g}, ${b}`);
    setHsl(`${h.h}°, ${h.s}%, ${h.l}%`);
    setPreviewColor(raw);
  }, []);

  const updateFromRgb = useCallback((raw: string) => {
    setRgb(raw);
    const parts = raw.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) return;
    const [r, g, b] = parts;
    if ([r, g, b].some((v) => v < 0 || v > 255)) return;
    const h = rgbToHsl(r, g, b);
    const hexVal = rgbToHex(r, g, b);
    setHex(hexVal);
    setHsl(`${h.h}°, ${h.s}%, ${h.l}%`);
    setPreviewColor(hexVal);
  }, []);

  const updateFromHsl = useCallback((raw: string) => {
    setHsl(raw);
    const clean = raw.replace(/°|%/g, '');
    const parts = clean.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) return;
    const [h, s, l] = parts;
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return;
    const { r, g, b } = hslToRgb(h, s, l);
    const hexVal = rgbToHex(r, g, b);
    setHex(hexVal);
    setRgb(`${r}, ${g}, ${b}`);
    setPreviewColor(hexVal);
  }, []);

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`Copied ${label}!`);
  };

  const rows = [
    { label: 'HEX',  placeholder: '#rrggbb',    value: hex,  onChange: updateFromHex,  display: hex },
    { label: 'RGB',  placeholder: 'r, g, b',    value: rgb,  onChange: updateFromRgb,  display: `rgb(${rgb})` },
    { label: 'HSL',  placeholder: 'h°, s%, l%', value: hsl,  onChange: updateFromHsl,  display: `hsl(${hsl})` },
  ];

  return (
    <ToolPageLayout
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL color formats instantly. Edit any field and the others update in real time."
      icon={<Pipette className="h-7 w-7" />}
      accentColor="rgba(236,72,153,0.35)"
      features={[
        'Convert between HEX, RGB, and HSL color formats',
        'Live preview of the current color',
        'Edit any format and the others update instantly',
        'Copy each format to clipboard',
        'No color picker required — paste any value',
        'Runs entirely in your browser',
      ]}
    >
      <div className="space-y-4">
        {/* Color preview */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-xl shrink-0 border border-white/[0.08] shadow-lg transition-all duration-300"
            style={{ background: previewColor }}
          />
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Preview</p>
            <p className="text-white/70 font-mono text-sm">{previewColor.toUpperCase()}</p>
            <p className="text-white/30 text-xs mt-0.5">rgb({rgb})</p>
          </div>
        </div>

        {/* Input rows */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Color Values</p>
          {rows.map(({ label, placeholder, value, onChange, display }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/30 w-8 shrink-0">{label}</span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-grow bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-pink-500/40 font-mono"
              />
              <button
                onClick={() => copy(display, label)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-pink-300 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Quick swatches */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Quick Swatches</p>
          <div className="flex flex-wrap gap-2">
            {[
              '#ec4899', '#f43f5e', '#f97316', '#eab308',
              '#22c55e', '#06b6d4', '#6366f1', '#8b5cf6',
              '#ffffff', '#94a3b8', '#334155', '#0f172a',
            ].map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => updateFromHex(c)}
                className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                style={{
                  background: c,
                  borderColor: previewColor === c ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
