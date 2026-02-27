'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CollectionGrid } from '@/components/collection/CollectionGrid';
import { SearchBar } from '@/components/common/SearchBar';
import { FEATURED_COLLECTIONS } from '@/lib/constants';
import { fetchCollectionMeta } from '@/lib/ordinals/collections';
import type { CollectionMeta } from '@/types/collection';

export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(search);

  // Fetch all collection slugs
  const { data: slugs, isLoading: slugsLoading } = useQuery({
    queryKey: ['collection-slugs'],
    queryFn: async () => {
      const res = await fetch('/api/collections');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return (data.slugs || []) as string[];
    },
    staleTime: 600_000,
  });

  // Fetch metadata for featured collections
  const { data: featuredMeta, isLoading: metaLoading } = useQuery({
    queryKey: ['featured-collections-meta'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        FEATURED_COLLECTIONS.map(async (slug) => {
          const meta = await fetchCollectionMeta(slug);
          return meta ? { slug, ...meta } : null;
        })
      );
      return results
        .filter((r): r is PromiseFulfilledResult<(CollectionMeta & { slug: string }) | null> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter(Boolean) as (CollectionMeta & { slug: string })[];
    },
    staleTime: 600_000,
  });

  const filteredSlugs = useMemo(() => {
    if (!searchQuery || !slugs) return slugs || [];
    return slugs.filter((slug) =>
      slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [slugs, searchQuery]);

  const collections = useMemo(() => {
    if (searchQuery && filteredSlugs.length > 0) {
      return filteredSlugs.slice(0, 50).map((slug) => ({
        slug,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        icon: '',
        supply: 0,
      }));
    }

    if (featuredMeta) {
      return featuredMeta.map((meta) => ({
        slug: meta.slug,
        name: meta.name,
        icon: meta.inscription_icon
          ? `https://ordinals.com/content/${meta.inscription_icon}`
          : meta.icon || '',
        inscriptionIcon: meta.inscription_icon,
        supply: parseInt(meta.supply || '0', 10),
      }));
    }

    return FEATURED_COLLECTIONS.map((slug) => ({
      slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: '',
      supply: 0,
    }));
  }, [searchQuery, filteredSlugs, featuredMeta]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Collections</h1>
        <SearchBar
          placeholder="Search collections..."
          onSearch={setSearchQuery}
          className="sm:w-72"
        />
      </div>

      <CollectionGrid
        collections={collections}
        isLoading={slugsLoading || metaLoading}
        emptyMessage={searchQuery ? 'No collections match your search' : 'No collections found'}
      />

      {searchQuery && filteredSlugs.length > 50 && (
        <p className="text-center text-gray-500 text-sm mt-6">
          Showing first 50 of {filteredSlugs.length} results
        </p>
      )}
    </div>
  );
}
