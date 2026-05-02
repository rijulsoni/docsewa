import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sheetName = formData.get('sheetName') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls'))
      return NextResponse.json({ error: 'Only .xlsx and .xls files are supported.' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: 'buffer' });

    const targetSheet = sheetName && wb.SheetNames.includes(sheetName)
      ? sheetName
      : wb.SheetNames[0];

    const ws = wb.Sheets[targetSheet];
    if (!ws) return NextResponse.json({ error: 'Sheet not found.' }, { status: 400 });

    const csv = XLSX.utils.sheet_to_csv(ws);
    const safeName = targetSheet.replace(/[^a-z0-9_\-]/gi, '_');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeName}.csv"`,
        'Cache-Control': 'no-store',
        'X-Sheet-Name': targetSheet,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to convert Excel to CSV.' }, { status: 500 });
  }
}
