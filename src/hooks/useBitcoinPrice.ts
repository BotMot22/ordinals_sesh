'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchPrice(): Promise<number> {
  const res = await fetch('/api/price');
  if (!res.ok) throw new Error('Failed to fetch price');
  const data = await res.json();
  return data.price;
}

export function useBitcoinPrice() {
  return useQuery({
    queryKey: ['btc-price'],
    queryFn: fetchPrice,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
