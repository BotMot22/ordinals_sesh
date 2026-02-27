import { SimplePool, type Event, type Filter } from 'nostr-tools';
import { NOSTR_RELAYS } from '../constants';

let pool: SimplePool | null = null;

export function getPool(): SimplePool {
  if (!pool) {
    pool = new SimplePool();
  }
  return pool;
}

export function getRelays(): string[] {
  return NOSTR_RELAYS;
}

export async function publishEvent(event: Event): Promise<void> {
  const p = getPool();
  const relays = getRelays();
  await Promise.any(p.publish(relays, event));
}

export async function fetchEvents(filter: Filter): Promise<Event[]> {
  const p = getPool();
  const relays = getRelays();
  return p.querySync(relays, filter);
}

export function subscribeEvents(
  filter: Filter,
  onEvent: (event: Event) => void
): { close: () => void } {
  const p = getPool();
  const relays = getRelays();
  const sub = p.subscribeMany(relays, [filter] as any, {
    onevent: onEvent,
  });
  return { close: () => sub.close() };
}

export function closePool(): void {
  if (pool) {
    pool.close(getRelays());
    pool = null;
  }
}
