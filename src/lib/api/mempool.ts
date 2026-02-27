import { MEMPOOL_API } from '../constants';
import type { Utxo, FeeRate, TransactionInfo } from '@/types/transaction';

const api = (path: string) => `${MEMPOOL_API}${path}`;

export async function fetchUtxos(address: string): Promise<Utxo[]> {
  const res = await fetch(api(`/address/${address}/utxo`));
  if (!res.ok) throw new Error(`Failed to fetch UTXOs: ${res.statusText}`);
  return res.json();
}

export async function fetchFeeRates(): Promise<FeeRate> {
  const res = await fetch(api('/v1/fees/recommended'));
  if (!res.ok) throw new Error(`Failed to fetch fee rates: ${res.statusText}`);
  const data = await res.json();
  return {
    fastest: data.fastestFee,
    halfHour: data.halfHourFee,
    hour: data.hourFee,
    economy: data.economyFee,
    minimum: data.minimumFee,
  };
}

export async function fetchTxHex(txid: string): Promise<string> {
  const res = await fetch(api(`/tx/${txid}/hex`));
  if (!res.ok) throw new Error(`Failed to fetch tx hex: ${res.statusText}`);
  return res.text();
}

export async function fetchTx(txid: string): Promise<any> {
  const res = await fetch(api(`/tx/${txid}`));
  if (!res.ok) throw new Error(`Failed to fetch tx: ${res.statusText}`);
  return res.json();
}

export async function fetchTxStatus(txid: string): Promise<TransactionInfo> {
  const tx = await fetchTx(txid);
  return {
    txid: tx.txid,
    status: tx.status?.confirmed ? 'confirmed' : 'mempool',
    confirmations: tx.status?.block_height
      ? Math.max(0, (await fetchBlockHeight()) - tx.status.block_height + 1)
      : 0,
    fee: tx.fee,
    size: tx.size,
    timestamp: tx.status?.block_time,
  };
}

export async function fetchBlockHeight(): Promise<number> {
  const res = await fetch(api('/blocks/tip/height'));
  if (!res.ok) throw new Error('Failed to fetch block height');
  return parseInt(await res.text(), 10);
}

export async function broadcastTransaction(txHex: string): Promise<string> {
  const res = await fetch(api('/tx'), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: txHex,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Broadcast failed: ${error}`);
  }
  return res.text();
}

export async function fetchOutspend(txid: string, vout: number): Promise<{ spent: boolean; txid?: string }> {
  const res = await fetch(api(`/tx/${txid}/outspend/${vout}`));
  if (!res.ok) return { spent: false };
  return res.json();
}

export async function fetchAddressBalance(address: string): Promise<{
  funded: number;
  spent: number;
  balance: number;
}> {
  const res = await fetch(api(`/address/${address}`));
  if (!res.ok) throw new Error('Failed to fetch address balance');
  const data = await res.json();
  const funded =
    (data.chain_stats?.funded_txo_sum || 0) + (data.mempool_stats?.funded_txo_sum || 0);
  const spent =
    (data.chain_stats?.spent_txo_sum || 0) + (data.mempool_stats?.spent_txo_sum || 0);
  return { funded, spent, balance: funded - spent };
}
