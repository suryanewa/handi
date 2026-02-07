'use client';

import { useState, useMemo } from 'react';
import { Brain, Mail, PenLine, TestTube, FileStack, Play, Layers, Type, GitBranch, Search, Lock } from 'lucide-react';
import { BLOCK_DEFINITIONS, type BlockDefinition } from 'shared';
import { useAppBilling } from '@/contexts/AppBillingContext';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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

const DRAG_TYPE = 'application/reactflow';

function onDragStart(event: React.DragEvent, blockId: string, label: string, icon: string) {
  event.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ type: 'block', blockId, label, icon }));
  event.dataTransfer.effectAllowed = 'move';
}

export function BlockPalette({
  onAddBlock,
}: {
  onAddBlock?: (block: BlockDefinition) => void;
}) {
  const [search, setSearch] = useState('');
  const { checkFeatureAccess, loaded } = useAppBilling();

  const filtered = useMemo(() => {
    if (!search.trim()) return BLOCK_DEFINITIONS;
    const q = search.toLowerCase();
    return BLOCK_DEFINITIONS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <aside
      className="w-64 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900/80 overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="p-3 border-b border-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Blocks
        </h3>
        <p className="text-zinc-500 text-xs mt-1">
          Drag or click to add
        </p>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks..."
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 pl-7 pr-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <p className="text-zinc-500 text-xs py-2">No blocks match</p>
        ) : (
          filtered.map((block) => {
            const Icon = ICON_MAP[block.icon] ?? Brain;
            const hasAccess = DEMO_MODE || !loaded || (checkFeatureAccess?.(block.featureSlug) ?? true);
            return (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => onDragStart(e, block.id, block.name, block.icon)}
                onClick={() => onAddBlock?.(block)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing transition ${hasAccess
                    ? 'border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800'
                    : 'border-amber-700/50 bg-amber-900/20 text-zinc-300 hover:border-amber-600/50'
                  }`}
                title={hasAccess ? block.description : `🔒 Locked - unlock to use`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${hasAccess ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="text-sm font-medium truncate flex-1">{block.name}</span>
                {!hasAccess && <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
