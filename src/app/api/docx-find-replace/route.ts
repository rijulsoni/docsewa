import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// DOCX stores text split across multiple <w:t> runs within a paragraph.
// A reliable approach is to reconstruct the plain-text of each paragraph,
// perform the replacement, then re-inject the result into a single run.
function replaceInDocXml(xml: string, find: string, replace: string, caseSensitive: boolean): { xml: string; count: number } {
  let count = 0;

  // Process each paragraph independently
  const result = xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (para) => {
    // Collect all text segments from <w:t> tags in this paragraph
    const texts: string[] = [];
    const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let m;
    while ((m = tRegex.exec(para)) !== null) texts.push(m[1]);

    const fullText = texts.join('');
    const flags = caseSensitive ? 'g' : 'gi';
    const searchRegex = new RegExp(escapeRegex(find), flags);
    const matches = fullText.match(searchRegex);
    if (!matches) return para;

    count += matches.length;
    const newText = fullText.replace(searchRegex, replace);

    // Replace all <w:t> runs in the paragraph, keeping rPr (run properties) from first run
    const firstRunProps = para.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? '';

    // Build a single replacement run
    const newRun = `<w:r>${firstRunProps}<w:t xml:space="preserve">${escapeXml(newText)}</w:t></w:r>`;

    // Remove all existing runs, inject new one before </w:p>
    let cleaned = para.replace(/<w:r\b[\s\S]*?<\/w:r>/g, '');
    cleaned = cleaned.replace('</w:p>', `${newRun}</w:p>`);
    return cleaned;
  });

  return { xml: result, count };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const find    = (formData.get('find')    as string) || '';
    const replace = (formData.get('replace') as string) || '';
    const caseSensitive = formData.get('caseSensitive') === 'true';

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json({ error: 'Only .docx files are supported.' }, { status: 400 });
    }
    if (!find.trim()) return NextResponse.json({ error: 'Search text cannot be empty.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);

    let docXml = await zip.file('word/document.xml')!.async('string');
    const { xml: updatedXml, count } = replaceInDocXml(docXml, find, replace, caseSensitive);
    docXml = updatedXml;

    zip.file('word/document.xml', docXml);
    const outBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    const baseName = file.name.replace(/\.docx$/i, '');

    return new NextResponse(Buffer.from(outBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${baseName}-replaced.docx"`,
        'Cache-Control': 'no-store',
        'X-Replace-Count': String(count),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process document. Please check your file.' }, { status: 500 });
  }
}
