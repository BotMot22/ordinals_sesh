'use client';

import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@/contexts/NostrContext';
import type { Order, OrderFilter } from '@/types/order';
import { fetchOrders, fetchBestOrder } from '@/lib/nostr/orders';

export function useListings(filter?: OrderFilter) {
  const { orders } = useNostr();

  return useQuery({
    queryKey: ['listings', filter],
    queryFn: () => fetchOrders(filter),
    staleTime: 15_000,
    refetchInterval: 30_000,
    // Use context orders as initial data
    initialData: filter ? undefined : orders.length > 0 ? orders : undefined,
  });
}

export function useInscriptionListing(inscriptionId: string | undefined) {
  return useQuery({
    queryKey: ['listing', inscriptionId],
    queryFn: () => fetchBestOrder(inscriptionId!),
    enabled: !!inscriptionId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
