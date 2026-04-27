import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

function parsePageList(input: string, totalPages: number): number[] {
  if (!input.trim() || input.trim() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const indices: number[] = [];
  for (const part of input.split(',')) {
    const t = part.trim();
    if (t.includes('-')) {
      const [s, e] = t.split('-').map((n) => parseInt(n.trim(), 10) - 1);
      for (let i = Math.max(0, s); i <= Math.min(totalPages - 1, e); i++) indices.push(i);
    } else {
      const n = parseInt(t, 10) - 1;
      if (n >= 0 && n < totalPages) indices.push(n);
    }
  }
  return [...new Set(indices)];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pagesInput = (formData.get('pages') as string) || 'all';
    const top    = Math.max(0, parseFloat((formData.get('top')    as string) || '0'));
    const right  = Math.max(0, parseFloat((formData.get('right')  as string) || '0'));
    const bottom = Math.max(0, parseFloat((formData.get('bottom') as string) || '0'));
    const left   = Math.max(0, parseFloat((formData.get('left')   as string) || '0'));

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }
    if (top + bottom <= 0 && left + right <= 0) {
      return NextResponse.json({ error: 'Enter at least one non-zero margin.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const totalPages = pdfDoc.getPageCount();
    const pageIndices = parsePageList(pagesInput, totalPages);

    for (const idx of pageIndices) {
      const page = pdfDoc.getPage(idx);
      const { x, y, width, height } = page.getMediaBox();

      const newWidth  = width  - left - right;
      const newHeight = height - top  - bottom;

      if (newWidth <= 0 || newHeight <= 0) {
        return NextResponse.json(
          { error: `Margins exceed page dimensions on page ${idx + 1}.` },
          { status: 400 }
        );
      }

      // Shift the origin right/up by the left/bottom margins, shrink by all four margins
      page.setMediaBox(x + left, y + bottom, newWidth, newHeight);
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cropped.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to crop PDF. Please check your file.' }, { status: 500 });
  }
}
