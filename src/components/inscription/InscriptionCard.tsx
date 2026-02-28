'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { InscriptionPreview } from './InscriptionPreview';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import type { ListingSource } from '@/types/order';

interface InscriptionCardProps {
  inscriptionId: string;
  number?: number;
  contentType?: string;
  price?: number;
  collectionName?: string;
  source?: ListingSource;
  marketplaceUrl?: string;
}

function SourceBadge({ source }: { source?: ListingSource }) {
  if (source === 'magiceden') {
    return (
      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-500 text-white">
        ME
      </span>
    );
  }
  if (source === 'nostr') {
    return (
      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-500 text-white">
        Ordys
      </span>
    );
  }
  return null;
}

export function InscriptionCard({
  inscriptionId,
  number,
  contentType,
  price,
  collectionName,
  source,
  marketplaceUrl,
}: InscriptionCardProps) {
  const isExternal = source === 'magiceden' && marketplaceUrl;

  const cardContent = (
    <>
      <div className="relative">
        <SourceBadge source={source} />
        <InscriptionPreview
          inscriptionId={inscriptionId}
          contentType={contentType}
          className="group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>
      <div className="p-3 space-y-1.5">
        {number !== undefined && (
          <p className="text-sm font-medium text-white truncate">
            #{number.toLocaleString()}
          </p>
        )}
        {collectionName && (
          <p className="text-xs text-gray-500 truncate">{collectionName}</p>
        )}
        {price && price > 0 ? (
          <PriceDisplay sats={price} size="sm" />
        ) : (
          <p className="text-xs text-gray-600">Not listed</p>
        )}
      </div>
    </>
  );

  if (isExternal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <a
          href={marketplaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block glass-card-hover overflow-hidden group"
        >
          {cardContent}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/inscription/${inscriptionId}`}
        className="block glass-card-hover overflow-hidden group"
      >
        {cardContent}
      </Link>
    </motion.div>
  );
}
