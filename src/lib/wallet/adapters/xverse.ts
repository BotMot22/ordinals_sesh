import type { WalletAdapter, ConnectedWallet, SignPsbtOptions } from '@/types/wallet';
import { psbtBase64ToHex, psbtHexToBase64 } from '@/lib/utils';

export class XverseAdapter implements WalletAdapter {
  type = 'xverse' as const;
  name = 'Xverse';
  icon = '/wallets/xverse.svg';
  url = 'https://www.xverse.app';

  isInstalled(): boolean {
    return typeof window !== 'undefined' && (!!((window as any).XverseProviders) || !!((window as any).BitcoinProvider));
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.isInstalled()) throw new Error('Xverse wallet not installed');

    // Use sats-connect for Xverse
    const { default: Wallet, AddressPurpose } = await import('sats-connect');

    return new Promise((resolve, reject) => {
      Wallet.request('getAccounts', {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
      }).then((response: any) => {
        if (response.status === 'error') {
          reject(new Error(response.error?.message || 'Failed to connect'));
          return;
        }

        const ordinalsAccount = response.result.find(
          (a: any) => a.purpose === AddressPurpose.Ordinals
        );
        const paymentAccount = response.result.find(
          (a: any) => a.purpose === AddressPurpose.Payment
        );

        if (!ordinalsAccount) {
          reject(new Error('No ordinals account found'));
          return;
        }

        resolve({
          type: 'xverse',
          address: ordinalsAccount.address,
          publicKey: ordinalsAccount.publicKey,
          paymentAddress: paymentAccount?.address,
          paymentPublicKey: paymentAccount?.publicKey,
        });
      }).catch(reject);
    });
  }

  async disconnect(): Promise<void> {
    // Xverse doesn't have a disconnect method
  }

  async signPsbt(psbtBase64: string, options?: SignPsbtOptions): Promise<string> {
    if (!this.isInstalled()) throw new Error('Xverse wallet not installed');

    const { default: Wallet } = await import('sats-connect');

    return new Promise((resolve, reject) => {
      const signInputs: Record<string, number[]> = {};

      if (options?.toSignInputs) {
        for (const input of options.toSignInputs) {
          const addr = input.address || '';
          if (!signInputs[addr]) signInputs[addr] = [];
          signInputs[addr].push(input.index);
        }
      }

      Wallet.request('signPsbt', {
        psbt: psbtBase64,
        signInputs,
        broadcast: options?.broadcast ?? false,
      }).then((response: any) => {
        if (response.status === 'error') {
          reject(new Error(response.error?.message || 'Failed to sign PSBT'));
          return;
        }
        resolve(response.result.psbt);
      }).catch(reject);
    });
  }
}
