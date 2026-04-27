import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderRaw = formData.get('order') as string;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }
    if (!orderRaw?.trim()) {
      return NextResponse.json({ error: 'Page order is required.' }, { status: 400 });
    }

    const order = orderRaw.split(',').map((s) => parseInt(s.trim(), 10));
    if (order.some(isNaN)) {
      return NextResponse.json({ error: 'Invalid page order data.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(bytes);
    const total = sourcePdf.getPageCount();

    // Validate order indices
    if (order.length !== total || order.some((i) => i < 0 || i >= total)) {
      return NextResponse.json({ error: 'Page order data does not match the PDF.' }, { status: 400 });
    }

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(sourcePdf, order);
    pages.forEach((p) => newDoc.addPage(p));

    const pdfBytes = await newDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reordered.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to reorder pages. Please check your file.' }, { status: 500 });
  }
}
