import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from '@cantoo/pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userPassword  = (formData.get('userPassword')  as string | null) ?? '';
    const ownerPassword = (formData.get('ownerPassword') as string | null) || userPassword;
    const allowPrinting  = formData.get('allowPrinting')  !== 'false';
    const allowCopying   = formData.get('allowCopying')   !== 'false';
    const allowModifying = formData.get('allowModifying') !== 'false';

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf'))
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    if (!userPassword)
      return NextResponse.json({ error: 'A user password is required.' }, { status: 400 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    pdfDoc.encrypt({
      userPassword,
      ownerPassword,
      permissions: {
        printing: allowPrinting ? 'highResolution' : false,
        copying: allowCopying,
        modifying: allowModifying,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    const outBytes = await pdfDoc.save();
    const safeName = file.name.replace(/\.pdf$/i, '') + '_protected.pdf';

    return new NextResponse(outBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to protect PDF.' }, { status: 500 });
  }
}
