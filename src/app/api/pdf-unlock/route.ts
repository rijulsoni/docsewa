import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from '@cantoo/pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = (formData.get('password') as string | null) ?? '';

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf'))
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    if (!password)
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    // load with password — throws if wrong
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(bytes, { password } as Parameters<typeof PDFDocument.load>[1]);
    } catch {
      return NextResponse.json({ error: 'Incorrect password or unsupported encryption.' }, { status: 400 });
    }
    const outBytes = await pdfDoc.save();
    const safeName = file.name.replace(/\.pdf$/i, '') + '_unlocked.pdf';

    return new NextResponse(outBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to unlock PDF.' }, { status: 500 });
  }
}
