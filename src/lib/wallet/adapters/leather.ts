import type { WalletAdapter, ConnectedWallet, SignPsbtOptions } from '@/types/wallet';

declare global {
  interface Window {
    LeatherProvider?: any;
    HiroWalletProvider?: any;
  }
}

export class LeatherAdapter implements WalletAdapter {
  type = 'leather' as const;
  name = 'Leather';
  icon = '/wallets/leather.svg';
  url = 'https://leather.io';

  private get provider() {
    return typeof window !== 'undefined'
      ? window.LeatherProvider || window.HiroWalletProvider
      : null;
  }

  isInstalled(): boolean {
    return !!this.provider;
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.isInstalled()) throw new Error('Leather wallet not installed');

    const response = await this.provider.request('getAddresses');
    const addresses = response.result.addresses;

    const taprootAddr = addresses.find((a: any) => a.type === 'p2tr');
    const paymentAddr = addresses.find((a: any) => a.type === 'p2wpkh');

    if (!taprootAddr) throw new Error('No taproot address found in Leather wallet');

    return {
      type: 'leather',
      address: taprootAddr.address,
      publicKey: taprootAddr.publicKey,
      paymentAddress: paymentAddr?.address,
      paymentPublicKey: paymentAddr?.publicKey,
    };
  }

  async disconnect(): Promise<void> {
    // Leather doesn't have a disconnect method
  }

  async signPsbt(psbtBase64: string, options?: SignPsbtOptions): Promise<string> {
    if (!this.isInstalled()) throw new Error('Leather wallet not installed');

    const requestParams: any = {
      hex: Buffer.from(psbtBase64, 'base64').toString('hex'),
      broadcast: options?.broadcast ?? false,
    };

    if (options?.toSignInputs) {
      requestParams.signAtIndex = options.toSignInputs.map((i) => i.index);
    }

    const response = await this.provider.request('signPsbt', requestParams);
    const signedHex = response.result.hex;

    return Buffer.from(signedHex, 'hex').toString('base64');
  }
}
