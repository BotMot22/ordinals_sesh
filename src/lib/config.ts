import * as bitcoin from 'bitcoinjs-lib';
import { BITCOIN_NETWORK } from './constants';

export function getBitcoinNetwork(): bitcoin.Network {
  return BITCOIN_NETWORK === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
}

export const config = {
  network: BITCOIN_NETWORK as 'mainnet' | 'testnet',
  isDev: process.env.NODE_ENV === 'development',
} as const;
