import { COLLECTIONS_GITHUB, ME_API_BASE, ME_COLLECTIONS } from '../constants';
import type { Collection, CollectionMeta } from '@/types/collection';

const ME_HEADERS: Record<string, string> = {
  Accept: 'application/json',
};

/**
 * Fetch collection metadata — tries Magic Eden first, falls back to GitHub.
 */
export async function fetchCollectionMeta(slug: string): Promise<CollectionMeta | null> {
  const meSymbol = ME_COLLECTIONS[slug] || slug;

  // Try ME API with retry on 429
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`${ME_API_BASE}/stat?collectionSymbol=${meSymbol}`, {
        headers: ME_HEADERS,
      });
      if (res.status === 429) {
        const retryAfter = Math.min(parseInt(res.headers.get('Retry-After') || '3', 10), 5);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }
      if (res.ok) {
        const stats = await res.json();
        if (stats && stats.symbol) {
          const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          return {
            name,
            inscription_icon: '',
            icon: '',
            supply: String(stats.supply || '0'),
            description: '',
          };
        }
      }
      break;
    }
  } catch {
    // fall through to GitHub
  }

  // Fallback to GitHub collections repo
  try {
    const res = await fetch(`${COLLECTIONS_GITHUB}/${slug}/meta.json`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch the list of inscription IDs in a collection.
 */
export async function fetchCollectionInscriptions(slug: string): Promise<string[]> {
  try {
    const res = await fetch(`${COLLECTIONS_GITHUB}/${slug}/inscriptions.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((item: any) => item.id || item) : [];
  } catch {
    return [];
  }
}

/**
 * Fetch full collection data.
 */
export async function fetchCollection(slug: string): Promise<Collection | null> {
  const meta = await fetchCollectionMeta(slug);
  if (!meta) return null;

  const inscriptions = await fetchCollectionInscriptions(slug);

  return {
    slug,
    name: meta.name,
    description: meta.description || '',
    icon: meta.inscription_icon
      ? `https://ordinals.com/content/${meta.inscription_icon}`
      : meta.icon || '',
    inscriptionIcon: meta.inscription_icon,
    supply: parseInt(meta.supply || '0', 10) || inscriptions.length,
    twitterLink: meta.twitter_link,
    discordLink: meta.discord_link,
    websiteLink: meta.website_link,
    inscriptions,
  };
}
