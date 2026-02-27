'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ORDINALS_API } from '@/lib/constants';

interface CollectionCardProps {
  slug: string;
  name: string;
  icon: string;
  inscriptionIcon?: string;
  supply: number;
  floorPrice?: number;
}

export function CollectionCard({ slug, name, icon, inscriptionIcon, supply, floorPrice }: CollectionCardProps) {
  const iconUrl = inscriptionIcon
    ? `${ORDINALS_API}/content/${inscriptionIcon}`
    : icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/collections/${slug}`}
        className="block glass-card-hover overflow-hidden group"
      >
        <div className="aspect-square bg-gray-900 relative overflow-hidden">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-700">{name?.[0]}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-white font-semibold truncate">{name}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{supply.toLocaleString()} items</span>
            {floorPrice && floorPrice > 0 && (
              <span className="text-xs text-brand-400">
                Floor: {(floorPrice / 100_000_000).toFixed(4)} BTC
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
