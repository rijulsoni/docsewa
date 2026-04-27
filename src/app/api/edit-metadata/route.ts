import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file     = formData.get('file')     as File;
    const title    = (formData.get('title')    as string | null) ?? '';
    const author   = (formData.get('author')   as string | null) ?? '';
    const subject  = (formData.get('subject')  as string | null) ?? '';
    const keywords = (formData.get('keywords') as string | null) ?? '';
    const creator  = (formData.get('creator')  as string | null) ?? '';

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);

    if (title.trim())    pdfDoc.setTitle(title.trim());
    if (author.trim())   pdfDoc.setAuthor(author.trim());
    if (subject.trim())  pdfDoc.setSubject(subject.trim());
    if (keywords.trim()) pdfDoc.setKeywords(keywords.split(',').map((k) => k.trim()).filter(Boolean));
    if (creator.trim())  pdfDoc.setCreator(creator.trim());

    pdfDoc.setModificationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="updated-metadata.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update metadata. Please check your file.' }, { status: 500 });
  }
}
