import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

let initialized = false;

export async function initBitcoin(): Promise<void> {
  if (initialized) return;
  bitcoin.initEccLib(ecc);
  initialized = true;
}

export function getEccLib() {
  return ecc;
}

export { bitcoin, ecc };
