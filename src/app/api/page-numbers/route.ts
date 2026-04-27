import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

type Position = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
type Format = 'n' | 'Page n' | 'n / N' | 'Page n of N';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

function buildLabel(format: Format, current: number, total: number): string {
  switch (format) {
    case 'Page n': return `Page ${current}`;
    case 'n / N': return `${current} / ${total}`;
    case 'Page n of N': return `Page ${current} of ${total}`;
    default: return String(current);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const position = (formData.get('position') as Position) || 'bottom-center';
    const format = (formData.get('format') as Format) || 'n';
    const startFrom = Math.max(1, parseInt((formData.get('startFrom') as string) || '1', 10));
    const fontSize = Math.min(36, Math.max(6, parseInt((formData.get('fontSize') as string) || '11', 10)));
    const colorHex = (formData.get('color') as string) || '#333333';
    const margin = 24;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }

    const [r, g, b] = hexToRgb(colorHex);
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const total = pages.length;

    pages.forEach((page, i) => {
      const { width, height } = page.getSize();
      const label = buildLabel(format, startFrom + i, total + startFrom - 1);
      const textWidth = font.widthOfTextAtSize(label, fontSize);

      let x: number;
      let y: number;

      // X position
      if (position.endsWith('left')) x = margin;
      else if (position.endsWith('right')) x = width - textWidth - margin;
      else x = (width - textWidth) / 2;

      // Y position
      if (position.startsWith('top')) y = height - margin - fontSize;
      else y = margin;

      page.drawText(label, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        rotate: degrees(0),
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="numbered.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to add page numbers. Please check your file.' }, { status: 500 });
  }
}
