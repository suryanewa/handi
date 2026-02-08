'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';

interface TokenContextValue {
    balance: number;
    loading: boolean;
    refresh: () => Promise<void>;
    deductLocally: (amount: number) => void;
    verifyPurchases: () => Promise<{ tokensAdded: number }>;
}

interface TokenBalanceResponse {
    balance: number;
    subscription: { interval: string | null; lastRefresh: number | null } | null;
}

interface VerifyPurchaseResponse {
    success: boolean;
    tokensAdded: number;
    newBalance: number;
    purchasesProcessed: number;
}

const TokenContext = createContext<TokenContextValue>({
    balance: 0,
    loading: true,
    refresh: async () => { },
    deductLocally: () => { },
    verifyPurchases: async () => ({ tokensAdded: 0 }),
});

export function TokenProvider({ children }: { children: ReactNode }) {
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            const data = await apiFetch<TokenBalanceResponse>('/api/tokens');
            setBalance(data.balance);
        } catch (e) {
            console.error('[Tokens] Failed to fetch balance:', e);
        } finally {
            setLoading(false);
        }
    };

    const deductLocally = (amount: number) => {
        setBalance((prev) => Math.max(0, prev - amount));
    };

    // Verify and credit any pending Flowglad purchases
    const verifyPurchases = async (): Promise<{ tokensAdded: number }> => {
        try {
            const data = await apiFetch<VerifyPurchaseResponse>('/api/tokens/verify-purchase', {
                method: 'POST',
            });
            if (data.tokensAdded > 0) {
                setBalance(data.newBalance);
                console.log(`[Tokens] Verified ${data.purchasesProcessed} purchases, added ${data.tokensAdded} tokens`);
            }
            return { tokensAdded: data.tokensAdded ?? 0 };
        } catch (e) {
            console.error('[Tokens] Failed to verify purchases:', e);
        }
        return { tokensAdded: 0 };
    };

    useEffect(() => {
        // On mount, verify purchases first (in case returning from checkout), then refresh balance
        const init = async () => {
            await verifyPurchases();
            await refresh();
        };
        init();
    }, []);

    return (
        <TokenContext.Provider value={{ balance, loading, refresh, deductLocally, verifyPurchases }}>
            {children}
        </TokenContext.Provider>
    );
}

export function useTokens() {
    return useContext(TokenContext);
}
