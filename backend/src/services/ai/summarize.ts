import { callClaude } from './claude.js';

export async function runSummarizeText(text: string): Promise<string> {
  if (!text.trim()) return '';
  const result = await callClaude(
    'You are a concise summarizer. Return only a short TL;DR summary, no preamble.',
    `Summarize this text:\n\n${text.slice(0, 15000)}`
  );
  return result.trim();
}
