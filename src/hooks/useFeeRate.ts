'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFeeRates } from '@/lib/api/mempool';
import type { FeeRate } from '@/types/transaction';

export function useFeeRate() {
  return useQuery<FeeRate>({
    queryKey: ['fee-rates'],
    queryFn: fetchFeeRates,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
