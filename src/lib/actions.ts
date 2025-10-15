'use server';

import {z} from 'zod';
import type {Event} from './types';

const sheetUrlSchema = z.string().url();

function extractSheetId(url: string): string | null {
  const match = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/.exec(url);
  return match ? match[1] : null;
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


export async function getEvents(
  sheetUrl: string
): Promise<{data?: Event[]; error?: string}> {
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

    const {cols, rows} = gvizData.table;
    const headers = cols.map(col => col.label.toLowerCase());

    const requiredHeaders = ['location', 'programme', 'description', 'startdate'];
    for (const h of requiredHeaders) {
      if (!headers.includes(h)) {
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
            } else if (header === 'zing&zan') {
              event['zingzan'] = cell.f ?? cell.v;
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
        id: `${sheetId}-${index}`,
        title: event.location || 'Untitled Event',
        programme: event.programme || '',
        description: event.description || '',
        startdate: event.startdate || '',
        enddate: event.enddate,
        zingzan: event.zingzan,
        time: event.time,
      };
    });

    return {data: events};
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
