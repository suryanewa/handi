import type { BlockId } from 'shared';
import { getBlockById } from 'shared';
import { runSummarizeText } from './ai/summarize.js';
import { runExtractEmails } from './ai/extract-emails.js';
import { runRewritePrompt } from './ai/rewrite-prompt.js';
import { runClassifyInput } from './ai/classify-input.js';
import { runMergePdfs } from './merge-pdfs.js';

export async function runBlock(
  blockId: BlockId,
  inputs: Record<string, string | string[]>
): Promise<Record<string, unknown>> {
  const block = getBlockById(blockId);
  if (!block) throw new Error(`Unknown block: ${blockId}`);

  switch (blockId) {
    case 'summarize-text': {
      const text = String(inputs['text'] ?? '');
      const summary = await runSummarizeText(text);
      return { summary };
    }
    case 'extract-emails': {
      const text = String(inputs['text'] ?? '');
      const emails = await runExtractEmails(text);
      return { emails: emails.join(', ') };
    }
    case 'rewrite-prompt': {
      const text = String(inputs['text'] ?? '');
      const rewritten = await runRewritePrompt(text);
      return { rewritten };
    }
    case 'classify-input': {
      const text = String(inputs['text'] ?? '');
      const { label, confidence } = await runClassifyInput(text);
      return { label, confidence };
    }
    case 'merge-pdfs': {
      const files = inputs['files'];
      const mergedUrl = await runMergePdfs(Array.isArray(files) ? files : files ? [files] : []);
      return { mergedUrl };
    }
    case 'trigger': {
      return { trigger: true };
    }
    case 'text-join': {
      const text1 = String(inputs['text1'] ?? '').trim();
      const text2 = String(inputs['text2'] ?? '').trim();
      const separator = String(inputs['separator'] ?? ' ').trim() || ' ';
      const combined = [text1, text2].filter(Boolean).join(separator);
      return { combined };
    }
    case 'constant': {
      const value = String(inputs['value'] ?? '');
      return { value };
    }
    case 'conditional': {
      const text = String(inputs['text'] ?? '').trim();
      const pattern = String(inputs['pattern'] ?? '').trim();
      const match = pattern ? text.includes(pattern) : text.length > 0;
      return { match };
    }
    default:
      throw new Error(`Unimplemented block: ${blockId}`);
  }
}
