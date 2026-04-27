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
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    // Re-serialise with object streams — compresses cross-reference tables
    // and removes dead/unused objects accumulated from prior edits
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="compressed.pdf"',
        'Cache-Control': 'no-store',
        'X-Original-Size': String(bytes.byteLength),
        'X-Compressed-Size': String(pdfBytes.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to compress PDF. Please check your file.' }, { status: 500 });
  }
}
