import { type Event, type EventTemplate, finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools';
import { NOSTR_KIND_OPENORDEX } from '../constants';

export interface OrderEventContent {
  inscriptionId: string;
  price: number;
  sellerAddress: string;
  signedPsbtBase64: string;
  utxo: {
    txid: string;
    vout: number;
    value: number;
  };
}

/**
 * Create an unsigned OpenOrdex kind 802 event for a listing.
 * The caller must sign this with their Nostr key or a generated key.
 */
export function createOrderEvent(content: OrderEventContent): EventTemplate {
  return {
    kind: NOSTR_KIND_OPENORDEX,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['i', content.inscriptionId],
      ['p', content.price.toString()],
      ['s', content.sellerAddress],
      ['u', `${content.utxo.txid}:${content.utxo.vout}`],
      ['n', 'mainnet'],
      ['t', 'sell'],
      ['op', 'openordex'],
    ],
    content: content.signedPsbtBase64,
  };
}

/**
 * Parse an OpenOrdex order event back into structured data.
 */
export function parseOrderEvent(event: Event): OrderEventContent | null {
  try {
    const getTag = (name: string) => event.tags.find((t) => t[0] === name)?.[1];

    const inscriptionId = getTag('i');
    const priceStr = getTag('p');
    const sellerAddress = getTag('s');
    const utxoStr = getTag('u');

    if (!inscriptionId || !priceStr || !sellerAddress || !utxoStr) {
      return null;
    }

    const [txid, voutStr] = utxoStr.split(':');
    const price = parseInt(priceStr, 10);

    if (isNaN(price) || price <= 0) return null;

    return {
      inscriptionId,
      price,
      sellerAddress,
      signedPsbtBase64: event.content,
      utxo: {
        txid,
        vout: parseInt(voutStr, 10),
        value: 0, // Will be filled from UTXO lookup
      },
    };
  } catch {
    return null;
  }
}

/**
 * Sign an event with a generated ephemeral key.
 * Used when the wallet doesn't support Nostr signing.
 */
export function signEventWithEphemeralKey(template: EventTemplate): Event {
  const sk = generateSecretKey();
  return finalizeEvent(template, sk);
}

/**
 * Get the Nostr filter for fetching OpenOrdex orders.
 */
export function getOrderFilter(options?: {
  inscriptionId?: string;
  since?: number;
  limit?: number;
}): any {
  const filter: any = {
    kinds: [NOSTR_KIND_OPENORDEX],
  };

  if (options?.inscriptionId) {
    filter['#i'] = [options.inscriptionId];
  }

  if (options?.since) {
    filter.since = options.since;
  }

  if (options?.limit) {
    filter.limit = options.limit;
  }

  return filter;
}
