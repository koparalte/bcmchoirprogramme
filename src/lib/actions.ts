'use server';

import {z} from 'zod';
import {summarizeEventDescription} from '@/ai/flows/summarize-event-descriptions';
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

    const response = await fetch(gvizUrl);

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

    const requiredHeaders = ['location', 'programme', 'description', 'date'];
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
          if (cell) {
            // For dates, Google Sheets often sends them in a weird format.
            // "Date(YYYY,M,D)". We parse it. M is 0-indexed.
            if (
              header === 'date' &&
              typeof cell.v === 'string' &&
              cell.v.startsWith('Date(')
            ) {
              const dateParts = cell.v
                .replace('Date(', '')
                .replace(')', '')
                .split(',');
              const dateObj = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]),
                parseInt(dateParts[2])
              );
              event[header] = dateObj.toISOString().split('T')[0];
            } else {
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
        date: event.date || '',
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

export async function getEventSummary(
  description: string
): Promise<{summary?: string; error?: string}> {
  if (!description) {
    return {summary: 'No description provided.'};
  }
  try {
    const {summary} = await summarizeEventDescription({description});
    return {summary};
  } catch (error) {
    console.error('AI summarization failed:', error);
    return {error: 'Failed to generate summary.'};
  }
}
