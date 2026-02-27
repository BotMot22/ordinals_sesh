import type { WalletAdapter, ConnectedWallet, SignPsbtOptions } from '@/types/wallet';
import { psbtBase64ToHex, psbtHexToBase64 } from '@/lib/utils';

declare global {
  interface Window {
    okxwallet?: any;
  }
}

export class OkxAdapter implements WalletAdapter {
  type = 'okx' as const;
  name = 'OKX Wallet';
  icon = '/wallets/okx.svg';
  url = 'https://www.okx.com/web3';

  private get bitcoin() {
    return typeof window !== 'undefined' ? window.okxwallet?.bitcoin : null;
  }

  isInstalled(): boolean {
    return !!this.bitcoin;
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.isInstalled()) throw new Error('OKX wallet not installed');

    const result = await this.bitcoin.connect();
    const publicKey = await this.bitcoin.getPublicKey();

    return {
      type: 'okx',
      address: result.address,
      publicKey,
    };
  }

  async disconnect(): Promise<void> {
    // OKX doesn't have a disconnect method
  }

  async signPsbt(psbtBase64: string, options?: SignPsbtOptions): Promise<string> {
    if (!this.isInstalled()) throw new Error('OKX wallet not installed');

    const psbtHex = psbtBase64ToHex(psbtBase64);

    const signedHex = await this.bitcoin.signPsbt(psbtHex, {
      autoFinalized: options?.autoFinalized ?? false,
      toSignInputs: options?.toSignInputs,
    });

    return psbtHexToBase64(signedHex);
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isInstalled()) throw new Error('OKX wallet not installed');
    return this.bitcoin.signMessage(message);
  }
}
