const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: './.env.local' });

async function seedHistory() {
  console.log("Connecting to Google Sheets...");
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet('1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE', serviceAccountAuth);
  await doc.loadInfo();
  
  const progressSheet = doc.sheetsByIndex[0];
  let historySheet = doc.sheetsByTitle['QueueHistory'];
  
  if (!historySheet) {
      historySheet = await doc.addSheet({ title: 'QueueHistory', headerValues: ['Name', 'Times Queued'] });
  }
  
  const pRows = await progressSheet.getRows();
  const historyMap = new Map();
  
  // Determine correct history value
  for (const row of pRows) {
      const name = row.get('Name')?.trim();
      const queue = row.get('queue')?.trim();
      if (!name) continue;
      
      let targetHistory = 0;
      if (queue === '1') targetHistory = 2;
      else if (queue === '2') targetHistory = 1;
      
      historyMap.set(name, targetHistory);
  }
  
  const hRows = await historySheet.getRows();
  const existingNames = new Set();
  
  // Update existing history
  for (const row of hRows) {
      const name = row.get('Name')?.trim();
      if (name && historyMap.has(name)) {
          existingNames.add(name);
          row.set('Times Queued', historyMap.get(name).toString());
          await row.save();
      }
  }
  
  // Add missing history
  for (const [name, history] of historyMap.entries()) {
      if (!existingNames.has(name)) {
          await historySheet.addRow({ 'Name': name, 'Times Queued': history.toString() });
      }
  }
  
  console.log("QueueHistory has been perfectly seeded!");
}

seedHistory().catch(console.error);
