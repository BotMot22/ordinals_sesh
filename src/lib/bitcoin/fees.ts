import type { FeeRate } from '@/types/transaction';
import { MEMPOOL_API } from '../constants';

export async function getRecommendedFees(): Promise<FeeRate> {
  const res = await fetch(`${MEMPOOL_API}/v1/fees/recommended`);
  if (!res.ok) throw new Error('Failed to fetch fee rates');
  const data = await res.json();
  return {
    fastest: data.fastestFee,
    halfHour: data.halfHourFee,
    hour: data.hourFee,
    economy: data.economyFee,
    minimum: data.minimumFee,
  };
}

export function estimateTxSize(inputCount: number, outputCount: number, isTaproot = false): number {
  if (isTaproot) {
    // Taproot: ~58 vbytes per input, ~43 per output, ~10.5 overhead
    return Math.ceil(10.5 + inputCount * 58 + outputCount * 43);
  }
  // Segwit: ~68 vbytes per input, ~31 per output, ~10.5 overhead
  return Math.ceil(10.5 + inputCount * 68 + outputCount * 31);
}

export function calculateFee(vsize: number, feeRate: number): number {
  return Math.ceil(vsize * feeRate);
}

export function estimateBuyTxFee(feeRate: number, isTaproot = false): number {
  // Buy tx: 3+ inputs (dummy, seller's inscription, payment), 4 outputs (inscription, payment, new dummy, change)
  const vsize = estimateTxSize(3, 4, isTaproot);
  return calculateFee(vsize, feeRate);
}

export function estimateDummyUtxoFee(feeRate: number, isTaproot = false): number {
  // Dummy UTXO tx: 1 input, 2 outputs (dummy + change)
  const vsize = estimateTxSize(1, 2, isTaproot);
  return calculateFee(vsize, feeRate);
}
