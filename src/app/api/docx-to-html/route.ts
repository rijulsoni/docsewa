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
    const result = await mammoth.convertToHtml({ buffer: Buffer.from(bytes) });

    const baseName = file.name.replace(/\.docx?$/i, '');
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.7; }
    h1,h2,h3,h4,h5,h6 { font-weight: bold; margin-top: 1.5em; }
    p { margin: 0.8em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    td, th { border: 1px solid #ccc; padding: 8px 12px; }
    ul, ol { padding-left: 2em; }
  </style>
</head>
<body>
${result.value}
</body>
</html>`;

    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseName}.html"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to convert to HTML. Please check your file.' }, { status: 500 });
  }
}
