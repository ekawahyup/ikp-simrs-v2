import { NextResponse } from 'next/server';
import { getAllAkses, addAksesRow, deleteAksesRow } from '@/lib/googleSheets';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized', fallback: true }, { status: 401 });
    }

    let data = await getAllAkses();
    if (data.length === 0) {
      return NextResponse.json({ data, fallback: true });
    }

    const userRole = session.user.role;
    const userUnits = session.user.unit ? session.user.unit.split(',').map((u: string) => u.trim()) : [];

    if (userRole === 'VERIFIKATOR') {
      // Hanya tampilkan pengguna (PELAPOR/VERIFIKATOR) yang unitnya beririsan dengan unit Verifikator ini
      data = data.filter((row: any) => {
        const rowUnits = (row.Unit || row.UNIT || row.unit || '').split(',').map((u: string) => u.trim());
        return rowUnits.some((ru: string) => userUnits.includes(ru));
      });
    }

    return NextResponse.json({ data, fallback: false });
  } catch (error) {
    return NextResponse.json({ fallback: true, data: [] }, { status: 202 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const success = await addAksesRow(body);
    if (success) {
      return NextResponse.json({ message: 'Success' }, { status: 201 });
    } else {
      return NextResponse.json({ fallback: true }, { status: 202 });
    }
  } catch (error) {
    return NextResponse.json({ fallback: true }, { status: 202 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const indexStr = searchParams.get('index');
    if (indexStr === null) return NextResponse.json({ error: 'Missing index' }, { status: 400 });
    
    const index = parseInt(indexStr, 10);
    const success = await deleteAksesRow(index);
    if (success) {
      return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } else {
      return NextResponse.json({ fallback: true }, { status: 202 });
    }
  } catch (error) {
    return NextResponse.json({ fallback: true }, { status: 202 });
  }
}
