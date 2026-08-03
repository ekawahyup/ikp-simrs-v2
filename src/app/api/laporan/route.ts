import { NextResponse } from 'next/server';
import { addLaporanRow, getAllLaporan } from '@/lib/googleSheets';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized', fallback: true }, { status: 401 });
    }

    let data = await getAllLaporan();
    if (!data || data.length === 0) {
      return NextResponse.json({ fallback: true, data: [] });
    }

    // Role-Based Filtering
    const userRole = session.user.role;
    const userUnits = session.user.unit ? session.user.unit.split(',').map((u: string) => u.trim()) : [];

    if (userRole === 'VERIFIKATOR') {
      data = data.filter((report: any) => userUnits.includes(report.unitPelapor) || userUnits.includes(report.lokasi));
    } else if (userRole === 'PELAPOR') {
      data = data.filter((report: any) => report.namaPelapor === session.user.name);
    }
    // ADMIN_IT & KOMITE_MUTU see all

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
