'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { FlowgladProvider, useBilling } from '@flowglad/nextjs';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
// Use relative path to leverage Next.js proxy defined in next.config.ts
const apiBase = '';

export type AppBillingValue = {
  loaded: boolean;
  checkFeatureAccess?: ((featureSlug: string, refinementParams?: { subscriptionId?: string }) => boolean) | null;
  createCheckoutSession?: ((opts: {
    priceSlug: string;
    successUrl: string;
    cancelUrl: string;
    autoRedirect?: boolean;
  }) => Promise<unknown>) | null;
  customer?: { name?: string; email?: string } | null;
  subscriptions?: Array<{ id: string; status: string; currentPeriodEnd?: number }> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoices?: any[] | null;
  billingPortalUrl?: string | null;
  reload?: (() => void) | null;
  errors?: unknown[] | null;
  hasError?: boolean;
};

const DEMO_BILLING: AppBillingValue = {
  loaded: true,
  checkFeatureAccess: () => true,
  createCheckoutSession: async () => ({}),
  customer: { name: 'Demo user', email: 'demo@example.com' },
  subscriptions: [],
  invoices: [],
  billingPortalUrl: undefined,
  reload: () => { },
  errors: undefined,
  hasError: false,
};

/** Fallback when Flowglad API fails - treats all blocks as locked */
const ERROR_FALLBACK_BILLING: AppBillingValue = {
  loaded: true,
  checkFeatureAccess: () => false, // All blocks locked when we can't verify
  createCheckoutSession: async () => {
    console.warn('[Flowglad] API unavailable - cannot create checkout session');
    alert('Flowglad API is not configured. Please set up products in the Flowglad dashboard or enable DEMO_MODE.');
    return {};
  },
  customer: undefined,
  subscriptions: [],
  invoices: [],
  billingPortalUrl: undefined,
  reload: () => window.location.reload(),
  errors: ['Flowglad API unavailable'],
  hasError: true,
};

const AppBillingContext = createContext<AppBillingValue>({
  loaded: false,
});

/** Error Boundary to catch Flowglad SDK crashes */
class FlowgladErrorBoundary extends React.Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Flowglad] SDK Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function FlowgladBillingBridge({ children }: { children: ReactNode }) {
  const billing = useBilling();

  // If there are errors, provide a fallback that locks all blocks
  const hasApiError = billing.errors && billing.errors.length > 0;

  // Custom checkout that calls our backend (which handles findOrCreateCustomer)
  const customCreateCheckoutSession = async (opts: {
    priceSlug: string;
    successUrl: string;
    cancelUrl: string;
    autoRedirect?: boolean;
  }) => {
    console.log('[Checkout] Creating session for:', opts.priceSlug);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user-2',
        },
        body: JSON.stringify(opts),
      });

      const data = await response.json();
      console.log('[Checkout] Response:', data);

      if (data.error) {
        console.error('[Checkout] Error:', data.error);
        alert(`Checkout error: ${data.error}`);
        return {};
      }

      const checkoutUrl = data.url ?? data.checkoutSession?.checkoutUrl;
      if (checkoutUrl && opts.autoRedirect !== false) {
        console.log('[Checkout] Redirecting to:', checkoutUrl);
        window.location.href = checkoutUrl;
      }

      return data;
    } catch (error) {
      console.error('[Checkout] Network error:', error);
      alert('Failed to create checkout session. Check console for details.');
      return {};
    }
  };

  const value: AppBillingValue = hasApiError
    ? ERROR_FALLBACK_BILLING
    : {
      loaded: billing.loaded,
      checkFeatureAccess: billing.checkFeatureAccess,
      createCheckoutSession: customCreateCheckoutSession,
      customer: billing.customer,
      subscriptions: billing.subscriptions,
      invoices: billing.invoices,
      billingPortalUrl: billing.billingPortalUrl,
      reload: billing.reload,
      errors: billing.errors,
      hasError: false,
    };

  return (
    <AppBillingContext.Provider value={value}>
      {children}
    </AppBillingContext.Provider>
  );
}

/** Fallback component when Flowglad crashes */
function FlowgladFallback({ children }: { children: ReactNode }) {
  return (
    <AppBillingContext.Provider value={ERROR_FALLBACK_BILLING}>
      {children}
    </AppBillingContext.Provider>
  );
}

export function useAppBilling(): AppBillingValue {
  return useContext(AppBillingContext);
}

export function AppBillingRoot({ children }: { children: ReactNode }) {
  if (DEMO_MODE) {
    return (
      <AppBillingContext.Provider value={DEMO_BILLING}>
        {children}
      </AppBillingContext.Provider>
    );
  }

  return (
    <FlowgladErrorBoundary fallback={<FlowgladFallback>{children}</FlowgladFallback>}>
      <FlowgladProvider
        requestConfig={{
          baseURL: apiBase,
          headers: {
            'X-User-Id': 'demo-user-2', // Simplified auth for demo
          },
        }}
      >
        <FlowgladBillingBridge>{children}</FlowgladBillingBridge>
      </FlowgladProvider>
    </FlowgladErrorBoundary>
  );
}
