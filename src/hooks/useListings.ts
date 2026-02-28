'use client';

import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@/contexts/NostrContext';
import type { Order, OrderFilter } from '@/types/order';
import { fetchOrders, fetchBestOrder } from '@/lib/nostr/orders';

async function fetchMEListingsFromAPI(filter?: OrderFilter): Promise<Order[]> {
  try {
    const params = new URLSearchParams();
    if (filter?.collectionSlug) {
      params.set('collection', filter.collectionSlug);
    }
    params.set('limit', '40');
    const res = await fetch(`/api/listings/magiceden?${params}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function mergeListings(nostrOrders: Order[], meOrders: Order[], filter?: OrderFilter): Order[] {
  // Tag nostr orders with source
  const tagged = nostrOrders.map((o) => ({ ...o, source: o.source || ('nostr' as const) }));

  // Deduplicate: prefer nostr listing if same inscription is on both
  const nostrIds = new Set(tagged.map((o) => o.inscriptionId));
  const uniqueME = meOrders.filter((o) => !nostrIds.has(o.inscriptionId));

  const merged = [...tagged, ...uniqueME];

  // Apply sorting
  switch (filter?.sortBy) {
    case 'price_asc':
      merged.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      merged.sort((a, b) => b.price - a.price);
      break;
    case 'recent':
    default:
      merged.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return merged;
}

export function useListings(filter?: OrderFilter) {
  const { orders } = useNostr();

  return useQuery({
    queryKey: ['listings', filter],
    queryFn: async () => {
      const [nostrOrders, meOrders] = await Promise.all([
        fetchOrders(filter),
        fetchMEListingsFromAPI(filter),
      ]);
      return mergeListings(nostrOrders, meOrders, filter);
    },
    staleTime: 120_000,
    refetchInterval: 180_000,
    initialData: filter ? undefined : orders.length > 0 ? orders : undefined,
  });
}

export function useInscriptionListing(inscriptionId: string | undefined) {
  return useQuery({
    queryKey: ['listing', inscriptionId],
    queryFn: () => fetchBestOrder(inscriptionId!),
    enabled: !!inscriptionId,
    staleTime: 120_000,
    refetchInterval: 180_000,
  });
}
