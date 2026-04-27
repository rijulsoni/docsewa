import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';

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
    const angle = parseInt((formData.get('angle') as string) || '90', 10);

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }
    if (![90, 180, 270].includes(angle)) {
      return NextResponse.json({ error: 'Angle must be 90, 180, or 270.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const totalPages = pdfDoc.getPageCount();
    const pageIndices = parsePageList(pagesInput, totalPages);

    for (const idx of pageIndices) {
      const page = pdfDoc.getPage(idx);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angle) % 360));
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rotated.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to rotate PDF. Please check your file.' }, { status: 500 });
  }
}
