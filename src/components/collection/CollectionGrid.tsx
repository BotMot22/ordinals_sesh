'use client';

import { CollectionCard } from './CollectionCard';
import { CollectionCardSkeleton } from '@/components/common/Skeleton';

interface CollectionGridItem {
  slug: string;
  name: string;
  icon: string;
  inscriptionIcon?: string;
  supply: number;
  floorPrice?: number;
}

interface CollectionGridProps {
  collections: CollectionGridItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function CollectionGrid({
  collections,
  isLoading,
  emptyMessage = 'No collections found',
}: CollectionGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {collections.map((collection) => (
        <CollectionCard key={collection.slug} {...collection} />
      ))}
    </div>
  );
}
