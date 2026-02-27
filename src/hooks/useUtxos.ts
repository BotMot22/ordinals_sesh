'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUtxos } from '@/lib/api/mempool';
import { findDummyUtxo } from '@/lib/bitcoin/utxo';
import type { Utxo } from '@/types/transaction';
import { useWallet } from './useWallet';

export function useUtxos(address?: string) {
  const { wallet } = useWallet();
  const addr = address || wallet?.paymentAddress || wallet?.address;

  return useQuery<Utxo[]>({
    queryKey: ['utxos', addr],
    queryFn: () => fetchUtxos(addr!),
    enabled: !!addr,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useDummyUtxo() {
  const { wallet } = useWallet();
  const addr = wallet?.paymentAddress || wallet?.address;
  const { data: utxos } = useUtxos(addr);

  const dummyUtxo = utxos ? findDummyUtxo(utxos) : null;
  return { dummyUtxo, hasDummy: !!dummyUtxo };
}
