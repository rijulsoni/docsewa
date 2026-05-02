import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sheetName = formData.get('sheetName') as string | null;
    const useKeys = formData.get('useFirstRowAsKeys') !== 'false';

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

    const json = useKeys
      ? XLSX.utils.sheet_to_json(ws, { defval: null })
      : XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

    return NextResponse.json(json, {
      headers: {
        'X-Row-Count': String(Array.isArray(json) ? json.length : 0),
        'X-Sheet-Name': targetSheet,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to convert Excel to JSON.' }, { status: 500 });
  }
}
