export interface TransactionInfo {
  txid: string;
  status: TransactionStatus;
  confirmations: number;
  fee: number;
  size: number;
  timestamp?: number;
}

export type TransactionStatus = 'pending' | 'mempool' | 'confirmed' | 'failed';

export interface FeeRate {
  fastest: number;
  halfHour: number;
  hour: number;
  economy: number;
  minimum: number;
}

export interface Utxo {
  txid: string;
  vout: number;
  value: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface DummyUtxo {
  txid: string;
  vout: number;
  value: number;
}
