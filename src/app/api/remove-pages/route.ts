import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

function parsePageList(input: string, total: number): number[] {
  const indices: number[] = [];
  for (const part of input.split(',')) {
    const t = part.trim();
    if (t.includes('-')) {
      const [s, e] = t.split('-').map((n) => parseInt(n.trim(), 10) - 1);
      for (let i = Math.max(0, s); i <= Math.min(total - 1, e); i++) indices.push(i);
    } else {
      const n = parseInt(t, 10) - 1;
      if (n >= 0 && n < total) indices.push(n);
    }
  }
  return [...new Set(indices)];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pagesInput = formData.get('pages') as string;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }
    if (!pagesInput?.trim()) {
      return NextResponse.json({ error: 'Specify which pages to remove.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const total = pdfDoc.getPageCount();

    const toRemove = new Set(parsePageList(pagesInput, total));
    if (toRemove.size >= total) {
      return NextResponse.json({ error: 'Cannot remove all pages from the PDF.' }, { status: 400 });
    }

    // Keep only pages NOT in the remove set, then copy to a new doc
    const keepIndices = Array.from({ length: total }, (_, i) => i).filter((i) => !toRemove.has(i));

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(pdfDoc, keepIndices);
    pages.forEach((p) => newDoc.addPage(p));

    const pdfBytes = await newDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="removed-pages.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to remove pages. Please check your file.' }, { status: 500 });
  }
}
