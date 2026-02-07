import { callClaude } from './claude.js';

export async function runRewritePrompt(text: string): Promise<string> {
  if (!text.trim()) return '';
  const result = await callClaude(
    'You rewrite the user\'s input for clarity and structure. Keep the same meaning; improve wording and organization. Return only the rewritten text, no preamble.',
    text.slice(0, 8000)
  );
  return result.trim();
}
