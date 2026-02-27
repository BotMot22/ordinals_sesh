'use client';

import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { useWalletContext } from '@/contexts/WalletContext';
import { WALLETS } from '@/lib/constants';
import { getWalletAdapter } from '@/lib/wallet/adapter';
import type { WalletType } from '@/types/wallet';
import { ExternalLink } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, error } = useWalletContext();
  const [connecting, setConnecting] = useState<WalletType | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleConnect = async (type: WalletType) => {
    if (type === 'manual') {
      setShowManual(true);
      return;
    }

    try {
      setConnecting(type);
      await connect(type);
      onClose();
    } catch {
      // Error is handled by context
    } finally {
      setConnecting(null);
    }
  };

  const handleManualConnect = async () => {
    if (!manualAddress.trim()) return;
    try {
      setConnecting('manual');
      await connect('manual', manualAddress.trim());
      onClose();
      setShowManual(false);
      setManualAddress('');
    } catch {
      // Error handled by context
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      {showManual ? (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Enter your Bitcoin address to use with an external wallet like Sparrow.
            You&apos;ll sign PSBTs manually.
          </p>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="bc1p... or bc1q... or 1... or 3..."
            className="input-field w-full font-mono text-sm"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowManual(false)} className="btn-secondary flex-1">
              Back
            </button>
            <button
              onClick={handleManualConnect}
              disabled={!manualAddress.trim() || connecting === 'manual'}
              className="btn-primary flex-1"
            >
              {connecting === 'manual' ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-400 text-sm mb-4">
            Choose a wallet to connect. Your keys never leave your wallet.
          </p>

          {WALLETS.map((walletInfo) => {
            const adapter = getWalletAdapter(walletInfo.type);
            const installed = adapter.isInstalled();
            const isConnecting = connecting === walletInfo.type;

            return (
              <button
                key={walletInfo.type}
                onClick={() => handleConnect(walletInfo.type)}
                disabled={isConnecting}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <span className="text-lg font-bold text-brand-400">
                    {walletInfo.name[0]}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{walletInfo.name}</span>
                    {installed && walletInfo.type !== 'manual' && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">
                        Installed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{walletInfo.description}</p>
                </div>
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                ) : !installed && walletInfo.type !== 'manual' ? (
                  <a
                    href={walletInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-500 hover:text-brand-400"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : null}
              </button>
            );
          })}

          {error && (
            <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
          )}
        </div>
      )}
    </Modal>
  );
}
