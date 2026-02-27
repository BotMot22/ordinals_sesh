import type { Utxo, DummyUtxo } from '@/types/transaction';
import { MEMPOOL_API, DUMMY_UTXO_VALUE } from '../constants';

export async function getUtxos(address: string): Promise<Utxo[]> {
  const res = await fetch(`${MEMPOOL_API}/address/${address}/utxo`);
  if (!res.ok) throw new Error(`Failed to fetch UTXOs for ${address}`);
  return res.json();
}

export async function getTxHex(txid: string): Promise<string> {
  const res = await fetch(`${MEMPOOL_API}/tx/${txid}/hex`);
  if (!res.ok) throw new Error(`Failed to fetch tx hex for ${txid}`);
  return res.text();
}

export async function getTxInfo(txid: string): Promise<any> {
  const res = await fetch(`${MEMPOOL_API}/tx/${txid}`);
  if (!res.ok) throw new Error(`Failed to fetch tx info for ${txid}`);
  return res.json();
}

export function findDummyUtxo(utxos: Utxo[]): DummyUtxo | null {
  const confirmed = utxos.filter((u) => u.status.confirmed);
  // Look for a UTXO close to DUMMY_UTXO_VALUE
  const dummy = confirmed.find((u) => u.value >= DUMMY_UTXO_VALUE && u.value <= DUMMY_UTXO_VALUE * 2);
  if (dummy) {
    return { txid: dummy.txid, vout: dummy.vout, value: dummy.value };
  }
  return null;
}

export function findPaymentUtxos(utxos: Utxo[], amount: number): Utxo[] {
  // Filter out tiny UTXOs that might be inscriptions
  const paymentUtxos = utxos
    .filter((u) => u.status.confirmed && u.value > 10000)
    .sort((a, b) => b.value - a.value);

  const selected: Utxo[] = [];
  let total = 0;

  for (const utxo of paymentUtxos) {
    selected.push(utxo);
    total += utxo.value;
    if (total >= amount) break;
  }

  if (total < amount) {
    throw new Error(`Insufficient funds. Need ${amount} sats but only have ${total} sats available.`);
  }

  return selected;
}

export async function broadcastTx(txHex: string): Promise<string> {
  const res = await fetch(`${MEMPOOL_API}/tx`, {
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

export async function checkUtxoSpent(txid: string, vout: number): Promise<boolean> {
  try {
    const res = await fetch(`${MEMPOOL_API}/tx/${txid}/outspend/${vout}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.spent === true;
  } catch {
    return false;
  }
}
