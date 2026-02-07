'use client';

import { useState } from 'react';
import { Lock, Play, Loader2 } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string;
  featureSlug: string;
  inputs: { key: string; label: string; type: string }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function BlockCard({
  block,
  icon,
  hasAccess,
  onUnlock,
}: {
  block: Product;
  icon: React.ReactNode;
  hasAccess: boolean;
  onUnlock: () => Promise<void>;
}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch(`${API_URL}/api/run-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': 'demo-user-1' },
        body: JSON.stringify({ blockId: block.id, inputs: { text: input } }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.priceSlug && res.status === 403) {
          setError('Block locked. Use Unlock to purchase.');
        } else {
          setError(data.error ?? 'Failed to run block');
        }
        return;
      }
      setOutput(data.outputs ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-zinc-800">{icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-zinc-100">{block.name}</h2>
          <p className="text-sm text-zinc-400 mt-0.5">{block.description}</p>
        </div>
      </div>
      {block.inputs.some((i) => i.type === 'text') && (
        <textarea
          placeholder="Enter input..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none resize-none h-20"
          rows={3}
        />
      )}
      <div className="mt-3 flex gap-2">
        {hasAccess ? (
          <button
            onClick={handleRun}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run
          </button>
        ) : (
          <button
            onClick={onUnlock}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500/80"
          >
            <Lock className="h-4 w-4" />
            Unlock
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {output && (
        <pre className="mt-3 rounded-lg bg-zinc-800 p-3 text-xs text-zinc-300 overflow-auto max-h-32">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}
