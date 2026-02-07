import Link from 'next/link';
import { LayoutDashboard, Blocks } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">
        AI Block Marketplace
      </h1>
      <p className="text-zinc-400 mb-8 text-center max-w-md">
        Modular AI-powered blocks with usage-based billing. Browse, run, or unlock blocks.
      </p>
      <div className="flex flex-wrap gap-4 justify-center mb-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-500 transition"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </Link>
        <Link
          href="/block-library"
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-3 text-sm font-medium text-zinc-100 hover:bg-zinc-700 transition"
        >
          <Blocks className="h-4 w-4" />
          Browse blocks
        </Link>
        <Link
          href="/checkout"
          className="flex items-center gap-2 rounded-lg border border-zinc-600 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition"
        >
          Unlock blocks
        </Link>
      </div>
      <ul className="text-sm text-zinc-500 space-y-1 text-center max-w-sm">
        <li>Run AI blocks (summarize, extract emails, classify, and more)</li>
        <li>Unlock blocks via Flowglad checkout</li>
        <li>Build flows on the dashboard canvas; run from the library or canvas</li>
        <li>Manage subscriptions and invoices in Profile</li>
      </ul>
    </div>
  );
}
