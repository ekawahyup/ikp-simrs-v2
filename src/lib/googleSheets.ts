import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
// Handle the private key properly (replace escaped newlines if passed from env)
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const sheetId = process.env.GOOGLE_SHEET_ID || '';

// Fallback jika belum diatur
const isConfigured = Boolean(serviceAccountEmail && privateKey && sheetId);

export async function getSpreadsheet() {
  if (!isConfigured) {
    return null; // Belum dikonfigurasi
  }

  const serviceAccountAuth = new JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo(); 
  return doc;
}

export async function addLaporanRow(data: any) {
  const doc = await getSpreadsheet();
  if (!doc) return false;

  // Asumsikan sheet pertama adalah sheet Laporan
  let sheet = doc.sheetsByIndex[0];
  
  // Jika sheet kosong, buat header terlebih dahulu
  try {
    await sheet.loadHeaderRow();
  } catch (e) {
    await sheet.setHeaderRow(['ID', 'Tanggal', 'Nama Pelapor', 'Unit Pelapor', 'Nama Pasien', 'RM & Ruang', 'Waktu Insiden', 'Lokasi', 'Jenis', 'Kronologi', 'Grading AI', 'Status']);
  }

  await sheet.addRow({
    'ID': data.id,
    'Tanggal': data.tanggal,
    'Nama Pelapor': data.namaPelapor || 'Anonim',
    'Unit Pelapor': data.unitPelapor || '-',
    'Nama Pasien': data.pasienName || 'Tidak Disebutkan',
    'RM & Ruang': data.rmRoom || '-',
    'Waktu Insiden': data.waktuInsiden || '-',
    'Lokasi': data.lokasi || '-',
    'Jenis': data.jenis || '-',
    'Kronologi': data.kronologi || '-',
    'Grading AI': data.grading || 'BELUM DIGRADING',
    'Status': data.status || 'Baru Masuk'
  });

  return true;
}

export async function getAllLaporan() {
  const doc = await getSpreadsheet();
  if (!doc) return [];

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  
  // Ubah row (array-like object) menjadi JSON yang rapi
  return rows.map(row => ({
    id: row.get('ID'),
    tanggal: row.get('Tanggal'),
    namaPelapor: row.get('Nama Pelapor'),
    unitPelapor: row.get('Unit Pelapor'),
    pasien: row.get('Nama Pasien'),
    rmRoom: row.get('RM & Ruang'),
    waktuInsiden: row.get('Waktu Insiden'),
    lokasi: row.get('Lokasi'),
    jenis: row.get('Jenis'),
    kronologi: row.get('Kronologi'),
    grading: row.get('Grading AI'),
    status: row.get('Status'),
  }));
}
