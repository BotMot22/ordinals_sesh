'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  onSortChange: (sort: string) => void;
  onPriceFilter?: (min: number | null, max: number | null) => void;
  currentSort: string;
}

export function FilterPanel({ onSortChange, onPriceFilter, currentSort }: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const sortOptions = [
    { value: 'recent', label: 'Recently Listed' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="input-field pr-8 appearance-none cursor-pointer text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      {onPriceFilter && (
        <>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary text-sm flex items-center gap-2 px-3 py-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {showFilters && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min sats"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-field w-28 text-sm py-2"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max sats"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-field w-28 text-sm py-2"
              />
              <button
                onClick={() => {
                  onPriceFilter(
                    minPrice ? parseInt(minPrice, 10) : null,
                    maxPrice ? parseInt(maxPrice, 10) : null
                  );
                }}
                className="btn-primary text-sm px-3 py-2"
              >
                Apply
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
