import { callClaude } from './claude.js';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export async function runExtractEmails(text: string): Promise<string[]> {
  const matches = text.match(EMAIL_REGEX);
  if (matches) return [...new Set(matches)];
  const result = await callClaude(
    'You extract email addresses from text. Reply with only a comma-separated list of emails found, or "none" if none.',
    text.slice(0, 8000)
  );
  if (result.toLowerCase().includes('none')) return [];
  const fromLlm = result.split(/[\s,]+/).filter((s) => s.includes('@'));
  return [...new Set(fromLlm)];
}
