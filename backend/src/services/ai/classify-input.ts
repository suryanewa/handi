import { callClaude } from './claude.js';

export async function runClassifyInput(text: string): Promise<{ label: string; confidence: number }> {
  if (!text.trim()) return { label: 'neutral', confidence: 0 };
  const result = await callClaude(
    'You classify the sentiment of the text. Reply with exactly one line: LABEL CONFIDENCE (e.g. positive 0.95). LABEL must be one of: positive, neutral, negative. CONFIDENCE is a number 0-1.',
    text.slice(0, 4000)
  );
  const parts = result.trim().toLowerCase().split(/\s+/);
  const label = ['positive', 'neutral', 'negative'].includes(parts[0]) ? parts[0] : 'neutral';
  const confidence = Math.min(1, Math.max(0, parseFloat(parts[1]) || 0.5));
  return { label, confidence };
}
