import type { Order } from '@/types/order';
import https from 'https';
import { SocksProxyAgent } from 'socks-proxy-agent';

export const ME_API_BASE = 'https://api-mainnet.magiceden.dev/v2/ord/btc';

const torAgent = new SocksProxyAgent('socks5h://127.0.0.1:9050');

export interface MEListingItem {
  id: string;
  inscriptionNumber: number;
  listedPrice: number;
  owner: string;
  collectionSymbol: string;
  listedAt?: string;
  contentType?: string;
  location?: string;
}

export function meListingToOrder(item: MEListingItem): Order {
  let txid = '';
  let vout = 0;
  if (item.location) {
    const parts = item.location.split(':');
    txid = parts[0] || '';
    vout = parseInt(parts[1] || '0', 10);
  }

  const createdAt = item.listedAt ? new Date(item.listedAt).getTime() : Date.now();

  return {
    id: `me-${item.id}`,
    inscriptionId: item.id,
    price: item.listedPrice,
    sellerAddress: item.owner || '',
    sellerPubkey: '',
    signedPsbtBase64: '',
    createdAt,
    status: 'active',
    utxo: { txid, vout, value: item.listedPrice },
    source: 'magiceden',
    marketplaceUrl: `https://magiceden.io/ordinals/item-details/${item.id}`,
    collectionSymbol: item.collectionSymbol,
    inscriptionNumber: item.inscriptionNumber,
  };
}

/** Fetch URL via Tor SOCKS proxy using native https module */
function fetchViaTor(url: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: torAgent, headers: { Accept: 'application/json' }, timeout: 20000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 500, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode || 500, data: null });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Tor request timeout')); });
  });
}

export async function fetchMEListings(
  collectionSymbol: string,
  options: { limit?: number; offset?: number } = {}
): Promise<Order[]> {
  const { limit = 20, offset = 0 } = options;
  const params = new URLSearchParams({
    collectionSymbol,
    sortBy: 'priceAsc',
    showAll: 'false',
    limit: String(limit),
    offset: String(offset),
  });

  const url = `${ME_API_BASE}/tokens?${params}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const apiKey = process.env.ME_API_KEY;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    // Try direct fetch first
    let data: any = null;
    const res = await fetch(url, { headers });

    if (res.status === 429) {
      // Rate-limited — fallback through Tor
      console.log(`ME 429 for ${collectionSymbol}, trying Tor...`);
      try {
        const torRes = await fetchViaTor(url);
        if (torRes.status === 200 && torRes.data) {
          data = torRes.data;
        } else {
          console.error(`ME Tor fallback: ${torRes.status} for ${collectionSymbol}`);
          return [];
        }
      } catch (err) {
        console.error(`ME Tor failed for ${collectionSymbol}:`, err);
        return [];
      }
    } else if (!res.ok) {
      console.error(`ME API error: ${res.status} for ${collectionSymbol}`);
      return [];
    } else {
      data = await res.json();
    }

    const items: MEListingItem[] = Array.isArray(data)
      ? data
      : data.tokens || data.items || [];
    return items.filter((t) => t.listedPrice > 0).map(meListingToOrder);
  } catch (err) {
    console.error(`ME API fetch failed for ${collectionSymbol}:`, err);
    return [];
  }
}
