const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: './.env.local' });
const fs = require('fs');

async function restore() {
  console.log("Connecting to Google Sheets...");
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet('1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE', serviceAccountAuth);
  await doc.loadInfo();
  
  const progressSheet = doc.sheetsByIndex[0];
  const historySheet = doc.sheetsByTitle['QueueHistory'];
  const configSheet = doc.sheetsByTitle['Config'];
  
  if (!progressSheet || !historySheet || !configSheet) {
      console.error("Missing sheets!");
      return;
  }
  
  console.log("Reading snapshot.txt...");
  const snapshotData = fs.readFileSync('snapshot.txt', 'utf8').trim().split('\n');
  const snapshotMap = new Map(); // name -> queue state (1, 2, or None)
  
  snapshotData.forEach(line => {
      const [name, queue, part] = line.split(' | ');
      if (name) {
          snapshotMap.set(name.trim(), queue.trim() === 'None' ? '' : queue.trim());
      }
  });
  
  console.log("Reverting QueueHistory for current Batch 1...");
  const pRows = await progressSheet.getRows();
  const currentBatch1Names = [];
  
  for (const row of pRows) {
      const name = row.get('Name')?.trim();
      const currentQueue = row.get('queue')?.trim();
      if (name && currentQueue === '1') {
          currentBatch1Names.push(name);
      }
  }
  
  const hRows = await historySheet.getRows();
  let historyDecremented = 0;
  for (const row of hRows) {
      const name = row.get('Name')?.trim();
      if (name && currentBatch1Names.includes(name)) {
          let count = parseInt(row.get('Times Queued') || '0', 10);
          if (count > 0) {
              row.set('Times Queued', (count - 1).toString());
              await row.save();
              historyDecremented++;
              console.log(`Decremented history for ${name} back to ${count - 1}`);
          }
      }
  }
  console.log(`Decremented history for ${historyDecremented} members.`);
  
  console.log("Restoring Queue assignments from snapshot...");
  let restoredCount = 0;
  for (const row of pRows) {
      const name = row.get('Name')?.trim();
      if (name && snapshotMap.has(name)) {
          const snapshotQueue = snapshotMap.get(name);
          const currentQueue = row.get('queue')?.trim() || '';
          
          if (snapshotQueue !== currentQueue) {
              row.set('queue', snapshotQueue);
              await row.save();
              restoredCount++;
              console.log(`Restored ${name} to queue: ${snapshotQueue || 'None'}`);
          }
      }
  }
  console.log(`Restored ${restoredCount} member assignments.`);
  
  console.log("Fixing Config sheet Last_Practiced_Date...");
  const cRows = await configSheet.getRows();
  const lastPracticedRow = cRows.find(r => r.get('Key') === 'Last_Practiced_Date');
  if (lastPracticedRow) {
      // Hardcode July 6, 2026 for now so it doesn't trigger immediately again!
      // The Next event is July 13.
      const safeDate = "7/6/2026";
      lastPracticedRow.set('Value', safeDate);
      await lastPracticedRow.save();
      console.log(`Set Last_Practiced_Date to ${safeDate}`);
  }
  
  console.log("Restoration Complete!");
}

restore().catch(console.error);
