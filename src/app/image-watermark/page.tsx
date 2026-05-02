"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ToolPageLayout from '@/components/pages/ToolPageLayout';
import UploadDropzone from '@/components/pages/UploadDropzone';
import { Stamp, Download, X } from 'lucide-react';
import { toast } from 'sonner';

type Position = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br';

const POSITION_LABELS: Record<Position, string> = {
  tl: 'TL', tc: 'TC', tr: 'TR',
  ml: 'ML', mc: 'MC', mr: 'MR',
  bl: 'BL', bc: 'BC', br: 'BR',
};

const POSITION_GRID: Position[][] = [
  ['tl', 'tc', 'tr'],
  ['ml', 'mc', 'mr'],
  ['bl', 'bc', 'br'],
];

const PADDING = 20;

function computeXY(
  pos: Position,
  cw: number,
  ch: number,
  tw: number,
  fontSize: number,
): { x: number; y: number } {
  const hMap: Record<string, number> = {
    l: PADDING + tw / 2,
    c: cw / 2,
    r: cw - PADDING - tw / 2,
  };
  const vMap: Record<string, number> = {
    t: PADDING + fontSize,
    m: ch / 2 + fontSize / 3,
    b: ch - PADDING,
  };
  const hKey = pos[1]; // second char: l/c/r
  const vKey = pos[0]; // first char: t/m/b
  return { x: hMap[hKey], y: vMap[vKey] };
}

export default function ImageWatermarkPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [imgSrc, setImgSrc]   = useState<string | null>(null);
  const [text, setText]       = useState('DocSewa');
  const [fontSize, setSize]   = useState(36);
  const [opacity, setOpacity] = useState(70);
  const [position, setPos]    = useState<Position>('br');
  const [color, setColor]     = useState('#ffffff');

  const imgRef     = useRef<HTMLImageElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const drawWatermark = useCallback(() => {
    const img = imgRef.current;
    const canvas = previewRef.current;
    if (!img || !canvas || img.naturalWidth === 0) return;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    // Scale preview to max 500px wide
    const maxW = 500;
    const scale = nw > maxW ? maxW / nw : 1;
    const dw = Math.round(nw * scale);
    const dh = Math.round(nh * scale);

    canvas.width  = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, dw, dh);

    const scaledFont = Math.round(fontSize * scale);
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.font = `bold ${scaledFont}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const tw = ctx.measureText(text).width;
    const { x, y } = computeXY(position, dw, dh, tw, scaledFont);
    ctx.fillText(text, x, y);
    ctx.restore();
  }, [text, fontSize, opacity, position, color]);

  useEffect(() => {
    if (imgSrc) drawWatermark();
  }, [imgSrc, drawWatermark]);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith('image/')) { toast.error('Upload an image file.'); return; }
    setFile(f);
    setImgSrc(URL.createObjectURL(f));
  };

  const handleDownload = async () => {
    const img = imgRef.current;
    if (!img || !file) return;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width  = nw;
    canvas.height = nh;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, nw, nh);

    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const tw = ctx.measureText(text).width;
    const { x, y } = computeXY(position, nw, nh, tw, fontSize);
    ctx.fillText(text, x, y);
    ctx.restore();

    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, '_watermarked.png');
    a.click();
    toast.success('Downloaded with watermark');
  };

  const reset = () => { setFile(null); setImgSrc(null); };

  return (
    <ToolPageLayout
      title="Image Watermark"
      description="Add a custom text watermark at any of 9 positions with adjustable size, opacity, and color."
      icon={<Stamp className="h-7 w-7" />}
      accentColor="rgba(168,85,247,0.35)"
      features={[
        'Add custom text watermark to any image',
        'Choose from 9 placement positions',
        'Adjustable font size and opacity',
        'Custom watermark color picker',
        'Live canvas preview updates instantly',
        'Download as PNG — runs in browser',
      ]}
    >
      {!file ? (
        <UploadDropzone
          onFiles={onFiles}
          accept="image/*"
          fileLabel="image"
          hint="JPG, PNG, WebP — any raster image"
          accentClass="border-purple-400/60 bg-purple-400/[0.06] shadow-[0_0_40px_rgba(168,85,247,0.12)]"
          buttonClass="bg-purple-500 hover:bg-purple-400 shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
          icon="image"
        />
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Stamp className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
              <p className="text-xs text-white/30">Ready for watermark</p>
            </div>
            <button
              onClick={reset}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hidden source image */}
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="watermark source"
              onLoad={drawWatermark}
              className="hidden"
            />
          )}

          {/* Controls */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-xs text-white/40 mb-1.5">Watermark Text</p>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter watermark text"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-purple-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1.5">Font Size: {fontSize}px</p>
                <input
                  type="range"
                  min={12}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1.5">Opacity: {opacity}%</p>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div>
                <p className="text-xs text-white/40 mb-2">Position</p>
                <div className="grid grid-cols-3 gap-1">
                  {POSITION_GRID.map((row) =>
                    row.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPos(pos)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all border ${
                          position === pos
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'border-white/[0.08] text-white/30 hover:bg-white/[0.04] hover:text-white/60'
                        }`}
                      >
                        {POSITION_LABELS[pos]}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 mb-2">Color</p>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-white/[0.08] bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Live preview */}
          {imgSrc && (
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Preview</p>
              <canvas
                ref={previewRef}
                className="w-full rounded-xl border border-white/[0.06] object-contain"
                style={{ maxWidth: 500 }}
              />
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
