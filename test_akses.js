require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function testAkses() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  const sheet = Object.values(doc.sheetsByTitle).find(s => s.title.toLowerCase() === 'akses');
  if (!sheet) {
    console.log("Sheet 'akses' not found");
    return;
  }
  
  try {
    await sheet.loadHeaderRow();
    console.log("Headers loaded:", sheet.headerValues);
    
    await sheet.addRow({
      NAMA: 'Test User',
      EMAIL: 'test@example.com',
      PASSWORD: 'password',
      ROLE: 'PELAPOR',
      UNIT: 'IGD'
    });
    console.log("Row added successfully");
  } catch (e) {
    console.error("Failed to add row:", e.message);
  }
}

testAkses();
