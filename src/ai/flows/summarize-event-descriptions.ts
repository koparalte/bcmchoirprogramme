'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing event descriptions using AI.
 *
 * - summarizeEventDescription - A function that takes an event description and returns a concise summary.
 * - SummarizeEventDescriptionInput - The input type for the summarizeEventDescription function.
 * - SummarizeEventDescriptionOutput - The return type for the summarizeEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEventDescriptionInputSchema = z.object({
  description: z
    .string()
    .describe('The full description of the event to be summarized.'),
});
export type SummarizeEventDescriptionInput = z.infer<
  typeof SummarizeEventDescriptionInputSchema
>;

const SummarizeEventDescriptionOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, AI-generated summary of the event description.'),
});
export type SummarizeEventDescriptionOutput = z.infer<
  typeof SummarizeEventDescriptionOutputSchema
>;

export async function summarizeEventDescription(
  input: SummarizeEventDescriptionInput
): Promise<SummarizeEventDescriptionOutput> {
  return summarizeEventDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEventDescriptionPrompt',
  input: {schema: SummarizeEventDescriptionInputSchema},
  output: {schema: SummarizeEventDescriptionOutputSchema},
  prompt: `You are an expert event summarizer. Your goal is to create a short,
concise, and informative summary of an event description. The summary should
capture the key details of the event in a way that is easy to understand.

Event Description: {{{description}}}`,
});

const summarizeEventDescriptionFlow = ai.defineFlow(
  {
    name: 'summarizeEventDescriptionFlow',
    inputSchema: SummarizeEventDescriptionInputSchema,
    outputSchema: SummarizeEventDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
