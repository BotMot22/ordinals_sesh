export interface Inscription {
  id: string;
  number: number;
  address: string;
  output: string;
  outputValue: number;
  contentType: string;
  contentLength: number;
  timestamp: number;
  genesisHeight: number;
  genesisFee: number;
  genesisTx: string;
  location: string;
  offset: number;
  sat: number;
  satName: string;
  rarity: string;
  collectionSlug?: string;
  collectionName?: string;
  meta?: Record<string, unknown>;
}

export interface InscriptionContent {
  type: 'image' | 'text' | 'html' | 'audio' | 'video' | 'model' | 'unknown';
  url: string;
  previewUrl: string;
}

export interface InscriptionUtxo {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: string;
}
