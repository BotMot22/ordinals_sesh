import type { WalletAdapter, ConnectedWallet, SignPsbtOptions } from '@/types/wallet';
import { psbtBase64ToHex, psbtHexToBase64 } from '@/lib/bitcoin/psbt';

declare global {
  interface Window {
    unisat?: any;
  }
}

export class UnisatAdapter implements WalletAdapter {
  type = 'unisat' as const;
  name = 'Unisat';
  icon = '/wallets/unisat.svg';
  url = 'https://unisat.io';

  isInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.unisat;
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.isInstalled()) throw new Error('Unisat wallet not installed');

    const accounts = await window.unisat.requestAccounts();
    if (!accounts || accounts.length === 0) throw new Error('No accounts found');

    const publicKey = await window.unisat.getPublicKey();

    // Switch to mainnet
    try {
      await window.unisat.switchNetwork('livenet');
    } catch {
      // May already be on mainnet
    }

    return {
      type: 'unisat',
      address: accounts[0],
      publicKey,
    };
  }

  async disconnect(): Promise<void> {
    // Unisat doesn't have a disconnect method
  }

  async signPsbt(psbtBase64: string, options?: SignPsbtOptions): Promise<string> {
    if (!this.isInstalled()) throw new Error('Unisat wallet not installed');

    // Unisat takes hex PSBTs
    const psbtHex = psbtBase64ToHex(psbtBase64);

    const signedHex = await window.unisat.signPsbt(psbtHex, {
      autoFinalized: options?.autoFinalized ?? false,
      toSignInputs: options?.toSignInputs,
    });

    // Convert back to base64
    return psbtHexToBase64(signedHex);
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isInstalled()) throw new Error('Unisat wallet not installed');
    return window.unisat.signMessage(message);
  }

  async getBalance(): Promise<number> {
    if (!this.isInstalled()) throw new Error('Unisat wallet not installed');
    const balance = await window.unisat.getBalance();
    return balance.total;
  }
}
