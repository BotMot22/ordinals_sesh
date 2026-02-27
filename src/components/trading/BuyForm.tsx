'use client';

import { useState } from 'react';
import { ShoppingCart, AlertCircle, Info } from 'lucide-react';
import { useWalletContext } from '@/contexts/WalletContext';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { formatSats } from '@/lib/utils';
import type { Order } from '@/types/order';

interface BuyFormProps {
  order: Order;
  estimatedFee: number;
  hasDummyUtxo: boolean;
  onBuy: () => Promise<void>;
  onCreateDummy: () => Promise<void>;
  isLoading?: boolean;
  isCreatingDummy?: boolean;
}

export function BuyForm({
  order,
  estimatedFee,
  hasDummyUtxo,
  onBuy,
  onCreateDummy,
  isLoading,
  isCreatingDummy,
}: BuyFormProps) {
  const { wallet } = useWalletContext();
  const [error, setError] = useState('');

  const totalCost = order.price + estimatedFee + 1000; // price + fee + new dummy UTXO

  const handleBuy = async () => {
    setError('');
    try {
      await onBuy();
    } catch (err: any) {
      setError(err.message || 'Failed to buy inscription');
    }
  };

  const handleCreateDummy = async () => {
    setError('');
    try {
      await onCreateDummy();
    } catch (err: any) {
      setError(err.message || 'Failed to create dummy UTXO');
    }
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingCart className="w-5 h-5 text-brand-400" />
        <h3 className="text-lg font-semibold text-white">Buy Now</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Price</span>
          <PriceDisplay sats={order.price} size="md" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Est. Network Fee</span>
          <span className="text-sm text-gray-300">{formatSats(estimatedFee)}</span>
        </div>
        <div className="border-t border-gray-800 my-2" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Total</span>
          <PriceDisplay sats={totalCost} size="md" />
        </div>
      </div>

      {!hasDummyUtxo && (
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-200">Dummy UTXO required</p>
              <p className="text-xs text-yellow-400/70 mt-1">
                You need a small UTXO (~1000 sats) to ensure the inscription transfers correctly.
                This is a one-time setup.
              </p>
              <button
                onClick={handleCreateDummy}
                disabled={isCreatingDummy || !wallet}
                className="btn-primary text-sm mt-2 px-4 py-1.5"
              >
                {isCreatingDummy ? 'Creating...' : 'Create Dummy UTXO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleBuy}
        disabled={isLoading || !wallet || !hasDummyUtxo}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : !wallet ? (
          'Connect Wallet to Buy'
        ) : !hasDummyUtxo ? (
          'Create Dummy UTXO First'
        ) : (
          `Buy for ${formatSats(order.price)}`
        )}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Non-custodial. You sign a PSBT that completes the seller&apos;s listing.
      </p>
    </div>
  );
}
