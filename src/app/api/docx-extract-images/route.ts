import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'emf', 'wmf']);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json({ error: 'Only .docx files are supported.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);

    // Collect all files under word/media/
    const imageFiles: { name: string; data: Uint8Array }[] = [];
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (!path.startsWith('word/media/') || zipEntry.dir) continue;
      const ext = path.split('.').pop()?.toLowerCase() ?? '';
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      const data = await zipEntry.async('uint8array');
      imageFiles.push({ name: path.split('/').pop()!, data });
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'No images found in this document.' }, { status: 404 });
    }

    // Package into a new ZIP
    const outZip = new JSZip();
    for (const img of imageFiles) {
      outZip.file(img.name, img.data);
    }
    const outBytes = await outZip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    const baseName = file.name.replace(/\.docx$/i, '');

    return new NextResponse(Buffer.from(outBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${baseName}-images.zip"`,
        'Cache-Control': 'no-store',
        'X-Image-Count': String(imageFiles.length),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to extract images. Please check your file.' }, { status: 500 });
  }
}
