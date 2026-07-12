
'use server';

import {z} from 'zod';
import type {Banner, Event, Member, ProgressMember, BibleVerse} from './types';

const sheetUrlSchema = z.string().url();

function extractSheetId(url: string): string | null {
    // Standard editor URL: /spreadsheets/d/{sheet_id}/...
    let match = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/.exec(url);
    if (match) {
        return match[1];
    }
    // Published URL: /spreadsheets/d/e/{sheet_id}/pubhtml
    match = /\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/.exec(url);
    if (match) {
        return match[1];
    }
    return null;
}

function extractGid(url: string): string | null {
    const match = /[?&]gid=([0-9]+)/.exec(url);
    if (match) {
        return match[1];
    }
    return null;
}

interface GvizResponse {
  table: {
    cols: {id: string; label: string; type: string}[];
    rows: {c: ({v: any; f?: string} | null)[]}[];
  };
}

function parseSheetDate(cellValue: string): string | null {
    if (typeof cellValue === 'string') {
        if (cellValue.startsWith('Date(')) {
            const dateParts = cellValue.replace('Date(', '').replace(')', '').split(',');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) + 1; // gviz months are 0-indexed
            const day = parseInt(dateParts[2]);
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        
        // If it's already YYYY-MM-DD
        const isoMatch = cellValue.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoMatch) return isoMatch[1];
    }
    
    // Fallback
    const date = new Date(cellValue);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }
    return null;
}

async function fetchSheetData(sheetUrl: string): Promise<{data?: GvizResponse, error?: string}> {
    try {
        const validatedUrl = sheetUrlSchema.parse(sheetUrl);
        const sheetId = extractSheetId(validatedUrl);
        const gid = extractGid(validatedUrl);

        if (!sheetId) {
            return {
            error: 'Invalid Google Sheet URL format. Could not find sheet ID.',
            };
        }

        let gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1`;
        if (gid) {
            gvizUrl += `&gid=${gid}`;
        }

        // Setting revalidate to 60 ensures data is cached for 60 seconds.
        const response = await fetch(gvizUrl, { next: { revalidate: 60 } });

        if (!response.ok) {
            return {
            error: `Failed to fetch sheet data. Status: ${response.status}. Make sure your sheet is published to the web.`,
            };
        }

        const responseText = await response.text();
        const jsonString = responseText
            .match(/(?<=google\.visualization\.Query\.setResponse\()[\s\S]*(?=\);)/)?.[0];

        if (!jsonString) {
            return {error: 'Failed to parse response from Google Sheets.'};
        }
        
        const gvizData: GvizResponse = JSON.parse(jsonString);
        return { data: gvizData };
    } catch (err) {
        if (err instanceof z.ZodError) {
            return {error: 'Invalid URL provided.'};
        }
        console.error('Error fetching or parsing sheet data:', err);
        return {
            error:
            'An unexpected error occurred. Check the browser console for more details.',
        };
    }
}

export async function getEvents(
  sheetUrl: string,
  showAllEvents?: boolean
): Promise<{data?: Event[]; error?: string}> {
  const { data: gvizData, error } = await fetchSheetData(sheetUrl);

  if (error || !gvizData) {
    return { error };
  }
  
  try {
    const {cols, rows} = gvizData.table;
    const headers = cols.map(col => col.label.toLowerCase());

    const requiredHeaders = ['startdate'];
    if (!headers.includes('location') && !headers.includes('name')) {
        return { error: "Missing required column in Google Sheet: 'location' or 'name'. Please check your column headers." };
    }
     if (!showAllEvents && !headers.includes('programme') && !headers.includes('kohhran')) {
        return { error: "Missing required column in Google Sheet: 'programme' or 'kohhran'. Please check your column headers." };
    }


    for (const h of requiredHeaders) {
      if (!headers.includes(h) && !showAllEvents) {
        return {
          error: `Missing required column in Google Sheet: '${h}'. Please check your column headers.`,
        };
      }
    }

    const events: Event[] = rows.map((row, index) => {
      const event: Record<string, any> = {};
      row.c.forEach((cell, i) => {
        const header = headers[i];
        if (header) {
          if (cell && cell.v !== null) {
            if ((header === 'startdate' || header === 'enddate') && typeof cell.v === 'string') {
              event[header] = parseSheetDate(cell.v);
            }
            else {
              event[header] = cell.f ?? cell.v;
            }
          } else {
            event[header] = null;
          }
        }
      });
      return {
        id: `${extractSheetId(sheetUrl)}-${index}`,
        title: event.name || event.location || 'Untitled Event',
        programme: event.kohhran || event.programme || '',
        description: event.part || event.description || '',
        startdate: event.startdate || '',
        enddate: event.enddate,
        time: event.time,
        designation: event.designation,
        zingzan: event['zing&zan'] || event.zingzan
      };
    }).filter(event => event.title !== 'Untitled Event' || event.programme || event.description);

    return {data: events};
  } catch (err) {
    console.error('Error processing sheet data for events:', err);
    return {
      error:
        'An unexpected error occurred while processing event data. Check the browser console for more details.',
    };
  }
}

export async function getMembers(
  sheetUrl: string
): Promise<{data?: Member[]; error?: string}> {
  const { data: gvizData, error } = await fetchSheetData(sheetUrl);

  if (error || !gvizData) {
    return { error };
  }

  try {
    const {cols, rows} = gvizData.table;
    
    if (cols.length < 1) {
        return { error: "The Google Sheet appears to have no columns. Please add a 'name' column." };
    }

    const members: Member[] = rows
      .map((row, index) => {
        const nameCell = row.c[0];
        const name = nameCell ? (nameCell.f ?? nameCell.v) : null;
        
        let kohhran: string | null = null;
        if (row.c.length > 1) {
          const kohhranCell = row.c[1];
          kohhran = kohhranCell ? (kohhranCell.f ?? kohhranCell.v) : null;
        }

        let part: string | null = null;
        if (row.c.length > 2) {
            const partCell = row.c[2];
            part = partCell ? (partCell.f ?? partCell.v) : null;
        }
        
        let designation: string | null = null;
        if (row.c.length > 3) {
            const designationCell = row.c[3];
            designation = designationCell ? (designationCell.f ?? designationCell.v) : null;
        }

        let link: string | null = null;
        if (row.c.length > 4) {
            const linkCell = row.c[4];
            link = linkCell ? (linkCell.f ?? linkCell.v) : null;
        }

        let phone: string | null = null;
        if (row.c.length > 5) {
            const phoneCell = row.c[5];
            phone = phoneCell ? (phoneCell.f ?? phoneCell.v?.toString()) : null;
        }

        let email: string | null = null;
        if (row.c.length > 6) {
            const emailCell = row.c[6];
            email = emailCell ? (emailCell.f ?? emailCell.v) : null;
        }

        let birthday: string | null = null;
        if (row.c.length > 7) {
            const birthdayCell = row.c[7];
            if (birthdayCell) {
                if (typeof birthdayCell.v === 'string' && birthdayCell.v.startsWith('Date(')) {
                    const dateParts = birthdayCell.v.replace('Date(', '').replace(')', '').split(',');
                    const month = parseInt(dateParts[1]) + 1;
                    const day = parseInt(dateParts[2]);
                    birthday = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
                } else {
                    birthday = birthdayCell.f ?? birthdayCell.v;
                }
            }
        }

        return {
          id: `${extractSheetId(sheetUrl)}-${index}`,
          name: name || '',
          kohhran: kohhran || undefined,
          part: part || undefined,
          designation: designation || undefined,
          link: link || undefined,
          phone: phone || undefined,
          email: email || undefined,
          birthday: birthday || undefined,
        };
      })
      .filter(member => member.name && member.name.trim().toLowerCase() !== 'name' && member.name.trim().toLowerCase() !== 'member name'); // Filter out members with no name and the header

    return {data: members};
  } catch (err) {
    console.error('Error processing sheet data for members:', err);
    return {
      error:
        'An unexpected error occurred while processing member data. Check the browser console for more details.',
    };
  }
}


export async function getBannerUrls(sheetUrl: string): Promise<{ data?: Banner[]; error?: string }> {
  const { data: gvizData, error } = await fetchSheetData(sheetUrl);

  if (error || !gvizData) {
    return { error };
  }

  try {
    const { rows } = gvizData.table;
    if (rows.length > 0) {
      const banners: Banner[] = rows
        .map(row => {
            const url = row.c[0]?.v as string | null;
            const name = row.c.length > 1 ? (row.c[1]?.v as string | null) : undefined;
            return { url: url || '', name: name || undefined };
        })
        .filter(banner => banner.url && typeof banner.url === 'string' && banner.url.trim() !== '');

      if (banners.length > 0) {
        return { data: banners };
      }
    }
    return { error: 'No banner URLs found in the sheet.' };
  } catch(err) {
    console.error('Error processing sheet data for banner URL:', err);
    return {
      error:
        'An unexpected error occurred while processing banner data. Check the browser console for more details.',
    };
  }
}

export async function getProgress(
  sheetUrl: string
): Promise<{data?: ProgressMember[]; error?: string}> {
  const { data: gvizData, error } = await fetchSheetData(sheetUrl);

  if (error || !gvizData) {
    return { error };
  }

  try {
    const {cols, rows} = gvizData.table;
    
    if (cols.length < 3) {
        return { error: "The Google Sheet appears to be missing required columns." };
    }

    // Columns: 0: Name, 1: queue, 2: Part, 3+: Songs
    const songHeaders = cols.slice(3).map(col => col.label);

    const members: ProgressMember[] = rows
      .map((row, index) => {
        const nameCell = row.c[0];
        const name = nameCell ? (nameCell.f ?? nameCell.v) : null;
        
        let queue: string = '';
        if (row.c.length > 1) {
          const queueCell = row.c[1];
          queue = queueCell ? (queueCell.f ?? queueCell.v)?.toString() : '';
        }
        
        let part: string = '';
        if (row.c.length > 2) {
          const partCell = row.c[2];
          part = partCell ? (partCell.f ?? partCell.v) : '';
        }

        const songs = songHeaders.map((songName, songIndex) => {
           const cell = row.c[songIndex + 3];
           let completed = false;
           if (cell) {
              completed = cell.v === true || cell.v === 'TRUE' || cell.v === 'true' || cell.v === 1;
           }
           return {
              name: songName,
              completed
           };
        });

        return {
          id: `${extractSheetId(sheetUrl)}-${index}`,
          name: (name as string) || '',
          part: (part as string) || '',
          queue,
          songs
        };
      })
      .filter(member => member.name && member.name.trim().toLowerCase() !== 'name');

    return {data: members};
  } catch (err) {
    console.error('Error processing sheet data for progress:', err);
    return {
      error: 'An unexpected error occurred while processing progress data.',
    };
  }
}

export async function getBibleVerses(
  sheetUrl: string
): Promise<{data?: BibleVerse[]; error?: string}> {
  const { data: gvizData, error } = await fetchSheetData(sheetUrl);

  if (error || !gvizData) {
    return { error };
  }

  try {
    const { rows } = gvizData.table;
    
    const verses: BibleVerse[] = rows
      .map((row) => {
        const snoCell = row.c[0];
        const verseCell = row.c[1];
        const textCell = row.c[2];

        const sno = snoCell ? (snoCell.f ?? snoCell.v) : '';
        const verse = verseCell ? (verseCell.f ?? verseCell.v) : '';
        const text = textCell ? (textCell.f ?? textCell.v) : '';

        return {
          sno: sno,
          verse: (verse as string) || '',
          text: (text as string) || ''
        };
      })
      .filter(v => v.verse && v.text && v.verse.trim().toLowerCase() !== 'bible verse');

    return {data: verses};
  } catch (err) {
    console.error('Error processing sheet data for Bible verses:', err);
    return {
      error: 'An unexpected error occurred while processing Bible verses.',
    };
  }
}

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';


import { revalidatePath } from 'next/cache';

export async function updateMemberProgress(sheetUrl: string, memberName: string, updates: Record<string, boolean>) {
  try {
    const validatedUrl = sheetUrlSchema.parse(sheetUrl);
    const sheetId = extractSheetId(validatedUrl);
    if (!sheetId) throw new Error("Invalid sheet URL");

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
      throw new Error("Missing Google Service Account credentials");
    }

    const auth = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const gid = extractGid(validatedUrl);
    let sheet = doc.sheetsByIndex[0];
    if (gid) {
      sheet = doc.sheetsById[parseInt(gid)] || sheet;
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get(sheet.headerValues[0])?.toString().trim().toLowerCase() === memberName.trim().toLowerCase());

    if (!row) {
      throw new Error("Member not found in sheet");
    }

    // Apply all updates
    let hasChanges = false;
    for (const [songName, isCompleted] of Object.entries(updates)) {
      row.set(songName, isCompleted ? 'TRUE' : 'FALSE');
      hasChanges = true;
    }

    if (hasChanges) {
      await row.save();
    }

    revalidatePath('/progress');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating member progress:", error);
    return { error: error.message || "Failed to update Google Sheet" };
  }
}

export async function getQueueHistory(
  sheetUrl: string
): Promise<{ history?: Map<string, number>, error?: string }> {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(extractSheetId(sheetUrl)!, serviceAccountAuth);
    await doc.loadInfo();
    
    // Check if QueueHistory sheet exists
    let historySheet = doc.sheetsByTitle['QueueHistory'];
    const historyMap = new Map<string, number>();
    
    if (historySheet) {
        const rows = await historySheet.getRows();
        rows.forEach(row => {
           const name = row.get('Name');
           const times = parseInt(row.get('Times Queued') || '0', 10);
           if (name && !isNaN(times)) {
               historyMap.set(name.trim(), times);
           }
        });
    }
    
    return { history: historyMap };
  } catch (err: any) {
    console.error('Error fetching QueueHistory:', err);
    return { error: err.message };
  }
}

export async function generateQueueSchedule(
  sheetUrl: string,
  batch1: string[],
  batch2: string[]
) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(extractSheetId(sheetUrl)!, serviceAccountAuth);
    await doc.loadInfo();
    
    const progressSheet = doc.sheetsByIndex[0];
    const rows = await progressSheet.getRows();
    
    // Write 1s and 2s to the progress sheet
    for (const row of rows) {
       const name = row.get('Name')?.trim();
       if (!name) continue;
       
       if (batch1.includes(name)) {
           row.set('queue', '1');
       } else if (batch2.includes(name)) {
           row.set('queue', '2');
       } else {
           row.set('queue', '');
       }
       await row.save();
    }
    
    // Update QueueHistory
    let historySheet = doc.sheetsByTitle['QueueHistory'];
    if (!historySheet) {
        historySheet = await doc.addSheet({ title: 'QueueHistory', headerValues: ['Name', 'Times Queued'] });
    }
    
    const historyRows = await historySheet.getRows();
    const historyMap = new Map(historyRows.map(r => [r.get('Name'), r]));
    
    const allSelected = [...batch1, ...batch2];
    for (const name of allSelected) {
        const existingRow = historyMap.get(name);
        if (existingRow) {
            const currentTimes = parseInt(existingRow.get('Times Queued') || '0', 10);
            existingRow.set('Times Queued', (currentTimes + 1).toString());
            await existingRow.save();
        } else {
            await historySheet.addRow({ 'Name': name, 'Times Queued': '1' });
        }
    }
    
    revalidatePath('/progress');
    revalidatePath('/');
    
    return { success: true };
  } catch (err: any) {
    console.error('Error saving queue schedule:', err);
    return { error: err.message };
  }
}

export async function saveManualOverrides(
  sheetUrl: string,
  updates: Record<string, '1' | '2' | ''>
) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(extractSheetId(sheetUrl)!, serviceAccountAuth);
    await doc.loadInfo();
    
    const progressSheet = doc.sheetsByIndex[0];
    const rows = await progressSheet.getRows();
    
    let hasChanges = false;
    for (const row of rows) {
       const name = row.get('Name')?.trim();
       if (!name) continue;
       
       if (updates[name] !== undefined) {
           row.set('queue', updates[name]);
           await row.save();
           hasChanges = true;
       }
    }
    
    if (hasChanges) {
       revalidatePath('/progress');
       revalidatePath('/');
       revalidatePath('/admin/schedule');
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Error saving manual overrides:', err);
    return { error: err.message };
  }
}

import { generateNextBatches } from './queue-algorithm';

export async function setPracticeCanceled(sheetUrl: string, canceled: boolean) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(extractSheetId(sheetUrl)!, serviceAccountAuth);
    await doc.loadInfo();
    
    let configSheet = doc.sheetsByTitle['Config'];
    if (!configSheet) {
        configSheet = await doc.addSheet({ title: 'Config', headerValues: ['Key', 'Value'] });
    }
    
    const rows = await configSheet.getRows();
    let cancelRow = rows.find(r => r.get('Key') === 'Cancel_Practice');
    
    if (cancelRow) {
        cancelRow.set('Value', canceled ? 'TRUE' : 'FALSE');
        await cancelRow.save();
    } else {
        await configSheet.addRow({ Key: 'Cancel_Practice', Value: canceled ? 'TRUE' : 'FALSE' });
    }
    
    revalidatePath('/admin/schedule');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getPracticeCanceled(sheetUrl: string) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(extractSheetId(sheetUrl)!, serviceAccountAuth);
    await doc.loadInfo();
    
    const configSheet = doc.sheetsByTitle['Config'];
    if (!configSheet) return { canceled: false };
    
    const rows = await configSheet.getRows();
    const cancelRow = rows.find(r => r.get('Key') === 'Cancel_Practice');
    return { canceled: cancelRow?.get('Value') === 'TRUE' };
  } catch (err: any) {
    return { canceled: false };
  }
}

export async function triggerAutoRotation(
   progressSheetUrl: string, 
   bcyaSheetUrl: string
) {
   try {
      // 1. Get Events to find the most recently passed date
      const { data: events } = await getEvents(bcyaSheetUrl, true);
      if (!events || events.length === 0) return { success: false, reason: 'No events' };
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      // Find the most recent event that is STRICTLY in the past
      // (If today is practice day, we don't rotate until tomorrow!)
      const pastEvents = events
         .filter(e => e.startdate && new Date(e.startdate) < today)
         .sort((a, b) => new Date(b.startdate!).getTime() - new Date(a.startdate!).getTime());
         
      if (pastEvents.length === 0) return { success: false, reason: 'No past events' };
      
      const mostRecentPastDate = pastEvents[0].startdate!;
      
      // 2. Connect to Config sheet
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(extractSheetId(progressSheetUrl)!, serviceAccountAuth);
      await doc.loadInfo();
      
      let configSheet = doc.sheetsByTitle['Config'];
      if (!configSheet) {
          configSheet = await doc.addSheet({ title: 'Config', headerValues: ['Key', 'Value'] });
      }
      
      const rows = await configSheet.getRows();
      let lastPracticedRow = rows.find(r => r.get('Key') === 'Last_Practiced_Date');
      let cancelRow = rows.find(r => r.get('Key') === 'Cancel_Practice');
      
      const lastDate = lastPracticedRow?.get('Value');
      const isCanceled = cancelRow?.get('Value') === 'TRUE';
      
      // If we've already rotated for this past date, do nothing
      if (lastDate === mostRecentPastDate) {
          return { success: true, reason: 'Already up to date' };
      }
      
      // 3. We need to process the passing of this date
      if (isCanceled) {
          // Practice was canceled. We do NOT advance the queue.
          // We just update the last practiced date so we don't check again, and reset the cancel flag for next week.
      } else {
          // Practice happened! Advance the queue.
          const { data: progressMembers } = await getProgress(progressSheetUrl);
          const { history } = await getQueueHistory(progressSheetUrl);
          
          if (progressMembers && history) {
             const { batch1, batch2 } = generateNextBatches(progressMembers, history);
             await generateQueueSchedule(progressSheetUrl, batch1, batch2);
          }
      }
      
      // Update Config
      if (lastPracticedRow) {
          lastPracticedRow.set('Value', mostRecentPastDate);
          await lastPracticedRow.save();
      } else {
          await configSheet.addRow({ Key: 'Last_Practiced_Date', Value: mostRecentPastDate });
      }
      
      if (cancelRow) {
          cancelRow.set('Value', 'FALSE');
          await cancelRow.save();
      } else {
          await configSheet.addRow({ Key: 'Cancel_Practice', Value: 'FALSE' });
      }
      
      revalidatePath('/progress');
      revalidatePath('/');
      revalidatePath('/admin/schedule');
      
      return { success: true, rotated: !isCanceled };
   } catch (e: any) {
      console.error("Error in auto rotation:", e);
      return { error: e.message };
   }
}
