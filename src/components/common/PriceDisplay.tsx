'use client';

import { formatSats, formatUsd } from '@/lib/utils';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';

interface PriceDisplayProps {
  sats: number;
  size?: 'sm' | 'md' | 'lg';
  showUsd?: boolean;
}

export function PriceDisplay({ sats, size = 'md', showUsd = true }: PriceDisplayProps) {
  const { data: btcPrice } = useBitcoinPrice();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-bold',
  };

  return (
    <div className="flex flex-col">
      <span className={`text-brand-400 font-medium ${sizeClasses[size]}`}>
        {formatSats(sats)}
      </span>
      {showUsd && btcPrice && (
        <span className="text-gray-500 text-xs">
          {formatUsd(sats, btcPrice)}
        </span>
      )}
    </div>
  );
}
