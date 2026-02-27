import type { Event, Filter } from 'nostr-tools';
import { NOSTR_RELAYS } from '../constants';

let pool: any = null;

async function getPool() {
  if (!pool) {
    const { SimplePool } = await import('nostr-tools');
    pool = new SimplePool();
  }
  return pool;
}

export function getRelays(): string[] {
  return NOSTR_RELAYS;
}

export async function publishEvent(event: Event): Promise<void> {
  const p = await getPool();
  const relays = getRelays();
  await Promise.any(p.publish(relays, event));
}

export async function fetchEvents(filter: Filter): Promise<Event[]> {
  const p = await getPool();
  const relays = getRelays();
  return p.querySync(relays, filter);
}

export function subscribeEvents(
  filter: Filter,
  onEvent: (event: Event) => void
): { close: () => void } {
  let sub: any = null;
  let closed = false;

  getPool().then((p: any) => {
    if (closed) return;
    const relays = getRelays();
    sub = p.subscribeMany(relays, [filter] as any, {
      onevent: onEvent,
    });
  });

  return {
    close: () => {
      closed = true;
      sub?.close();
    },
  };
}

export async function closePool(): Promise<void> {
  if (pool) {
    pool.close(getRelays());
    pool = null;
  }
}
