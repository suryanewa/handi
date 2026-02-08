'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Lock, CheckCircle2, ArrowRight, ShoppingCart, XCircle } from 'lucide-react';
import type { BlockDefinition } from 'shared';
import { createCheckoutSession, getProducts } from '@/lib/api';
import { useAppBilling } from '@/contexts/AppBillingContext';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const { hasFeatureAccess, refreshEntitlements, entitlementsLoading } = useAppBilling();
  const cartBlockIds = useCartStore((state) => state.blockIds);
  const removeBlockFromCart = useCartStore((state) => state.removeBlock);
  const clearCart = useCartStore((state) => state.clear);

  const [products, setProducts] = useState<BlockDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoadingSlug, setCheckoutLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'success' | 'cancelled' | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getProducts()
      .then((result) => {
        if (!active) return;
        setProducts(result);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load products');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const cartProducts = useMemo(() => {
    if (!products.length) return [];
    const byId = new Map(products.map((product) => [product.id, product]));
    return cartBlockIds.map((id) => byId.get(id)).filter((product): product is BlockDefinition => Boolean(product));
  }, [products, cartBlockIds]);

  const unlockedItemsInCart = useMemo(
    () => cartProducts.filter((product) => hasFeatureAccess(product.featureSlug)),
    [cartProducts, hasFeatureAccess]
  );

  const lockedItemsInCart = useMemo(
    () => cartProducts.filter((product) => !hasFeatureAccess(product.featureSlug)),
    [cartProducts, hasFeatureAccess]
  );

  useEffect(() => {
    if (!cartProducts.length) return;
    for (const product of unlockedItemsInCart) {
      removeBlockFromCart(product.id);
    }
  }, [cartProducts, unlockedItemsInCart, removeBlockFromCart]);

  const handleCheckout = async (priceSlug: string) => {
    setError(null);
    setCheckoutStatus(null);
    setCheckoutLoadingSlug(priceSlug);

    try {
      const baseUrl = window.location.origin;
      const session = await createCheckoutSession({
        priceSlug,
        successUrl: `${baseUrl}/cart?checkout=success`,
        cancelUrl: `${baseUrl}/cart?checkout=cancelled`,
      });

      if (!session?.url) {
        throw new Error('Checkout URL missing from response');
      }

      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout');
      setCheckoutLoadingSlug(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('checkout');
    if (status === 'success' || status === 'cancelled') {
      setCheckoutStatus(status);
      void refreshEntitlements();
      if (status === 'success') {
        setCheckoutLoadingSlug(null);
      }
    }
  }, [refreshEntitlements]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-app-fg">Cart</h1>
      <p className="mt-1 text-sm text-app-soft">
        Add blocks from Marketplace, then start Flowglad checkout for each item here.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {entitlementsLoading && (
          <span className="rounded-full border border-app px-3 py-1 text-app-soft">Checking entitlements…</span>
        )}
        {checkoutStatus === 'success' && (
          <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-emerald-300">
            Checkout complete. Entitlements refreshed.
          </span>
        )}
        {checkoutStatus === 'cancelled' && (
          <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-amber-300">
            Checkout cancelled.
          </span>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <div className="mt-6 grid gap-3">
        {loading ? (
          <div className="rounded-xl border border-app bg-app-surface p-4 text-sm text-app-soft">Loading products…</div>
        ) : cartProducts.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="inline-flex items-center gap-2 text-sm text-emerald-300">
              <ShoppingCart className="h-4 w-4" />
              Your cart is empty.
            </p>
            <Link href="/marketplace" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-200 hover:text-emerald-100">
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          lockedItemsInCart.map((block) => (
            <div
              key={block.id}
              className="flex flex-col gap-3 rounded-xl border border-app bg-app-surface p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-app-fg">{block.name}</p>
                <p className="text-sm text-app-soft">{block.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-app px-2 py-1 text-app-soft">{block.priceSlug}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-1 text-amber-300">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleCheckout(block.priceSlug)}
                disabled={checkoutLoadingSlug === block.priceSlug}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutLoadingSlug === block.priceSlug ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Checkout
              </button>
            </div>
          ))
        )}
      </div>

      {!loading && unlockedItemsInCart.length > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-300">Already unlocked and removed from checkout queue:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {unlockedItemsInCart.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 px-2 py-1 text-xs text-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {!loading && cartProducts.length > 0 && lockedItemsInCart.length === 0 && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-sm text-emerald-300">Everything in your cart is unlocked.</p>
          <Link href="/marketplace" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-200 hover:text-emerald-100">
            Return to Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void refreshEntitlements()}
          className="rounded-lg border border-app px-3 py-2 text-sm text-app-soft transition hover:bg-app-surface hover:text-app-fg"
        >
          Refresh entitlements
        </button>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-2 rounded-lg border border-app px-3 py-2 text-sm text-app-soft transition hover:bg-app-surface hover:text-app-fg"
        >
          <XCircle className="h-4 w-4" />
          Clear cart
        </button>
        <Link href="/profile" className="text-sm text-blue-300 hover:text-blue-200">
          View subscriptions and invoices
        </Link>
      </div>
    </div>
  );
}
