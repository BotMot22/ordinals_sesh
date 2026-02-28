import { NextRequest, NextResponse } from 'next/server';
import { fetchMEListings } from '@/lib/marketplace/magiceden';
import { ME_COLLECTIONS } from '@/lib/constants';
import type { Order } from '@/types/order';

// Per-collection cache — each collection cached independently
const collectionCache: Map<string, { data: Order[]; ts: number }> = new Map();
const CACHE_TTL = 120_000; // 2 min per collection

// Rotation index for staggered fetching — only fetch 2 collections per "all" request
let rotationIndex = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    if (collection) {
      // Single collection request
      const meSymbol = ME_COLLECTIONS[collection] || collection;
      const cached = collectionCache.get(meSymbol);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        const sliced = cached.data.slice(offset, offset + limit);
        return NextResponse.json(sliced);
      }

      const listings = await fetchMEListings(meSymbol, { limit, offset });
      collectionCache.set(meSymbol, { data: listings, ts: Date.now() });
      return NextResponse.json(listings, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    // "All" request — gather cached data + fetch 2 stale/missing collections per call
    const symbols = Object.values(ME_COLLECTIONS);
    const allListings: Order[] = [];
    const staleSymbols: string[] = [];

    // Collect cached data and identify stale collections
    for (const sym of symbols) {
      const cached = collectionCache.get(sym);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        allListings.push(...cached.data);
      } else {
        staleSymbols.push(sym);
      }
    }

    // Fetch up to 2 stale collections per request (uses ~2 API calls = safe at 30 QPM)
    const toFetch = staleSymbols.length > 0
      ? staleSymbols.slice(0, 2)
      : symbols.slice(rotationIndex, rotationIndex + 2);
    rotationIndex = (rotationIndex + 2) % symbols.length;

    for (const sym of toFetch) {
      try {
        const listings = await fetchMEListings(sym, { limit: 20, offset: 0 });
        collectionCache.set(sym, { data: listings, ts: Date.now() });
        // Remove old data for this symbol from allListings, add fresh
        const freshIds = new Set(listings.map((l) => l.id));
        const filtered = allListings.filter((l) => !freshIds.has(l.id));
        filtered.push(...listings);
        allListings.length = 0;
        allListings.push(...filtered);
      } catch {
        // Skip failed collections
      }
      // 2.5s between calls
      if (toFetch.indexOf(sym) < toFetch.length - 1) {
        await new Promise((r) => setTimeout(r, 2500));
      }
    }

    // Sort by price ascending and limit
    allListings.sort((a, b) => a.price - b.price);
    const result = allListings.slice(0, limit);

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('ME listings proxy error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
