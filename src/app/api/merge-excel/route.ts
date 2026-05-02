import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const mode = (formData.get('mode') as string | null) || 'sheets';

    if (!files.length) return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
    if (files.length < 2) return NextResponse.json({ error: 'Upload at least 2 files to merge.' }, { status: 400 });

    const outWb = XLSX.utils.book_new();

    if (mode === 'sheets') {
      const usedNames = new Set<string>();
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const wb = XLSX.read(buffer, { type: 'buffer' });
        for (const sName of wb.SheetNames) {
          let finalName = sName.slice(0, 31);
          let suffix = 1;
          while (usedNames.has(finalName)) {
            const tag = `_${suffix++}`;
            finalName = sName.slice(0, 31 - tag.length) + tag;
          }
          usedNames.add(finalName);
          XLSX.utils.book_append_sheet(outWb, wb.Sheets[sName], finalName);
        }
      }
    } else {
      // stack mode: first sheet of each file stacked vertically
      const allRows: unknown[][] = [];
      let headerWritten = false;
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
        if (!headerWritten) {
          allRows.push(...rows);
          headerWritten = true;
        } else {
          allRows.push(...rows.slice(1));
        }
      }
      const mergedWs = XLSX.utils.aoa_to_sheet(allRows);
      XLSX.utils.book_append_sheet(outWb, mergedWs, 'Merged');
    }

    const buf = Buffer.from(XLSX.write(outWb, { type: 'buffer', bookType: 'xlsx' }));

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="merged.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to merge Excel files.' }, { status: 500 });
  }
}
