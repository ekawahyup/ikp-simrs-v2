import { NextResponse } from 'next/server';

// Mock data for Patient from SIMRS
const mockDatabase: Record<string, any> = {
  'RM123456': {
    name: 'Budi Santoso',
    age: 45,
    gender: 'Laki-laki',
    room: 'Melati 3',
    admissionDate: '2026-08-01',
    diagnose: 'Typhoid Fever'
  },
  'RM987654': {
    name: 'Siti Aminah',
    age: 62,
    gender: 'Perempuan',
    room: 'ICU Bed 2',
    admissionDate: '2026-08-02',
    diagnose: 'Post-op CABG'
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rm = searchParams.get('rm');

  if (!rm) {
    return NextResponse.json({ error: 'Parameter "rm" wajib diisi' }, { status: 400 });
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const patient = mockDatabase[rm.toUpperCase()];

  if (!patient) {
    return NextResponse.json({ error: 'Data pasien tidak ditemukan di SIMRS' }, { status: 404 });
  }

  return NextResponse.json(patient);
}
