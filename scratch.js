const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function test() {
  try {
    console.log('Testing connection...');
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.LOGINS_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    console.log('Sheet title:', doc.title);
    
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow([new Date().toISOString(), 'Test User', 'test@example.com']);
    console.log('Row added successfully!');
  } catch(e) {
    console.error('Error:', e.message);
  }
}

test();
