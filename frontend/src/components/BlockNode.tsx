'use client';

import { memo } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Brain, Mail, PenLine, TestTube, FileStack, Play, Layers, Type, GitBranch, Check } from 'lucide-react';
import { getBlockById, type BlockId } from 'shared';
import { useFlowRunStore } from '@/store/flowRunStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Mail,
  PenLine,
  TestTube,
  FileStack,
  Play,
  Layers,
  Type,
  GitBranch,
};

/** Mock output type for display when not in schema */
function mockOutputType(key: string): string {
  if (key === 'emails' || key === 'rewritten' || key === 'summary' || key === 'combined' || key === 'value') return 'string';
  if (key === 'label') return 'string';
  if (key === 'confidence') return 'number';
  if (key === 'mergedUrl') return 'string';
  if (key === 'trigger') return 'boolean';
  if (key === 'match') return 'boolean';
  return 'any';
}

function BlockNodeComponent({
  id,
  data,
  selected,
}: NodeProps<{ blockId: string; label: string; icon?: string }>) {
  const block = getBlockById((data.blockId || 'summarize-text') as BlockId);
  const Icon = data.icon && ICON_MAP[data.icon] ? ICON_MAP[data.icon] : Brain;
  const inputs = block?.inputs ?? [{ key: 'input', label: 'Input', type: 'text' as const }];
  const outputs = block?.outputs ?? [{ key: 'output', label: 'Output' }];
  const hasCachedOutput = useFlowRunStore((s) => !!s.outputsByNode[id] && Object.keys(s.outputsByNode[id]).length > 0);

  return (
    <div
      className={`min-w-[200px] rounded-xl border bg-zinc-900 shadow-lg overflow-hidden ${
        selected ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-zinc-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700/80 bg-zinc-800/50">
        <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="font-medium text-sm truncate text-zinc-100 flex-1">{data.label}</span>
        {hasCachedOutput && (
          <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400 flex items-center gap-0.5" title="Has cached output">
            <Check className="h-3 w-3" />
            out
          </span>
        )}
      </div>

      {/* Inputs (left handles) */}
      <div className="px-2 pt-1.5 pb-1 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 px-1 mb-0.5">Inputs</p>
        {inputs.map((input) => (
          <div
            key={input.key}
            className="flex items-center gap-2 relative min-h-[24px]"
            style={{ paddingLeft: 4 }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={input.key}
              className="!w-2.5 !h-2.5 !bg-amber-500/90 !border-2 !border-zinc-800 !-left-1.5"
            />
            <span className="text-xs text-zinc-400 truncate flex-1" title={`${input.label} (${input.type})`}>
              {input.label} <span className="text-zinc-500">({input.type})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Outputs (right handles) */}
      <div className="px-2 pt-1 pb-1.5 space-y-1 border-t border-zinc-700/50">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 px-1 mb-0.5 text-right">Outputs</p>
        {outputs.map((output) => (
          <div
            key={output.key}
            className="flex items-center justify-end gap-2 relative min-h-[24px]"
            style={{ paddingRight: 4 }}
          >
            <span className="text-xs text-zinc-400 truncate flex-1 text-right" title={`${output.label}`}>
              {output.label} <span className="text-zinc-500">({mockOutputType(output.key)})</span>
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={output.key}
              className="!w-2.5 !h-2.5 !bg-emerald-500/90 !border-2 !border-zinc-800 !-right-1.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const BlockNode = memo(BlockNodeComponent);
