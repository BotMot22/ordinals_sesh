import type { WalletAdapter, ConnectedWallet, SignPsbtOptions } from '@/types/wallet';

export class XverseAdapter implements WalletAdapter {
  type = 'xverse' as const;
  name = 'Xverse';
  icon = '/wallets/xverse.svg';
  url = 'https://www.xverse.app';

  isInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    // Check all known Xverse injection points
    if (window.XverseProviders?.BitcoinProvider) return true;
    if (window.BitcoinProvider) return true;
    // sats-connect v4 uses a WBIP provider registry — check for any registered providers
    if ((window as any).__WALLET_STANDARD__?.get?.()) return true;
    // Also check the sats-connect wallet providers event target
    if ((window as any).btc_providers && (window as any).btc_providers.length > 0) return true;
    return false;
  }

  async connect(): Promise<ConnectedWallet> {
    const { request, AddressPurpose, getProviders } = await import('sats-connect');

    // Use sats-connect's own provider detection as fallback
    if (!this.isInstalled()) {
      try {
        const providers = getProviders();
        if (!providers || providers.length === 0) {
          throw new Error('Xverse wallet not installed');
        }
      } catch {
        throw new Error('Xverse wallet not installed');
      }
    }

    const response = await request('getAccounts', {
      purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
    });

    if (response.status === 'error') {
      throw new Error(
        (response as any).error?.message || 'Failed to connect Xverse'
      );
    }

    const accounts = (response as any).result;
    const ordinalsAccount = accounts.find(
      (a: any) => a.purpose === AddressPurpose.Ordinals
    );
    const paymentAccount = accounts.find(
      (a: any) => a.purpose === AddressPurpose.Payment
    );

    if (!ordinalsAccount) {
      throw new Error('No ordinals account found in Xverse');
    }

    return {
      type: 'xverse',
      address: ordinalsAccount.address,
      publicKey: ordinalsAccount.publicKey,
      paymentAddress: paymentAccount?.address,
      paymentPublicKey: paymentAccount?.publicKey,
    };
  }

  async disconnect(): Promise<void> {
    // Xverse doesn't have a disconnect method
  }

  async signPsbt(psbtBase64: string, options?: SignPsbtOptions): Promise<string> {
    const { request } = await import('sats-connect');

    const signInputs: Record<string, number[]> = {};
    if (options?.toSignInputs) {
      for (const input of options.toSignInputs) {
        const addr = input.address || '';
        if (!signInputs[addr]) signInputs[addr] = [];
        signInputs[addr].push(input.index);
      }
    }

    const response = await request('signPsbt', {
      psbt: psbtBase64,
      signInputs,
      broadcast: options?.broadcast ?? false,
    });

    if (response.status === 'error') {
      throw new Error(
        (response as any).error?.message || 'Failed to sign PSBT'
      );
    }

    return (response as any).result.psbt;
  }
}
