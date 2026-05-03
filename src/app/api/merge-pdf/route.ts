import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { auth } from '@clerk/nextjs/server';
import { getSubscriptionStatus } from '@/lib/usage';
import { SubscriptionStatus } from '@/generated/prisma';

const LIMITS = {
  [SubscriptionStatus.FREE]: 10 * 1024 * 1024, // 10 MB
  [SubscriptionStatus.PRO]: 50 * 1024 * 1024, // 50 MB
  [SubscriptionStatus.TEAMS]: 200 * 1024 * 1024, // 200 MB
};

const MAX_FILES = 20;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const status = userId ? await getSubscriptionStatus(userId) : SubscriptionStatus.FREE;
    const maxFileSize = LIMITS[status];

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 PDF files are required to merge.' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed.` },
        { status: 400 }
      );
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `File "${file.name}" is not a PDF.` },
          { status: 400 }
        );
      }

      if (file.size > maxFileSize) {
        return NextResponse.json(
          { 
            error: `File "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds your ${status === 'FREE' ? '10MB' : status === 'PRO' ? '50MB' : '200MB'} limit. Please upgrade to Pro for larger files.` 
          },
          { status: 403 }
        );
      }

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to merge PDFs. Please ensure all files are valid PDFs.' },
      { status: 500 }
    );
  }
}
