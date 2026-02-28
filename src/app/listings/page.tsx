'use client';

import { useState, useMemo } from 'react';
import { useListings } from '@/hooks/useListings';
import { InscriptionGrid } from '@/components/inscription/InscriptionGrid';
import { FilterPanel } from '@/components/common/FilterPanel';
import { SearchBar } from '@/components/common/SearchBar';
import type { OrderFilter } from '@/types/order';

export default function ListingsPage() {
  const [sort, setSort] = useState<string>('recent');
  const [priceFilter, setPriceFilter] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filter: OrderFilter = useMemo(
    () => ({
      sortBy: sort as OrderFilter['sortBy'],
      minPrice: priceFilter.min ?? undefined,
      maxPrice: priceFilter.max ?? undefined,
    }),
    [sort, priceFilter]
  );

  const { data: listings, isLoading } = useListings(filter);

  const items = useMemo(() => {
    if (!listings) return [];

    let filtered = listings;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.inscriptionId.toLowerCase().includes(q) ||
          l.sellerAddress.toLowerCase().includes(q)
      );
    }

    return filtered.map((order) => ({
      id: order.inscriptionId,
      price: order.price,
      number: order.inscriptionNumber,
      source: order.source,
      marketplaceUrl: order.marketplaceUrl,
    }));
  }, [listings, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-3xl font-bold text-white">Active Listings</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <FilterPanel
            onSortChange={setSort}
            onPriceFilter={(min, max) => setPriceFilter({ min, max })}
            currentSort={sort}
          />
          <SearchBar
            placeholder="Search by inscription ID..."
            onSearch={setSearchQuery}
            className="sm:w-72"
          />
        </div>
      </div>

      <InscriptionGrid
        items={items}
        isLoading={isLoading}
        emptyMessage={
          searchQuery
            ? 'No listings match your search'
            : 'No active listings. Be the first to list an inscription!'
        }
      />

      <div className="mt-8 text-center text-sm text-gray-500">
        {listings && listings.length > 0 && (
          <p>{listings.length} active listing{listings.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
}
