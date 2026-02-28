'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { ConnectedWallet, WalletType, SignPsbtOptions } from '@/types/wallet';
import { getWalletAdapter } from '@/lib/wallet/adapter';
import type { WalletAdapter } from '@/types/wallet';

interface WalletContextValue {
  wallet: ConnectedWallet | null;
  adapter: WalletAdapter | null;
  isConnecting: boolean;
  error: string | null;
  connect: (type: WalletType, manualAddress?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signPsbt: (psbtBase64: string, options?: SignPsbtOptions) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue>({
  wallet: null,
  adapter: null,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: async () => {},
  signPsbt: async () => '',
});

const WALLET_STORAGE_KEY = 'ordinals_wallet';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [adapter, setAdapter] = useState<WalletAdapter | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (type: WalletType, manualAddress?: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      const walletAdapter = getWalletAdapter(type);

      if (type === 'manual' && manualAddress) {
        (walletAdapter as any).setAddress(manualAddress);
      }

      // For sats-connect wallets (xverse), skip the isInstalled gate —
      // sats-connect has its own provider detection that catches cases
      // where the extension injects after page load or under different globals.
      // The adapter's connect() handles the "not installed" error itself.
      if (type !== 'manual' && type !== 'xverse' && !walletAdapter.isInstalled()) {
        throw new Error(`${walletAdapter.name} is not installed. Please install it from ${walletAdapter.url}`);
      }

      const connectedWallet = await walletAdapter.connect();

      if (type === 'manual' && manualAddress) {
        connectedWallet.address = manualAddress;
      }

      setWallet(connectedWallet);
      setAdapter(walletAdapter);

      // Persist wallet type for auto-reconnect
      if (typeof window !== 'undefined') {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ type }));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to connect wallet');
      throw e;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (adapter) {
        await adapter.disconnect();
      }
    } catch {
      // Ignore disconnect errors
    }
    setWallet(null);
    setAdapter(null);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, [adapter]);

  const signPsbt = useCallback(
    async (psbtBase64: string, options?: SignPsbtOptions): Promise<string> => {
      if (!adapter) throw new Error('No wallet connected');
      return adapter.signPsbt(psbtBase64, options);
    },
    [adapter]
  );

  // Auto-reconnect on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!stored) return;

    try {
      const { type } = JSON.parse(stored) as { type: WalletType };
      if (type && type !== 'manual') {
        connect(type).catch(() => {
          localStorage.removeItem(WALLET_STORAGE_KEY);
        });
      }
    } catch {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, [connect]);

  return (
    <WalletContext.Provider
      value={{ wallet, adapter, isConnecting, error, connect, disconnect, signPsbt }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  return useContext(WalletContext);
}
