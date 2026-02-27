'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search inscriptions, collections...',
  onSearch,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim());
    } else {
      // If looks like an inscription ID (64 hex chars + i + number)
      if (/^[a-f0-9]{64}i\d+$/.test(query.trim())) {
        router.push(`/inscription/${query.trim()}`);
      } else {
        router.push(`/collections?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input-field w-full pl-10 pr-10"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
