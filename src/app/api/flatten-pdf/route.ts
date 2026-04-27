import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);

    const form = pdfDoc.getForm();
    const fieldCount = form.getFields().length;
    form.flatten();

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="flattened.pdf"',
        'Cache-Control': 'no-store',
        'X-Field-Count': String(fieldCount),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to flatten PDF. Please check your file.' }, { status: 500 });
  }
}
