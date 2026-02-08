'use client';

import { Brain, Mail, PenLine, TestTube, FileStack, Play, Layers, Type, GitBranch } from 'lucide-react';
import { useAppBilling } from '@/contexts/AppBillingContext';
import { BlockCard } from '@/components/BlockCard';
import { BLOCK_DEFINITIONS } from 'shared';

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

export default function BlockLibraryPage() {
  const { checkFeatureAccess, loaded, createCheckoutSession } = useAppBilling();
  const products = BLOCK_DEFINITIONS;

  if (!DEMO_MODE && !loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500">Loading billing…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="max-w-4xl mx-auto w-full p-6 flex-1">
        <h1 className="text-xl font-semibold text-zinc-100 mb-1">Block Library</h1>
        <p className="text-zinc-400 mb-8">
          Browse and run AI blocks. Unlock locked blocks via checkout.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {products.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-zinc-700 bg-zinc-900/80 p-8 text-center">
              <p className="text-zinc-400 font-medium">No blocks available</p>
              <p className="text-zinc-500 text-sm mt-1">Products may not be configured yet. Check the backend and Flowglad setup.</p>
            </div>
          ) : products.map((block) => {
            const hasAccess = DEMO_MODE || (checkFeatureAccess?.(block.featureSlug) ?? false);
            const Icon = ICON_MAP[block.icon] ?? Brain;
            return (
              <BlockCard
                key={block.id}
                block={block}
                icon={<Icon className="h-5 w-5 text-emerald-400" />}
                hasAccess={hasAccess}
                onUnlock={async () => {
                  await createCheckoutSession?.({
                    priceSlug: block.priceSlug,
                    successUrl: window.location.href,
                    cancelUrl: window.location.href,
                    autoRedirect: true,
                  });
                }}
              />
            );
          })}
        </div>
        {products.length > 0 && (
          <p className="mt-6 text-center text-zinc-500 text-sm">
            Run unlocked blocks above or open the Dashboard to build a flow on the canvas.
          </p>
        )}
      </div>
    </div>
  );
}
