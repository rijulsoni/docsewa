import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file
const MAX_FILES = 20;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed.` },
        { status: 400 }
      );
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 50 MB limit.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const type = file.type.toLowerCase();

      let image;
      if (type === 'image/jpeg' || type === 'image/jpg') {
        image = await pdfDoc.embedJpg(bytes);
      } else if (type === 'image/png') {
        image = await pdfDoc.embedPng(bytes);
      } else {
        // Skip unsupported image types gracefully
        continue;
      }

      // Fit image to A4 if larger, otherwise keep original size
      const A4_WIDTH = 595;
      const A4_HEIGHT = 842;
      let { width, height } = image;

      if (width > A4_WIDTH || height > A4_HEIGHT) {
        const scale = Math.min(A4_WIDTH / width, A4_HEIGHT / height);
        width = width * scale;
        height = height * scale;
      }

      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
    }

    if (pdfDoc.getPageCount() === 0) {
      return NextResponse.json(
        { error: 'No supported images found. Please upload JPG or PNG files.' },
        { status: 400 }
      );
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to convert images to PDF. Please check your files and try again.' },
      { status: 500 }
    );
  }
}
