'use client';

import { useState, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useListings } from '@/hooks/useListings';
import { useUtxos } from '@/hooks/useUtxos';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';
import { InscriptionGrid } from '@/components/inscription/InscriptionGrid';
import { WalletModal } from '@/components/wallet/WalletModal';
import { Wallet, ExternalLink, Copy } from 'lucide-react';
import { shortenAddress, formatSats, formatUsd } from '@/lib/utils';

export default function ProfilePage() {
  const { wallet } = useWallet();
  const { data: listings } = useListings();
  const { data: utxos } = useUtxos();
  const { data: btcPrice } = useBitcoinPrice();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'inscriptions'>('listings');

  const myListings = useMemo(() => {
    if (!listings || !wallet) return [];
    return listings
      .filter((l) => l.sellerAddress === wallet.address)
      .map((order) => ({
        id: order.inscriptionId,
        price: order.price,
      }));
  }, [listings, wallet]);

  const totalBalance = useMemo(() => {
    if (!utxos) return 0;
    return utxos.reduce((sum, u) => sum + u.value, 0);
  }, [utxos]);

  if (!wallet) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400 mb-6">
          Connect a Bitcoin wallet to view your inscriptions and manage listings.
        </p>
        <button onClick={() => setShowWalletModal(true)} className="btn-primary">
          Connect Wallet
        </button>
        <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 font-mono text-sm">
                {shortenAddress(wallet.address, 10)}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(wallet.address)}
                className="text-gray-600 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a
                href={`https://mempool.space/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-lg font-bold text-white">{formatSats(totalBalance)}</p>
              {btcPrice && (
                <p className="text-xs text-gray-500">{formatUsd(totalBalance, btcPrice)}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-lg font-bold text-brand-400">{myListings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'listings'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          My Listings ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab('inscriptions')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'inscriptions'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          My Inscriptions
        </button>
      </div>

      {/* Content */}
      {activeTab === 'listings' && (
        <InscriptionGrid
          items={myListings}
          emptyMessage="You don't have any active listings."
        />
      )}

      {activeTab === 'inscriptions' && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-2">
            Browse your inscriptions on ordinals.com
          </p>
          <a
            href={`https://ordinals.com/address/${wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm inline-flex items-center gap-2"
          >
            View Inscriptions
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
