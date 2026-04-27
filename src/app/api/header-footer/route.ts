import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
    : { r: 0.3, g: 0.3, b: 0.3 };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file       = formData.get('file')      as File;
    const text       = (formData.get('text')      as string) || '';
    const position   = (formData.get('position')  as string) || 'footer';   // 'header' | 'footer'
    const alignment  = (formData.get('alignment') as string) || 'center';   // 'left' | 'center' | 'right'
    const fontSize   = Math.max(6, Math.min(36, parseFloat((formData.get('fontSize') as string) || '11')));
    const colorHex   = (formData.get('color')     as string) || '#888888';
    const margin     = Math.max(10, parseFloat((formData.get('margin') as string) || '30'));

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }
    if (!text.trim()) {
      return NextResponse.json({ error: 'Text cannot be empty.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { r, g, b } = hexToRgb(colorHex);
    const totalPages = pdfDoc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Support {page} and {total} placeholders
      const resolvedText = text
        .replace(/\{page\}/g, String(i + 1))
        .replace(/\{total\}/g, String(totalPages));

      const textWidth = font.widthOfTextAtSize(resolvedText, fontSize);

      let x: number;
      if (alignment === 'left')       x = margin;
      else if (alignment === 'right') x = width - textWidth - margin;
      else                            x = (width - textWidth) / 2;

      const y = position === 'header'
        ? height - margin - fontSize
        : margin;

      page.drawText(resolvedText, {
        x: Math.max(0, x),
        y,
        font,
        size: fontSize,
        color: rgb(r, g, b),
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="header-footer.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to add header/footer. Please check your file.' }, { status: 500 });
  }
}
