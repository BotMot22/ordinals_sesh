import type { WalletAdapter, ConnectedWallet, SignPsbtOptions } from '@/types/wallet';

/**
 * Manual/Sparrow adapter - allows users to copy/paste PSBTs
 * for signing in external wallets like Sparrow.
 */
export class ManualAdapter implements WalletAdapter {
  type = 'manual' as const;
  name = 'Manual / Sparrow';
  icon = '/wallets/sparrow.svg';
  url = 'https://sparrowwallet.com';

  private address = '';
  private publicKey = '';

  isInstalled(): boolean {
    return true; // Always available
  }

  async connect(): Promise<ConnectedWallet> {
    // The manual adapter requires the user to input their address
    // This is handled by the WalletModal component
    return {
      type: 'manual',
      address: this.address,
      publicKey: this.publicKey,
    };
  }

  async disconnect(): Promise<void> {
    this.address = '';
    this.publicKey = '';
  }

  /**
   * For the manual adapter, signPsbt shows the PSBT to the user
   * and waits for them to paste back the signed version.
   * The actual UI for this is in ManualPsbtModal component.
   */
  async signPsbt(psbtBase64: string, _options?: SignPsbtOptions): Promise<string> {
    // This will be intercepted by the ManualPsbtModal component
    // The modal will show the PSBT and wait for the user to paste the signed version
    throw new Error('MANUAL_SIGN_REQUIRED');
  }

  setAddress(address: string) {
    this.address = address;
  }

  setPublicKey(publicKey: string) {
    this.publicKey = publicKey;
  }
}
