'use client';

import { useState } from 'react';
import { Tag, AlertCircle } from 'lucide-react';
import { useWalletContext } from '@/contexts/WalletContext';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { btcToSats, satsToBtc } from '@/lib/utils';
import { DUST_LIMIT } from '@/lib/constants';

interface ListingFormProps {
  inscriptionId: string;
  onSubmit: (priceSats: number) => Promise<void>;
  isLoading?: boolean;
}

export function ListingForm({ inscriptionId, onSubmit, isLoading }: ListingFormProps) {
  const { wallet } = useWalletContext();
  const [priceInput, setPriceInput] = useState('');
  const [priceUnit, setPriceUnit] = useState<'sats' | 'btc'>('sats');
  const [error, setError] = useState('');

  const priceSats =
    priceUnit === 'btc'
      ? btcToSats(parseFloat(priceInput) || 0)
      : parseInt(priceInput, 10) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    if (priceSats < DUST_LIMIT) {
      setError(`Price must be at least ${DUST_LIMIT} sats`);
      return;
    }

    try {
      await onSubmit(priceSats);
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-5 h-5 text-brand-400" />
        <h3 className="text-lg font-semibold text-white">List for Sale</h3>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Price</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder={priceUnit === 'sats' ? '100000' : '0.001'}
            className="input-field flex-1"
            step={priceUnit === 'btc' ? '0.00000001' : '1'}
            min="0"
          />
          <select
            value={priceUnit}
            onChange={(e) => setPriceUnit(e.target.value as 'sats' | 'btc')}
            className="input-field w-20"
          >
            <option value="sats">sats</option>
            <option value="btc">BTC</option>
          </select>
        </div>
        {priceSats > 0 && (
          <div className="mt-2">
            <PriceDisplay sats={priceSats} size="sm" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || priceSats < DUST_LIMIT || !wallet}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Listing...
          </span>
        ) : !wallet ? (
          'Connect Wallet to List'
        ) : (
          'Create Listing'
        )}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Zero fees. You&apos;ll sign a PSBT with SIGHASH_SINGLE|ANYONECANPAY.
      </p>
    </form>
  );
}
