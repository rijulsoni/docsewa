import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

type Dims = { pw: number; ph: number; iw: number; ih: number };
const POSITIONS: Record<string, (d: Dims) => { x: number; y: number }> = {
  'bottom-right': ({ pw, iw })      => ({ x: pw - iw - 24, y: 24 }),
  'bottom-left':  ()                => ({ x: 24, y: 24 }),
  'top-right':    ({ pw, ph, iw, ih }) => ({ x: pw - iw - 24, y: ph - ih - 24 }),
  'top-left':     ({ ph, ih })      => ({ x: 24, y: ph - ih - 24 }),
};

export async function POST(request: NextRequest) {
  try {
    const formData        = await request.formData();
    const file            = formData.get('file') as File | null;
    const sigDataUrl      = formData.get('signatureDataUrl') as string | null;
    const pageStr         = (formData.get('page') as string | null) ?? '1';
    const position        = (formData.get('position') as string | null) ?? 'bottom-right';
    const scaleStr        = (formData.get('scale') as string | null) ?? '100';

    if (!file || !sigDataUrl)
      return NextResponse.json({ error: 'File and signature are required.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf'))
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });

    const pdfBytes = new Uint8Array(await file.arrayBuffer());
    const pdfDoc   = await PDFDocument.load(pdfBytes);

    const base64 = sigDataUrl.replace(/^data:image\/png;base64,/, '');
    const imgBytes = Buffer.from(base64, 'base64');
    const pngImage = await pdfDoc.embedPng(imgBytes);

    const pageCount = pdfDoc.getPageCount();
    const pageIndex = Math.max(0, Math.min(parseInt(pageStr, 10) - 1, pageCount - 1));
    const page      = pdfDoc.getPage(pageIndex);
    const { width: pw, height: ph } = page.getSize();

    const scale = Math.max(0.25, Math.min(2, parseFloat(scaleStr) / 100));
    const iw = pngImage.width  * scale;
    const ih = pngImage.height * scale;

    const posFn = POSITIONS[position] ?? POSITIONS['bottom-right'];
    const { x, y } = posFn({ pw, ph, iw, ih });

    page.drawImage(pngImage, { x, y, width: iw, height: ih });

    const outBytes = await pdfDoc.save();
    const safeName = file.name.replace(/\.pdf$/i, '') + '_signed.pdf';

    return new NextResponse(outBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to sign PDF.' }, { status: 500 });
  }
}
