'use client';

import { useQuery } from '@tanstack/react-query';
import type { Inscription } from '@/types/inscription';

async function fetchInscription(id: string): Promise<Inscription> {
  const res = await fetch(`/api/inscription/${id}`);
  if (!res.ok) throw new Error('Failed to fetch inscription');
  return res.json();
}

export function useInscription(id: string | undefined) {
  return useQuery({
    queryKey: ['inscription', id],
    queryFn: () => fetchInscription(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}
