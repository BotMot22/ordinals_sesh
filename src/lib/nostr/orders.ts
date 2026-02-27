import type { Event } from 'nostr-tools';
import type { Order, OrderFilter } from '@/types/order';
import { fetchEvents, subscribeEvents, publishEvent } from './client';
import { createOrderEvent, parseOrderEvent, signEventWithEphemeralKey, getOrderFilter } from './events';

/**
 * Fetch all active orders from Nostr relays.
 */
export async function fetchOrders(filter?: OrderFilter): Promise<Order[]> {
  const nostrFilter = getOrderFilter({
    inscriptionId: filter?.inscriptionId,
    limit: 500,
  });

  const events = await fetchEvents(nostrFilter);
  const orders = await processEvents(events);

  return applyFilter(orders, filter);
}

/**
 * Fetch the best (cheapest active) order for an inscription.
 */
export async function fetchBestOrder(inscriptionId: string): Promise<Order | null> {
  const orders = await fetchOrders({ inscriptionId, sortBy: 'price_asc' });
  return orders[0] || null;
}

/**
 * Subscribe to new orders in real-time.
 */
export function subscribeToOrders(
  onOrder: (order: Order) => void,
  filter?: { inscriptionId?: string }
): { close: () => void } {
  const nostrFilter = getOrderFilter({
    inscriptionId: filter?.inscriptionId,
    since: Math.floor(Date.now() / 1000),
  });

  return subscribeEvents(nostrFilter, async (event) => {
    const orders = await processEvents([event]);
    orders.forEach(onOrder);
  });
}

/**
 * Publish a new listing order to Nostr.
 */
export async function publishOrder(params: {
  inscriptionId: string;
  price: number;
  sellerAddress: string;
  signedPsbtBase64: string;
  utxo: { txid: string; vout: number; value: number };
}): Promise<string> {
  const template = createOrderEvent(params);
  const event = await signEventWithEphemeralKey(template);
  await publishEvent(event);
  return event.id;
}

/**
 * Process raw Nostr events into validated orders.
 * Deduplicates by inscription ID (keeps newest).
 */
async function processEvents(events: Event[]): Promise<Order[]> {
  const orderMap = new Map<string, Order>();
  const { validateSellerPsbt } = await import('../bitcoin/psbt');

  for (const event of events) {
    const parsed = parseOrderEvent(event);
    if (!parsed) continue;

    // Validate the PSBT structure
    const validation = validateSellerPsbt(parsed.signedPsbtBase64);
    if (!validation.valid) continue;

    const existing = orderMap.get(parsed.inscriptionId);
    if (existing && existing.createdAt > event.created_at) continue;

    orderMap.set(parsed.inscriptionId, {
      id: event.id,
      inscriptionId: parsed.inscriptionId,
      price: parsed.price,
      sellerAddress: parsed.sellerAddress,
      sellerPubkey: event.pubkey,
      signedPsbtBase64: parsed.signedPsbtBase64,
      createdAt: event.created_at,
      status: 'active',
      nostrEventId: event.id,
      utxo: parsed.utxo,
    });
  }

  return Array.from(orderMap.values());
}

/**
 * Check if an order is still valid (UTXO not spent).
 */
export async function isOrderStale(order: Order): Promise<boolean> {
  const { checkUtxoSpent } = await import('../bitcoin/utxo');
  return checkUtxoSpent(order.utxo.txid, order.utxo.vout);
}

function applyFilter(orders: Order[], filter?: OrderFilter): Order[] {
  let filtered = orders;

  if (filter?.sellerAddress) {
    filtered = filtered.filter((o) => o.sellerAddress === filter.sellerAddress);
  }
  if (filter?.minPrice) {
    filtered = filtered.filter((o) => o.price >= filter.minPrice!);
  }
  if (filter?.maxPrice) {
    filtered = filtered.filter((o) => o.price <= filter.maxPrice!);
  }

  switch (filter?.sortBy) {
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'recent':
    default:
      filtered.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return filtered;
}
