import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.LOGINS_SHEET_ID) {
      console.error("Missing Google Sheets credentials in environment variables.");
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Replace literal \n in the key with actual newlines in case Vercel strings them
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.LOGINS_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    
    const sheet = doc.sheetsByIndex[0]; // Writes to the first tab
    
    // Format timestamp
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    await sheet.addRow([date, name || 'Unknown', email]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
