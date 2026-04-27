import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const indices: number[] = [];
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10) - 1;
      const end = Math.min(parseInt(endStr.trim(), 10) - 1, totalPages - 1);
      if (isNaN(start) || isNaN(end) || start < 0 || start > end) continue;
      for (let i = start; i <= end; i++) indices.push(i);
    } else {
      const page = parseInt(trimmed, 10) - 1;
      if (!isNaN(page) && page >= 0 && page < totalPages) indices.push(page);
    }
  }

  // Remove duplicates and sort
  return [...new Set(indices)].sort((a, b) => a - b);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const splitMode = (formData.get('splitMode') as string) || 'all';
    const pageRange = (formData.get('pageRange') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds the 100 MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(bytes);
    const totalPages = sourcePdf.getPageCount();

    if (splitMode === 'range') {
      // Extract specific pages into one PDF
      if (!pageRange.trim()) {
        return NextResponse.json({ error: 'Page range is required.' }, { status: 400 });
      }

      const indices = parsePageRange(pageRange, totalPages);
      if (indices.length === 0) {
        return NextResponse.json(
          { error: 'No valid pages found in the specified range.' },
          { status: 400 }
        );
      }

      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, indices);
      pages.forEach((page) => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();

      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="extracted-pages.pdf"',
          'Cache-Control': 'no-store',
        },
      });
    }

    // splitMode === 'all' — return each page as its own PDF, base64 encoded
    const splitFiles: { name: string; data: string }[] = [];

    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(page);
      const pdfBytes = await newPdf.save();
      splitFiles.push({
        name: `page-${i + 1}.pdf`,
        data: Buffer.from(pdfBytes).toString('base64'),
      });
    }

    return NextResponse.json({
      files: splitFiles,
      totalPages,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to split PDF. Please ensure the file is a valid PDF.' },
      { status: 500 }
    );
  }
}
