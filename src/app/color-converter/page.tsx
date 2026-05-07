"use client"
import React, { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { Pipette } from 'lucide-react';
import { Section, Swatch, CopyButton } from '@/components/tool-ui';

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

const SWATCHES = [
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#6366f1', '#8b5cf6',
  '#ffffff', '#94a3b8', '#334155', '#0f172a',
];

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
        <Section padding={6}>
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl shrink-0 border border-white/[0.10] shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.20)] transition-colors duration-200"
              style={{ background: previewColor }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-1">Preview</p>
              <p className="text-white/90 font-mono text-lg font-semibold">{previewColor.toUpperCase()}</p>
              <p className="text-white/35 text-xs mt-0.5 font-mono">rgb({rgb})</p>
            </div>
          </div>
        </Section>

        {/* Input rows */}
        <Section title="Color values">
          <div className="space-y-2.5">
            {rows.map(({ label, placeholder, value, onChange, display }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-white/40 w-10 shrink-0 uppercase tracking-[0.12em]">{label}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="flex-grow bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/85 placeholder:text-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/30 focus:border-pink-500/40 font-mono transition-all min-w-0"
                />
                <CopyButton value={display} label={label} size="md" />
              </div>
            ))}
          </div>
        </Section>

        {/* Quick swatches */}
        <Section title="Quick swatches" description="Tap a color to load it">
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((c) => (
              <Swatch
                key={c}
                color={c}
                active={previewColor.toLowerCase() === c.toLowerCase()}
                onClick={() => updateFromHex(c)}
                size="md"
              />
            ))}
          </div>
        </Section>
      </div>
    </ToolPageLayout>
  );
}
