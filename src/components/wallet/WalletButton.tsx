'use client';

import { useState } from 'react';
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from 'lucide-react';
import { useWalletContext } from '@/contexts/WalletContext';
import { shortenAddress } from '@/lib/utils';
import { WalletModal } from './WalletModal';

export function WalletButton() {
  const { wallet, disconnect, isConnecting } = useWalletContext();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (isConnecting) {
    return (
      <button disabled className="btn-primary opacity-70 text-sm flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Connecting...
      </button>
    );
  }

  if (!wallet) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Connect
        </button>
        <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn-secondary text-sm flex items-center gap-2 px-3 py-2"
      >
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span>{shortenAddress(wallet.address, 4)}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-900 border border-gray-800 shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-1">Connected</p>
              <p className="text-sm text-white font-mono">{shortenAddress(wallet.address, 8)}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wallet.address);
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
              <a
                href={`https://mempool.space/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                onClick={() => setShowDropdown(false)}
              >
                <ExternalLink className="w-4 h-4" />
                View on Mempool
              </a>
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
