import type { WalletAdapter, ConnectedWallet, SignPsbtOptions } from '@/types/wallet';
import { psbtBase64ToHex, psbtHexToBase64 } from '@/lib/utils';

declare global {
  interface Window {
    magicEden?: any;
  }
}

export class MagicEdenAdapter implements WalletAdapter {
  type = 'magic-eden' as const;
  name = 'Magic Eden';
  icon = '/wallets/magiceden.svg';
  url = 'https://wallet.magiceden.io';

  private get bitcoin() {
    return typeof window !== 'undefined' ? window.magicEden?.bitcoin : null;
  }

  isInstalled(): boolean {
    return !!this.bitcoin;
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.isInstalled()) throw new Error('Magic Eden wallet not installed');

    const accounts = await this.bitcoin.connect();
    const ordinalsAccount = accounts.find((a: any) => a.purpose === 'ordinals');
    const paymentAccount = accounts.find((a: any) => a.purpose === 'payment');

    if (!ordinalsAccount) throw new Error('No ordinals account found');

    return {
      type: 'magic-eden',
      address: ordinalsAccount.address,
      publicKey: ordinalsAccount.publicKey,
      paymentAddress: paymentAccount?.address,
      paymentPublicKey: paymentAccount?.publicKey,
    };
  }

  async disconnect(): Promise<void> {
    if (this.bitcoin?.disconnect) {
      await this.bitcoin.disconnect();
    }
  }

  async signPsbt(psbtBase64: string, options?: SignPsbtOptions): Promise<string> {
    if (!this.isInstalled()) throw new Error('Magic Eden wallet not installed');

    const psbtHex = psbtBase64ToHex(psbtBase64);

    const signedHex = await this.bitcoin.signPsbt(psbtHex, {
      autoFinalized: options?.autoFinalized ?? false,
      toSignInputs: options?.toSignInputs,
      broadcast: options?.broadcast ?? false,
    });

    return psbtHexToBase64(signedHex);
  }
}
