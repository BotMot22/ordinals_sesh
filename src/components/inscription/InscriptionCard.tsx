'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { InscriptionPreview } from './InscriptionPreview';
import { PriceDisplay } from '@/components/common/PriceDisplay';

interface InscriptionCardProps {
  inscriptionId: string;
  number?: number;
  contentType?: string;
  price?: number;
  collectionName?: string;
}

export function InscriptionCard({
  inscriptionId,
  number,
  contentType,
  price,
  collectionName,
}: InscriptionCardProps) {
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
        <InscriptionPreview
          inscriptionId={inscriptionId}
          contentType={contentType}
          className="group-hover:scale-[1.02] transition-transform duration-300"
        />
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
      </Link>
    </motion.div>
  );
}
