'use client';

import { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useExecutionLog } from '@/store/executionLog';

export function ExecutionLogPanel() {
  const { entries, clear } = useExecutionLog();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (entries.length > 0) setVisible(true);
  }, [entries.length]);

  if (!visible || entries.length === 0) return null;

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          aria-hidden
          onClick={() => setExpanded(false)}
        />
      )}
      <div
        className={`fixed z-50 flex flex-col rounded-t-xl border border-b-0 border-zinc-700 bg-zinc-900 shadow-xl ${
          expanded
            ? 'left-4 right-4 top-20 bottom-20 md:left-1/4 md:right-1/4'
            : 'right-4 bottom-4 w-80 max-w-[calc(100vw-2rem)]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-2">
          <span className="text-sm font-medium text-zinc-200">Execution log</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              title={expanded ? 'Minimize' : 'Expand'}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => clear()}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              title="Clear log"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-lg border p-2 ${
                entry.success
                  ? 'border-zinc-700 bg-zinc-800/80'
                  : 'border-red-800/50 bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-200 truncate">{entry.blockName}</span>
                <span className="shrink-0 text-zinc-500">
                  {new Date(entry.at).toLocaleTimeString()}
                </span>
              </div>
              {entry.error && (
                <p className="mt-1 text-red-400">{entry.error}</p>
              )}
              {entry.success && entry.output != null && Object.keys(entry.output).length > 0 && (
                <pre className="mt-1 overflow-auto rounded bg-zinc-950 p-2 text-zinc-400 max-h-32">
                  {JSON.stringify(entry.output, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
