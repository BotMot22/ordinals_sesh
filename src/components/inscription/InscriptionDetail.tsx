'use client';

import { InscriptionPreview } from './InscriptionPreview';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { shortenAddress, shortenTxid, timeAgo } from '@/lib/utils';
import { ExternalLink, Copy } from 'lucide-react';
import type { Inscription } from '@/types/inscription';

interface InscriptionDetailProps {
  inscription: Inscription;
  price?: number;
}

export function InscriptionDetail({ inscription, price }: InscriptionDetailProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview */}
      <div>
        <InscriptionPreview
          inscriptionId={inscription.id}
          contentType={inscription.contentType}
          className="rounded-2xl max-w-lg mx-auto"
          size="lg"
        />
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Inscription #{inscription.number?.toLocaleString()}
          </h1>
          {inscription.collectionName && (
            <p className="text-brand-400 mt-1">{inscription.collectionName}</p>
          )}
        </div>

        {price && price > 0 && (
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400 mb-2">Current Price</p>
            <PriceDisplay sats={price} size="lg" />
          </div>
        )}

        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Details</h3>

          <DetailRow label="ID" value={inscription.id} copyable mono />
          <DetailRow label="Owner" value={inscription.address} copyable mono />
          <DetailRow label="Content Type" value={inscription.contentType} />
          <DetailRow
            label="Content Length"
            value={`${inscription.contentLength?.toLocaleString()} bytes`}
          />
          <DetailRow label="Rarity" value={inscription.rarity} />
          <DetailRow label="Output Value" value={`${inscription.outputValue?.toLocaleString()} sats`} />
          <DetailRow
            label="Genesis TX"
            value={inscription.genesisTx}
            copyable
            mono
            link={`https://mempool.space/tx/${inscription.genesisTx}`}
          />
          <DetailRow label="Genesis Height" value={inscription.genesisHeight?.toLocaleString()} />
          <DetailRow label="Genesis Fee" value={`${inscription.genesisFee?.toLocaleString()} sats`} />
          <DetailRow label="Output" value={inscription.output} copyable mono />
          <DetailRow label="Offset" value={inscription.offset?.toString()} />
        </div>

        <div className="flex gap-3">
          <a
            href={`https://ordinals.com/inscription/${inscription.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on ordinals.com
          </a>
          <a
            href={`https://mempool.space/tx/${inscription.genesisTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Mempool
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable,
  mono,
  link,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
  link?: string;
}) {
  if (!value) return null;

  const displayValue = value.length > 40 ? shortenTxid(value, 16) : value;

  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-800/50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-1.5">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm text-brand-400 hover:underline ${mono ? 'font-mono' : ''}`}
          >
            {displayValue}
          </a>
        ) : (
          <span className={`text-sm text-gray-200 ${mono ? 'font-mono' : ''}`}>
            {displayValue}
          </span>
        )}
        {copyable && (
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
