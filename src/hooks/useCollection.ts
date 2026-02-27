'use client';

import { useQuery } from '@tanstack/react-query';
import type { Collection } from '@/types/collection';

async function fetchCollectionData(slug: string): Promise<Collection> {
  const res = await fetch(`/api/collections?slug=${slug}`);
  if (!res.ok) throw new Error('Failed to fetch collection');
  return res.json();
}

async function fetchCollectionSlugs(): Promise<string[]> {
  const res = await fetch('/api/collections');
  if (!res.ok) throw new Error('Failed to fetch collections');
  const data = await res.json();
  return data.slugs || [];
}

export function useCollection(slug: string | undefined) {
  return useQuery({
    queryKey: ['collection', slug],
    queryFn: () => fetchCollectionData(slug!),
    enabled: !!slug,
    staleTime: 300_000,
  });
}

export function useCollectionSlugs() {
  return useQuery({
    queryKey: ['collection-slugs'],
    queryFn: fetchCollectionSlugs,
    staleTime: 600_000,
  });
}
