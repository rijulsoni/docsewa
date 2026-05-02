import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    const name = file.name.toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.doc')) {
      return NextResponse.json({ error: 'Only .docx files are supported.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });

    return new NextResponse(result.value, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.docx?$/i, '')}.txt"`,
        'Cache-Control': 'no-store',
        'X-Word-Count': String(result.value.trim().split(/\s+/).filter(Boolean).length),
        'X-Char-Count': String(result.value.length),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to extract text. Please check your file.' }, { status: 500 });
  }
}
