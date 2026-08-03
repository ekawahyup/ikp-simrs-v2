import { NextResponse } from 'next/server';
import { addLaporanRow, getAllLaporan } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await getAllLaporan();
    if (!data || data.length === 0) {
      return NextResponse.json({ fallback: true, data: [] });
    }
    return NextResponse.json({ fallback: false, data });
  } catch (error: any) {
    console.error("GSheet Get Error:", error);
    return NextResponse.json({ error: error.message, fallback: true }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Simpan ke Google Sheets
    const success = await addLaporanRow(body);
    
    if (success) {
      return NextResponse.json({ message: 'Berhasil disimpan ke Google Sheets' });
    } else {
      return NextResponse.json({ message: 'Google Sheets belum dikonfigurasi, beralih ke Local Storage.' }, { status: 202 });
    }
  } catch (error: any) {
    console.error("GSheet Post Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
