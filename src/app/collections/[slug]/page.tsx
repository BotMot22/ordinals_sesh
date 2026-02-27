'use client';

import { useState, useMemo } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useListings } from '@/hooks/useListings';
import { CollectionHeader } from '@/components/collection/CollectionHeader';
import { InscriptionGrid } from '@/components/inscription/InscriptionGrid';
import { FilterPanel } from '@/components/common/FilterPanel';
import { Skeleton } from '@/components/common/Skeleton';

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const { data: collection, isLoading } = useCollection(params.slug);
  const { data: allListings } = useListings();
  const [sort, setSort] = useState('price_asc');

  // Match listings to this collection's inscriptions
  const collectionListings = useMemo(() => {
    if (!collection || !allListings) return new Map<string, number>();
    const inscriptionSet = new Set(collection.inscriptions);
    const map = new Map<string, number>();
    for (const listing of allListings) {
      if (inscriptionSet.has(listing.inscriptionId)) {
        map.set(listing.inscriptionId, listing.price);
      }
    }
    return map;
  }, [collection, allListings]);

  const items = useMemo(() => {
    if (!collection) return [];

    let inscriptions = collection.inscriptions.map((id) => ({
      id,
      price: collectionListings.get(id),
      collectionName: collection.name,
    }));

    // Sort
    switch (sort) {
      case 'price_asc':
        inscriptions.sort((a, b) => {
          if (a.price && b.price) return a.price - b.price;
          if (a.price) return -1;
          if (b.price) return 1;
          return 0;
        });
        break;
      case 'price_desc':
        inscriptions.sort((a, b) => {
          if (a.price && b.price) return b.price - a.price;
          if (a.price) return -1;
          if (b.price) return 1;
          return 0;
        });
        break;
    }

    return inscriptions;
  }, [collection, collectionListings, sort]);

  const floorPrice = useMemo(() => {
    const prices = Array.from(collectionListings.values()).filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : undefined;
  }, [collectionListings]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Collection Not Found</h1>
        <p className="text-gray-400">The collection &ldquo;{params.slug}&rdquo; could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <CollectionHeader
        collection={collection}
        totalListings={collectionListings.size}
        floorPrice={floorPrice}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Inscriptions
          <span className="text-gray-500 text-sm font-normal ml-2">
            ({items.length.toLocaleString()})
          </span>
        </h2>
        <FilterPanel onSortChange={setSort} currentSort={sort} />
      </div>

      <InscriptionGrid
        items={items.slice(0, 100)}
        emptyMessage="No inscriptions found in this collection"
      />

      {items.length > 100 && (
        <p className="text-center text-gray-500 text-sm">
          Showing first 100 of {items.length.toLocaleString()} inscriptions
        </p>
      )}
    </div>
  );
}
