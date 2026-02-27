import { COLLECTIONS_GITHUB } from '../constants';
import type { Collection, CollectionMeta } from '@/types/collection';

let collectionsCache: Map<string, Collection> | null = null;

/**
 * Fetch collection metadata from the ordinals-collections GitHub repo.
 */
export async function fetchCollectionMeta(slug: string): Promise<CollectionMeta | null> {
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
    // The file contains an array of objects with { id: string }
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

/**
 * Fetch a curated list of collection slugs.
 */
export async function fetchCollectionSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/ordinals-wallet/ordinals-collections/contents/collections'
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .filter((item: any) => item.type === 'dir')
      .map((item: any) => item.name);
  } catch {
    return [];
  }
}
