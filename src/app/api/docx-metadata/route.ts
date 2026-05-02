import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function setOrAdd(xml: string, tag: string, value: string): string {
  const escaped = escapeXml(value);
  const openTag = tag.includes(':') ? tag : tag;
  const regex = new RegExp(`(<${openTag}>)[^<]*(</\\s*${openTag}>)`, 'i');
  if (regex.test(xml)) {
    return xml.replace(regex, `$1${escaped}$2`);
  }
  // Insert before closing </cp:coreProperties>
  return xml.replace('</cp:coreProperties>', `<${openTag}>${escaped}</${openTag}>\n</cp:coreProperties>`);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    const name = file.name.toLowerCase();
    if (!name.endsWith('.docx')) {
      return NextResponse.json({ error: 'Only .docx files are supported.' }, { status: 400 });
    }

    const title    = (formData.get('title')    as string) || '';
    const author   = (formData.get('author')   as string) || '';
    const subject  = (formData.get('subject')  as string) || '';
    const keywords = (formData.get('keywords') as string) || '';
    const company  = (formData.get('company')  as string) || '';
    const description = (formData.get('description') as string) || '';

    const bytes = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);

    // Read or create docProps/core.xml
    let coreXml = await zip.file('docProps/core.xml')?.async('string') ?? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;

    if (title)    coreXml = setOrAdd(coreXml, 'dc:title', title);
    if (author)   coreXml = setOrAdd(coreXml, 'dc:creator', author);
    if (subject)  coreXml = setOrAdd(coreXml, 'dc:subject', subject);
    if (keywords) coreXml = setOrAdd(coreXml, 'cp:keywords', keywords);
    if (description) coreXml = setOrAdd(coreXml, 'dc:description', description);

    // Update modified date
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    coreXml = setOrAdd(coreXml, 'dcterms:modified', now);

    zip.file('docProps/core.xml', coreXml);

    // Update app.xml for company if present
    if (company) {
      let appXml = await zip.file('docProps/app.xml')?.async('string') ?? '';
      if (appXml) {
        if (/<Company>/.test(appXml)) {
          appXml = appXml.replace(/<Company>[^<]*<\/Company>/, `<Company>${escapeXml(company)}</Company>`);
        } else {
          appXml = appXml.replace('</Properties>', `<Company>${escapeXml(company)}</Company>\n</Properties>`);
        }
        zip.file('docProps/app.xml', appXml);
      }
    }

    const outBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    const baseName = file.name.replace(/\.docx$/i, '');

    return new NextResponse(Buffer.from(outBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${baseName}-updated.docx"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update metadata. Please check your file.' }, { status: 500 });
  }
}
