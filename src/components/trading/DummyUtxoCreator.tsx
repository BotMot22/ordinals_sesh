'use client';

import { useState } from 'react';
import { Coins, AlertCircle, CheckCircle } from 'lucide-react';
import { TransactionStatus } from './TransactionStatus';

interface DummyUtxoCreatorProps {
  onCreated: (txid: string) => void;
  onCreate: () => Promise<string>;
}

export function DummyUtxoCreator({ onCreated, onCreate }: DummyUtxoCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const result = await onCreate();
      setTxid(result);
      onCreated(result);
    } catch (err: any) {
      setError(err.message || 'Failed to create dummy UTXO');
    } finally {
      setIsCreating(false);
    }
  };

  if (txid) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Dummy UTXO created!</span>
        </div>
        <TransactionStatus txid={txid} />
        <p className="text-xs text-gray-500">
          Wait for confirmation before proceeding with the purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
        <Coins className="w-5 h-5 text-brand-400 mt-0.5" />
        <div>
          <p className="text-sm text-white">Dummy UTXO Needed</p>
          <p className="text-xs text-gray-400 mt-1">
            A small UTXO (1000 sats) is needed to ensure ordinal theory routes the inscription
            to you correctly. This is a one-time setup transaction.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="btn-primary w-full text-sm"
      >
        {isCreating ? 'Creating...' : 'Create Dummy UTXO (~1000 sats + fee)'}
      </button>
    </div>
  );
}
