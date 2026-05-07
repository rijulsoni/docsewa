"use client"
import React, { useState, useEffect, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { QrCode, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  Section, Slider, SegmentedControl, ColorField, EmptyState,
} from '@/components/tool-ui';

type ECLevel = 'L' | 'M' | 'Q' | 'H';

const ACCENT = '#fbbf24'; // amber-400

export default function QrGeneratorPage() {
  const [text, setText]       = useState('');
  const [size, setSize]       = useState(256);
  const [ecLevel, setEcLevel] = useState<ECLevel>('M');
  const [fg, setFg]           = useState('#000000');
  const [bg, setBg]           = useState('#ffffff');
  const canvasRef             = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim() || !canvasRef.current) return;
    const timer = setTimeout(async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        await QRCode.toCanvas(canvasRef.current!, text, {
          width: size,
          errorCorrectionLevel: ecLevel,
          color: { dark: fg, light: bg },
          margin: 2,
        });
      } catch { /* invalid/too-long input — ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [text, size, ecLevel, fg, bg]);

  const downloadPng = () => {
    if (!canvasRef.current || !text.trim()) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = 'qrcode.png';
    a.click();
    toast.success('PNG downloaded!');
  };

  const downloadSvg = async () => {
    if (!text.trim()) return;
    try {
      const QRCode = (await import('qrcode')).default;
      const svg = await QRCode.toString(text, {
        type: 'svg',
        errorCorrectionLevel: ecLevel,
        color: { dark: fg, light: bg },
        margin: 2,
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qrcode.svg';
      a.click();
      toast.success('SVG downloaded!');
    } catch {
      toast.error('Failed to generate SVG.');
    }
  };

  return (
    <ToolPageLayout
      title="QR Code Generator"
      description="Type any URL or text and get a customizable QR code — download as PNG or SVG."
      icon={<QrCode className="h-7 w-7" />}
      accentColor="rgba(251,191,36,0.35)"
      features={[
        'Supports URLs, plain text, and any string content',
        'Live preview updates as you type (300ms debounce)',
        'Choose error correction level: L, M, Q, H',
        'Customize foreground and background colors',
        'Download as PNG (raster) or SVG (vector)',
        'Runs entirely client-side — nothing sent to a server',
      ]}
    >
      <div className="space-y-4">
        {/* Content input */}
        <Section title="Content">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com or any text…"
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/85 placeholder:text-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30 focus:border-amber-400/40 resize-none transition-all"
          />
        </Section>

        {/* Size */}
        <Section
          title="Size"
          valueRight={
            <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
              {size} × {size}px
            </span>
          }
        >
          <Slider value={size} min={128} max={512} step={32} onChange={setSize} accent={ACCENT} ariaLabel="QR code size" />
          <div className="flex justify-between text-[10px] text-white/25 mt-2 font-mono">
            <span>128px</span><span>512px</span>
          </div>
        </Section>

        {/* Error correction */}
        <Section
          title="Error correction"
          description="L=7% · M=15% · Q=25% · H=30% damage recovery"
        >
          <SegmentedControl
            value={ecLevel}
            onChange={setEcLevel}
            accent={ACCENT}
            fluid
            options={[
              { value: 'L', label: 'L' },
              { value: 'M', label: 'M' },
              { value: 'Q', label: 'Q' },
              { value: 'H', label: 'H' },
            ]}
          />
        </Section>

        {/* Colors */}
        <Section title="Colors">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorField label="Foreground" value={fg} onChange={setFg} />
            <ColorField label="Background" value={bg} onChange={setBg} />
          </div>
        </Section>

        {/* Output */}
        {text.trim() ? (
          <Section title="Preview" padding={6}>
            <div className="flex flex-col items-center gap-5">
              <div className="rounded-xl overflow-hidden p-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]" style={{ background: bg }}>
                <canvas ref={canvasRef} className="block rounded-lg" />
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={downloadPng}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(251,191,36,0.3)]"
                >
                  <Download className="h-4 w-4" /> Download PNG
                </button>
                <button
                  onClick={downloadSvg}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-white/[0.12] hover:bg-white/[0.05] text-white/75 hover:text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <Download className="h-4 w-4" /> Download SVG
                </button>
              </div>
            </div>
          </Section>
        ) : (
          <EmptyState
            icon={<QrCode className="h-5 w-5" />}
            title="Type something above to generate a QR code"
            subtitle="Paste a URL, Wi-Fi credentials, plain text — anything you want to share."
          />
        )}
      </div>
    </ToolPageLayout>
  );
}
