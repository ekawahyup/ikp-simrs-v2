import { NextResponse } from 'next/server';
import { getAllAkses, addAksesRow, deleteAksesRow } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await getAllAkses();
    return NextResponse.json({ data, fallback: data.length === 0 });
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
