export type WalletType = 'unisat' | 'xverse' | 'leather' | 'okx' | 'magic-eden' | 'manual';

export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  url: string;
  description: string;
}

export interface ConnectedWallet {
  type: WalletType;
  address: string;
  publicKey: string;
  paymentAddress?: string;
  paymentPublicKey?: string;
}

export interface WalletAdapter {
  type: WalletType;
  name: string;
  icon: string;
  url: string;
  isInstalled(): boolean;
  connect(): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
  signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string>;
  signMessage?(message: string): Promise<string>;
  getBalance?(): Promise<number>;
}

export interface SignPsbtOptions {
  autoFinalized?: boolean;
  toSignInputs?: {
    index: number;
    address?: string;
    publicKey?: string;
    sighashTypes?: number[];
    disableTweakSigner?: boolean;
  }[];
  broadcast?: boolean;
}
