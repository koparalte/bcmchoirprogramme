
'use server';

import {z} from 'zod';
import type {Event, Member} from './types';

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

interface GvizResponse {
  table: {
    cols: {id: string; label: string; type: string}[];
    rows: {c: ({v: any; f?: string} | null)[]}[];
  };
}

function parseSheetDate(cellValue: string): string | null {
    if (typeof cellValue === 'string' && cellValue.startsWith('Date(')) {
        const dateParts = cellValue
        .replace('Date(', '')
        .replace(')', '')
        .split(',');
        const dateObj = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]),
        parseInt(dateParts[2])
        );
        return dateObj.toISOString().split('T')[0];
    }
    // Handle cases where date might be a simple string
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

    if (!sheetId) {
      return {
        error: 'Invalid Google Sheet URL format. Could not find sheet ID.',
      };
    }

    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    const response = await fetch(gvizUrl, { cache: 'no-store' });

    if (!response.ok) {
      return {
        error: `Failed to fetch sheet data. Status: ${response.status}. Make sure your sheet is published to the web.`,
      };
    }

    const responseText = await response.text();
    const jsonString = responseText
      .match(/(?<=google\.visualization\.Query\.setResponse\().*(?=\);)/s)?.[0];

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

        return {
          id: `${extractSheetId(sheetUrl)}-${index}`,
          name: name || '',
          kohhran: kohhran || undefined,
          part: part || undefined,
          designation: designation || undefined,
          link: link || undefined,
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


export async function getBannerUrls(sheetUrl: string): Promise<{ data?: string[]; error?: string }> {
  const { data: gvizData, error } = await fetchSheetData(sheetUrl);

  if (error || !gvizData) {
    return { error };
  }

  try {
    const { rows } = gvizData.table;
    if (rows.length > 0) {
      const bannerUrls = rows
        .map(row => row.c[0]?.v as string)
        .filter(url => url && typeof url === 'string');

      if (bannerUrls.length > 0) {
        return { data: bannerUrls };
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
