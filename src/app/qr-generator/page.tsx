"use client"
import React, { useState, useEffect, useRef } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import { QrCode, Download } from 'lucide-react';
import { toast } from 'sonner';

type ECLevel = 'L' | 'M' | 'Q' | 'H';

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
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Content</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com or any text…"
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-yellow-500/40 resize-none"
          />
        </div>

        {/* Options */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          {/* Size */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Size</p>
              <p className="text-xs font-semibold text-yellow-300">{size} × {size} px</p>
            </div>
            <input type="range" min={128} max={512} step={32} value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-yellow-500" />
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>128 px</span><span>512 px</span>
            </div>
          </div>

          {/* Error correction */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Error Correction</p>
            <div className="flex gap-2">
              {(['L', 'M', 'Q', 'H'] as ECLevel[]).map((level) => (
                <button key={level} onClick={() => setEcLevel(level)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    ecLevel === level
                      ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
                      : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}>{level}</button>
              ))}
            </div>
            <p className="text-[10px] text-white/20 mt-1.5">
              L=7% · M=15% · Q=25% · H=30% damage recovery
            </p>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Foreground</p>
              <div className="flex items-center gap-2">
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer p-0.5" />
                <span className="text-xs text-white/40 font-mono">{fg}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Background</p>
              <div className="flex items-center gap-2">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer p-0.5" />
                <span className="text-xs text-white/40 font-mono">{bg}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR preview */}
        {text.trim() && (
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center gap-4">
            <div className="rounded-xl overflow-hidden p-2" style={{ background: bg }}>
              <canvas ref={canvasRef} className="block rounded-lg" />
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={downloadPng}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(251,191,36,0.3)]">
                <Download className="h-4 w-4" /> PNG
              </button>
              <button onClick={downloadSvg}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-white/[0.12] hover:bg-white/[0.05] text-white/70 hover:text-white text-sm font-semibold rounded-xl transition-all">
                <Download className="h-4 w-4" /> SVG
              </button>
            </div>
          </div>
        )}

        {!text.trim() && (
          <div className="flex items-center justify-center gap-3 py-8 text-white/20">
            <QrCode className="h-6 w-6" />
            <p className="text-sm">Type something above to generate a QR code</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
