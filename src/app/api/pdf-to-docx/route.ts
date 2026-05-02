import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

function looksLikeHeading(line: string): boolean {
  const trimmed = line.trim();
  // Short lines in ALL CAPS or ending without punctuation heuristic
  if (trimmed.length === 0) return false;
  if (trimmed.length <= 80 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return true;
  return false;
}

function buildParagraphs(text: string) {
  const lines = text.split('\n');
  const paragraphs: Paragraph[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: '' }));
      i++;
      continue;
    }

    if (looksLikeHeading(line)) {
      paragraphs.push(new Paragraph({
        text: line.trim(),
        heading: HeadingLevel.HEADING_2,
      }));
      i++;
      continue;
    }

    // Accumulate wrapped lines into a single paragraph
    let para = line;
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() !== '' &&
      !looksLikeHeading(lines[i + 1])
    ) {
      i++;
      para += ' ' + lines[i].trimEnd();
    }

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: para.trim() })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
    }));
    i++;
  }

  return paragraphs;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(bytes);
    const text = data.text || '';

    const paragraphs = buildParagraphs(text);

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const baseName = file.name.replace(/\.pdf$/i, '');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${baseName}.docx"`,
        'Cache-Control': 'no-store',
        'X-Page-Count': String(data.numpages),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to convert PDF. Please check your file.' }, { status: 500 });
  }
}
