import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rm = searchParams.get('rm');

  if (!rm) {
    return NextResponse.json({ error: 'Parameter "rm" wajib diisi' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://rsdgunungjati.com/service/external/get-pasien-by-nocm?nocm=${rm}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IKP-SIMRS-Server/1.0'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Gagal menghubungi server RS. Status: ${res.status}`);
    }

    const json = await res.json();
    
    if (json.status !== 200 || !json.data || json.data.length === 0) {
      return NextResponse.json({ error: json.message || "Data pasien tidak ditemukan di SIMRS" }, { status: 404 });
    }

    const patient = json.data[0];
    
    // Hitung Umur dari tanggal_lahir
    let age = 0;
    if (patient.tanggal_lahir) {
      const birthDate = new Date(patient.tanggal_lahir);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
    }

    // Kembalikan data yang sudah di-format agar Client tidak perlu mem-parsing rumit
    return NextResponse.json({
      name: patient.nama,
      gender: patient.jenis_kelamin,
      age: age,
      room: patient.nama_ruangan,
      bed: patient.no_bed,
      department: patient.nama_departement,
      tglRegistrasi: patient.tglregistrasi,
      noRegistrasi: patient.no_registrasi,
      tanggalLahir: patient.tanggal_lahir
    });
    
  } catch (err: any) {
    console.error("SIMRS Proxy Error:", err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat bridging' }, { status: 500 });
  }
}
