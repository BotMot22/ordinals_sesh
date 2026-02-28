import type { WalletInfo } from '@/types/wallet';

export const ORDINALS_API = process.env.NEXT_PUBLIC_ORDINALS_API || 'https://ordinals.com';
export const MEMPOOL_API = process.env.NEXT_PUBLIC_MEMPOOL_API || 'https://mempool.space/api';
export const COLLECTIONS_GITHUB = process.env.NEXT_PUBLIC_COLLECTIONS_GITHUB || 'https://raw.githubusercontent.com/ordinals-wallet/ordinals-collections/main/collections';

export const NOSTR_RELAYS = (process.env.NEXT_PUBLIC_NOSTR_RELAYS || 'wss://nostr.mutinywallet.com,wss://relay.damus.io,wss://nos.lol').split(',');

export const BITCOIN_NETWORK = process.env.NEXT_PUBLIC_BITCOIN_NETWORK || 'mainnet';

export const DUMMY_UTXO_VALUE = parseInt(process.env.NEXT_PUBLIC_DUMMY_UTXO_VALUE || '1000', 10);

export const NOSTR_KIND_OPENORDEX = 802;

export const SATS_PER_BTC = 100_000_000;

export const MIN_RELAY_FEE = 1000;
export const INSCRIPTION_SAFETY_OFFSET = 546;
export const DUST_LIMIT = 546;
export const MIN_OUTPUT_VALUE = 546;

export const PLATFORM_FEE_PERCENT = 0; // Zero fees

export const WALLETS: WalletInfo[] = [
  {
    type: 'unisat',
    name: 'Unisat',
    icon: '/wallets/unisat.svg',
    url: 'https://unisat.io',
    description: 'Popular Bitcoin wallet with Ordinals support',
  },
  {
    type: 'xverse',
    name: 'Xverse',
    icon: '/wallets/xverse.svg',
    url: 'https://www.xverse.app',
    description: 'Bitcoin wallet for Web3',
  },
  {
    type: 'leather',
    name: 'Leather',
    icon: '/wallets/leather.svg',
    url: 'https://leather.io',
    description: 'Formerly Hiro Wallet',
  },
  {
    type: 'okx',
    name: 'OKX Wallet',
    icon: '/wallets/okx.svg',
    url: 'https://www.okx.com/web3',
    description: 'OKX Web3 wallet',
  },
  {
    type: 'magic-eden',
    name: 'Magic Eden',
    icon: '/wallets/magiceden.svg',
    url: 'https://wallet.magiceden.io',
    description: 'Magic Eden wallet',
  },
  {
    type: 'manual',
    name: 'Manual / Sparrow',
    icon: '/wallets/sparrow.svg',
    url: 'https://sparrowwallet.com',
    description: 'Sign PSBTs manually with any wallet',
  },
];

export const FEATURED_COLLECTIONS = [
  'bitcoin-puppets',
  'nodemonkes',
  'quantum-cats',
  'bitcoin-frogs',
  'omb',
  'pizza-ninjas',
];

// Maps our collection slugs to Magic Eden collection symbols
export const ME_COLLECTIONS: Record<string, string> = {
  'bitcoin-puppets': 'bitcoin-puppets',
  'nodemonkes': 'nodemonkes',
  'quantum-cats': 'quantum-cats',
  'bitcoin-frogs': 'bitcoin-frogs',
  'omb': 'ordinal-maxi-biz',
  'pizza-ninjas': 'pizza-ninjas',
};

export const ME_API_BASE = 'https://api-mainnet.magiceden.dev/v2/ord/btc';
