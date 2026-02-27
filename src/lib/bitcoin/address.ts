import * as bitcoin from 'bitcoinjs-lib';
import { getNetwork } from './network';

export type AddressType = 'p2tr' | 'p2wpkh' | 'p2sh-p2wpkh' | 'p2pkh' | 'unknown';

export function getAddressType(address: string): AddressType {
  const network = getNetwork();
  try {
    if (address.startsWith('bc1p') || address.startsWith('tb1p')) {
      return 'p2tr';
    }
    if (address.startsWith('bc1q') || address.startsWith('tb1q')) {
      return 'p2wpkh';
    }
    if (address.startsWith('3') || address.startsWith('2')) {
      return 'p2sh-p2wpkh';
    }
    if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
      return 'p2pkh';
    }
  } catch {
    // ignore
  }
  return 'unknown';
}

export function addressToOutputScript(address: string): Buffer {
  const network = getNetwork();
  return bitcoin.address.toOutputScript(address, network);
}

export function outputScriptToAddress(script: Buffer): string {
  const network = getNetwork();
  return bitcoin.address.fromOutputScript(script, network);
}

export function isTaprootAddress(address: string): boolean {
  return getAddressType(address) === 'p2tr';
}

export function validateAddress(address: string): boolean {
  try {
    const network = getNetwork();
    bitcoin.address.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
}
