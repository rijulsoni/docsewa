import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

// Extract the body XML content (everything inside <w:body>…</w:body>, minus the final <w:sectPr>)
function extractBodyContent(docXml: string): string {
  const bodyMatch = docXml.match(/<w:body>([\s\S]*)<\/w:body>/);
  if (!bodyMatch) return '';
  // Remove trailing <w:sectPr> block (page layout — keep only from first doc)
  return bodyMatch[1].replace(/<w:sectPr[\s\S]*?<\/w:sectPr>\s*$/, '').trim();
}

// A simple page-break paragraph to insert between merged documents
const PAGE_BREAK = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json({ error: 'Please upload at least 2 DOCX files.' }, { status: 400 });
    }

    for (const f of files) {
      if (!f.name.toLowerCase().endsWith('.docx')) {
        return NextResponse.json({ error: `"${f.name}" is not a .docx file.` }, { status: 400 });
      }
    }

    // Use first file as the base document
    const baseBytes = await files[0].arrayBuffer();
    const baseZip = await JSZip.loadAsync(baseBytes);
    let baseDocXml = await baseZip.file('word/document.xml')!.async('string');

    const allBodyContent: string[] = [extractBodyContent(baseDocXml)];

    for (let i = 1; i < files.length; i++) {
      const bytes = await files[i].arrayBuffer();
      const zip = await JSZip.loadAsync(bytes);
      const docXml = await zip.file('word/document.xml')?.async('string') ?? '';
      const content = extractBodyContent(docXml);
      if (content) allBodyContent.push(PAGE_BREAK + content);
    }

    // Reconstruct the base document's body with all merged content
    const sectPrMatch = baseDocXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
    const sectPr = sectPrMatch ? sectPrMatch[0] : '';
    const mergedBody = `<w:body>${allBodyContent.join('\n')}\n${sectPr}</w:body>`;

    baseDocXml = baseDocXml.replace(/<w:body>[\s\S]*<\/w:body>/, mergedBody);
    baseZip.file('word/document.xml', baseDocXml);

    const outBytes = await baseZip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

    return new NextResponse(Buffer.from(outBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="merged.docx"',
        'Cache-Control': 'no-store',
        'X-File-Count': String(files.length),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to merge documents. Please check your files.' }, { status: 500 });
  }
}
