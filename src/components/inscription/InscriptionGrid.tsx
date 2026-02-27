'use client';

import { InscriptionCard } from './InscriptionCard';
import { InscriptionCardSkeleton } from '@/components/common/Skeleton';

interface InscriptionGridItem {
  id: string;
  number?: number;
  contentType?: string;
  price?: number;
  collectionName?: string;
}

interface InscriptionGridProps {
  items: InscriptionGridItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function InscriptionGrid({ items, isLoading, emptyMessage = 'No inscriptions found' }: InscriptionGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <InscriptionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <InscriptionCard
          key={item.id}
          inscriptionId={item.id}
          number={item.number}
          contentType={item.contentType}
          price={item.price}
          collectionName={item.collectionName}
        />
      ))}
    </div>
  );
}
