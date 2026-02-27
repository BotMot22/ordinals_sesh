'use client';

import { createContext, useContext, useEffect, useCallback, useRef, useState, type ReactNode } from 'react';
import type { Order } from '@/types/order';

interface NostrContextValue {
  orders: Order[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
}

const NostrContext = createContext<NostrContextValue>({
  orders: [],
  isConnected: false,
  isLoading: false,
  error: null,
  refreshOrders: async () => {},
});

export function NostrProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subRef = useRef<{ close: () => void } | null>(null);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { fetchOrders } = await import('@/lib/nostr/orders');
      const fetched = await fetchOrders({ sortBy: 'recent' });
      setOrders(fetched);
      setIsConnected(true);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch orders');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrders();

    let cancelled = false;

    (async () => {
      try {
        const { subscribeToOrders } = await import('@/lib/nostr/orders');
        if (cancelled) return;
        subRef.current = subscribeToOrders((newOrder) => {
          setOrders((prev) => {
            const existing = prev.findIndex((o) => o.inscriptionId === newOrder.inscriptionId);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = newOrder;
              return updated;
            }
            return [newOrder, ...prev];
          });
        });
      } catch {
        // Nostr subscription failed, orders still available via refresh
      }
    })();

    return () => {
      cancelled = true;
      subRef.current?.close();
      import('@/lib/nostr/client').then(({ closePool }) => closePool()).catch(() => {});
    };
  }, [refreshOrders]);

  return (
    <NostrContext.Provider value={{ orders, isConnected, isLoading, error, refreshOrders }}>
      {children}
    </NostrContext.Provider>
  );
}

export function useNostr() {
  return useContext(NostrContext);
}
