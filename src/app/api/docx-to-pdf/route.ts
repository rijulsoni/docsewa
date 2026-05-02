import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_W = 595;   // A4 points
const PAGE_H = 842;
const MARGIN  = 56;
const LINE_H  = 16;
const FONT_SZ = 11;
const H1_SZ   = 18;
const H2_SZ   = 15;
const H3_SZ   = 13;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function wrapText(text: string, maxWidth: number, font: Awaited<ReturnType<PDFDocument['embedFont']>>, size: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

interface Block { type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'blank'; text: string }

function parseHtml(html: string): Block[] {
  const blocks: Block[] = [];
  const clean = html.replace(/<br\s*\/?>/gi, '\n');

  const matches = clean.matchAll(/<(h1|h2|h3|p|li)[^>]*>([\s\S]*?)<\/\1>/gi);
  for (const m of matches) {
    const tag = m[1].toLowerCase() as Block['type'];
    const inner = m[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').trim();
    if (!inner) { blocks.push({ type: 'blank', text: '' }); continue; }
    blocks.push({ type: tag as Block['type'], text: inner });
  }
  return blocks;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json({ error: 'Only .docx files are supported.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ buffer: Buffer.from(bytes) });
    const blocks = parseHtml(html);

    const pdfDoc = await PDFDocument.create();
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const maxW = PAGE_W - MARGIN * 2;

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const newPage = () => {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    };

    const ensureSpace = (needed: number) => { if (y - needed < MARGIN) newPage(); };

    for (const block of blocks) {
      if (block.type === 'blank') { y -= LINE_H * 0.5; continue; }

      const isH = block.type === 'h1' || block.type === 'h2' || block.type === 'h3';
      const font = isH ? bold : regular;
      const size = block.type === 'h1' ? H1_SZ : block.type === 'h2' ? H2_SZ : block.type === 'h3' ? H3_SZ : FONT_SZ;
      const color = isH ? hexToRgb('#ffffff') : hexToRgb('#cccccc');
      const prefix = block.type === 'li' ? '• ' : '';
      const xOffset = block.type === 'li' ? 14 : 0;

      const lines = wrapText(prefix + block.text, maxW - xOffset, font, size);
      const blockH = lines.length * LINE_H + (isH ? LINE_H * 0.4 : 0);

      ensureSpace(blockH);
      if (isH) y -= LINE_H * 0.3;

      for (const line of lines) {
        ensureSpace(LINE_H);
        page.drawText(line, { x: MARGIN + xOffset, y, font, size, color });
        y -= LINE_H;
      }
      if (isH) y -= LINE_H * 0.2;
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.docx$/i, '');

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${baseName}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to convert. Please check your file.' }, { status: 500 });
  }
}
