import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sheetName = (formData.get('sheetName') as string | null) || 'Sheet1';

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && file.type !== 'text/csv')
      return NextResponse.json({ error: 'Only .csv files are supported.' }, { status: 400 });

    const text = await file.text();
    const wb = XLSX.read(text, { type: 'string' });
    const srcSheet = wb.Sheets[wb.SheetNames[0]];

    const outWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWb, srcSheet, sheetName.slice(0, 31));

    const buf = Buffer.from(XLSX.write(outWb, { type: 'buffer', bookType: 'xlsx' }));
    const baseName = file.name.replace(/\.csv$/i, '');

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${baseName}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to convert CSV to Excel.' }, { status: 500 });
  }
}
