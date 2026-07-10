const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: './.env.local' });

async function snapshot() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet('1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE', serviceAccountAuth);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  
  const snapshotData = rows.map(row => {
     return `${row.get('Name')} | ${row.get('queue') || 'None'} | ${row.get('Part')}`;
  });
  
  const fs = require('fs');
  fs.writeFileSync('snapshot.txt', snapshotData.join('\n'));
  console.log("Snapshot saved to snapshot.txt! Total rows: " + rows.length);
}

snapshot().catch(console.error);
