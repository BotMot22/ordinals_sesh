'use client';

import { ORDINALS_API } from '@/lib/constants';
import { Twitter, Globe, ExternalLink } from 'lucide-react';
import type { Collection } from '@/types/collection';

interface CollectionHeaderProps {
  collection: Collection;
  totalListings?: number;
  floorPrice?: number;
}

export function CollectionHeader({ collection, totalListings, floorPrice }: CollectionHeaderProps) {
  const iconUrl = collection.inscriptionIcon
    ? `${ORDINALS_API}/content/${collection.inscriptionIcon}`
    : collection.icon;

  return (
    <div className="glass-card overflow-hidden">
      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-brand-900/50 to-gray-900 relative">
        {collection.bannerImage && (
          <img
            src={collection.bannerImage}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      {/* Info */}
      <div className="px-6 pb-6 -mt-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Icon */}
          <div className="w-20 h-20 rounded-xl border-4 border-gray-900 overflow-hidden bg-gray-800 flex-shrink-0">
            {iconUrl ? (
              <img src={iconUrl} alt={collection.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">{collection.name[0]}</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{collection.name}</h1>
            {collection.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{collection.description}</p>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2">
            {collection.twitterLink && (
              <a
                href={collection.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {collection.websiteLink && (
              <a
                href={collection.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <p className="text-lg font-bold text-white">{collection.supply.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Supply</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <p className="text-lg font-bold text-white">{totalListings ?? 0}</p>
            <p className="text-xs text-gray-500">Listed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <p className="text-lg font-bold text-brand-400">
              {floorPrice ? `${(floorPrice / 100_000_000).toFixed(4)} BTC` : '—'}
            </p>
            <p className="text-xs text-gray-500">Floor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
