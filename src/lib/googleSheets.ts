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
    await sheet.setHeaderRow(['ID', 'Tanggal', 'Nama Pelapor', 'Unit Pelapor', 'No RM', 'Nama Pasien', 'Ruangan Pasien', 'Waktu Insiden', 'Lokasi', 'Jenis', 'Kronologi', 'Grading AI', 'Status']);
  }

  await sheet.addRow({
    'ID': data.id,
    'Tanggal': data.tanggal,
    'Nama Pelapor': data.namaPelapor || 'Anonim',
    'Unit Pelapor': data.unitPelapor || '-',
    'No RM': data.noRm || '-',
    'Nama Pasien': data.pasienName || 'Tidak Disebutkan',
    'Ruangan Pasien': data.ruanganPasien || '-',
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
    noRm: row.get('No RM') || row.get('RM & Ruang')?.split('-')[0]?.trim() || '-', // Fallback to old format if 'No RM' is empty
    pasien: row.get('Nama Pasien'),
    ruanganPasien: row.get('Ruangan Pasien') || row.get('RM & Ruang')?.split('-')[1]?.trim() || '-', // Fallback to old format
    waktuInsiden: row.get('Waktu Insiden'),
    lokasi: row.get('Lokasi'),
    jenis: row.get('Jenis'),
    kronologi: row.get('Kronologi'),
    grading: row.get('Grading AI'),
    status: row.get('Status'),
  }));
}

// ==========================================
// MASTER PEGAWAI (Sheet Index 1)
// ==========================================
export async function getAllPegawai() {
  const doc = await getSpreadsheet();
  if (!doc) return [];
  try {
    const sheet = doc.sheetsByIndex[1];
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject());
  } catch (e) {
    return [];
  }
}

export async function addPegawaiRow(data: any) {
  const doc = await getSpreadsheet();
  if (!doc) return false;
  try {
    const sheet = doc.sheetsByIndex[1];
    await sheet.loadHeaderRow().catch(() => sheet.setHeaderRow(Object.keys(data)));
    await sheet.addRow(data);
    return true;
  } catch (e) {
    return false;
  }
}

export async function deletePegawaiRow(rowIndex: number) {
  const doc = await getSpreadsheet();
  if (!doc) return false;
  try {
    const sheet = doc.sheetsByIndex[1];
    const rows = await sheet.getRows();
    if (rows[rowIndex]) {
      await rows[rowIndex].delete();
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

// ==========================================
// MASTER RUANGAN (Sheet Index 2)
// ==========================================
export async function getAllRuangan() {
  const doc = await getSpreadsheet();
  if (!doc) return [];
  try {
    const sheet = doc.sheetsByIndex[2];
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject());
  } catch (e) {
    return [];
  }
}

export async function addRuanganRow(data: any) {
  const doc = await getSpreadsheet();
  if (!doc) return false;
  try {
    const sheet = doc.sheetsByIndex[2];
    await sheet.loadHeaderRow().catch(() => sheet.setHeaderRow(Object.keys(data)));
    await sheet.addRow(data);
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteRuanganRow(rowIndex: number) {
  const doc = await getSpreadsheet();
  if (!doc) return false;
  try {
    const sheet = doc.sheetsByIndex[2];
    const rows = await sheet.getRows();
    if (rows[rowIndex]) {
      await rows[rowIndex].delete();
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

// ==========================================
// MANAJEMEN AKSES & PENGGUNA (Tab "akses")
// ==========================================
export async function getAksesSheet() {
  const doc = await getSpreadsheet();
  if (!doc) return null;
  // Cari berdasarkan judul sheet, abaikan case
  const sheet = Object.values(doc.sheetsByTitle).find(s => s.title.toLowerCase() === 'akses');
  return sheet || null;
}

export async function getAllAkses() {
  try {
    const sheet = await getAksesSheet();
    if (!sheet) return [];
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject());
  } catch (e) {
    return [];
  }
}

export async function addAksesRow(data: any) {
  try {
    const sheet = await getAksesSheet();
    if (!sheet) return false;
    await sheet.loadHeaderRow().catch(() => sheet.setHeaderRow(['NAMA', 'EMAIL', 'PASSWORD', 'ROLE', 'UNIT']));
    
    // Gunakan array untuk bypass isu mapping header jika ada spasi tersembunyi
    await sheet.addRow([
      data.NAMA || data.Nama || '', 
      data.EMAIL || data.Email || '', 
      data.PASSWORD || data.Password || '', 
      data.ROLE || data.Role || '', 
      data.UNIT || data.Unit || ''
    ]);
    
    return true;
  } catch (e) {
    console.error("Gagal menambahkan baris ke sheet akses:", e);
    return false;
  }
}

// ==========================================
// PUSH NOTIFICATION SUBSCRIPTIONS (Tab "subscriptions")
// ==========================================
export async function getSubscriptionSheet() {
  const doc = await getSpreadsheet();
  if (!doc) return null;
  return Object.values(doc.sheetsByTitle).find(s => s.title.toLowerCase() === 'subscriptions') || null;
}

export async function addSubscription(data: { email: string, endpoint: string, p256dh: string, auth: string }) {
  try {
    const sheet = await getSubscriptionSheet();
    if (!sheet) return false;
    
    // Ensure header row exists
    await sheet.loadHeaderRow().catch(() => sheet.setHeaderRow(['EMAIL', 'ENDPOINT', 'P256DH', 'AUTH']));
    
    // Use array to bypass header mapping issues
    await sheet.addRow([data.email, data.endpoint, data.p256dh, data.auth]);
    return true;
  } catch (e) {
    console.error("Failed to add subscription to Google Sheets:", e);
    return false;
  }
}

export async function getSubscriptions() {
  try {
    const sheet = await getSubscriptionSheet();
    if (!sheet) return [];
    
    const rows = await sheet.getRows();
    return rows.map(row => ({
      email: row.get('EMAIL') || row.get('Email') || row.get('email'),
      endpoint: row.get('ENDPOINT') || row.get('Endpoint') || row.get('endpoint'),
      p256dh: row.get('P256DH') || row.get('P256dh') || row.get('p256dh'),
      auth: row.get('AUTH') || row.get('Auth') || row.get('auth')
    }));
  } catch (e) {
    console.error("Failed to get subscriptions from Google Sheets:", e);
    return [];
  }
}

export async function updateAksesRow(rowIndex: number, data: any) {
  try {
    const sheet = await getAksesSheet();
    if (!sheet) return false;
    const rows = await sheet.getRows();
    if (rows[rowIndex]) {
      Object.assign(rows[rowIndex], data);
      await rows[rowIndex].save();
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function deleteAksesRow(rowIndex: number) {
  try {
    const sheet = await getAksesSheet();
    if (!sheet) return false;
    const rows = await sheet.getRows();
    if (rows[rowIndex]) {
      await rows[rowIndex].delete();
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
