import * as bitcoin from 'bitcoinjs-lib';
import { BITCOIN_NETWORK } from '../constants';

export function getNetwork(): bitcoin.Network {
  return BITCOIN_NETWORK === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
}

export function isMainnet(): boolean {
  return BITCOIN_NETWORK === 'mainnet';
}
