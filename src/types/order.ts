export interface Order {
  id: string;
  inscriptionId: string;
  price: number;
  sellerAddress: string;
  sellerPubkey: string;
  signedPsbtBase64: string;
  createdAt: number;
  status: OrderStatus;
  nostrEventId?: string;
  utxo: {
    txid: string;
    vout: number;
    value: number;
  };
}

export type OrderStatus = 'active' | 'sold' | 'cancelled' | 'expired';

export interface NostrOrderEvent {
  kind: number;
  content: string;
  tags: string[][];
  created_at: number;
  pubkey: string;
  id: string;
  sig: string;
}

export interface OrderFilter {
  inscriptionId?: string;
  sellerAddress?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'recent';
}
