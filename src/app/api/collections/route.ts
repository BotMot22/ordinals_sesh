import { NextRequest, NextResponse } from 'next/server';
import { ME_API_BASE, ME_COLLECTIONS, FEATURED_COLLECTIONS, COLLECTIONS_GITHUB } from '@/lib/constants';
import https from 'https';
import { SocksProxyAgent } from 'socks-proxy-agent';

const ME_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  ...(process.env.ME_API_KEY ? { Authorization: `Bearer ${process.env.ME_API_KEY}` } : {}),
};

const torAgent = new SocksProxyAgent('socks5h://127.0.0.1:9050');

function fetchViaTor(url: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: torAgent, headers: { Accept: 'application/json' }, timeout: 20000 }, (res) => {
      let body = '';
      res.on('data', (chunk: string) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 500, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode || 500, data: null });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// In-memory cache for ME stats (5 min TTL)
const statsCache: Map<string, { data: any; ts: number }> = new Map();
const STATS_TTL = 300_000;

async function fetchMEStats(symbol: string) {
  const cached = statsCache.get(symbol);
  if (cached && Date.now() - cached.ts < STATS_TTL) return cached.data;

  const url = `${ME_API_BASE}/stat?collectionSymbol=${symbol}`;

  // Try direct first
  const res = await fetch(url, { headers: ME_HEADERS });

  let data: any = null;
  if (res.status === 429) {
    try {
      const torRes = await fetchViaTor(url);
      if (torRes.status === 200 && torRes.data) data = torRes.data;
      else return null;
    } catch {
      return null;
    }
  } else if (!res.ok) {
    return null;
  } else {
    data = await res.json();
  }

  statsCache.set(symbol, { data, ts: Date.now() });
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (slug) {
      // Resolve ME symbol from our mapping, or use slug directly
      const meSymbol = ME_COLLECTIONS[slug] || slug;

      // Try ME API first — it has all major collections
      const stats = await fetchMEStats(meSymbol);

      if (stats && stats.symbol) {
        // Fetch listing inscription IDs from ME for this collection
        let inscriptions: string[] = [];
        try {
          const listRes = await fetch(
            `${ME_API_BASE}/tokens?collectionSymbol=${meSymbol}&sortBy=priceAsc&showAll=false&limit=100`,
            { headers: ME_HEADERS }
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            const tokens = Array.isArray(listData) ? listData : listData.tokens || listData.items || [];
            inscriptions = tokens.map((t: any) => t.id).filter(Boolean);
          }
        } catch {
          // listings optional
        }

        const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        return NextResponse.json({
          slug,
          name,
          description: '',
          icon: '',
          supply: parseInt(stats.supply || '0', 10),
          floorPrice: parseInt(stats.floorPrice || '0', 10),
          totalVolume: stats.totalVolume,
          totalListed: parseInt(stats.totalListed || '0', 10),
          owners: parseInt(stats.owners || '0', 10),
          inscriptions,
        });
      }

      // Fallback to GitHub collections repo
      const metaRes = await fetch(`${COLLECTIONS_GITHUB}/${slug}/meta.json`, {
        next: { revalidate: 3600 },
      });

      if (!metaRes.ok) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      const meta = await metaRes.json();

      let inscriptions: string[] = [];
      try {
        const inscRes = await fetch(`${COLLECTIONS_GITHUB}/${slug}/inscriptions.json`, {
          next: { revalidate: 3600 },
        });
        if (inscRes.ok) {
          const data = await inscRes.json();
          inscriptions = Array.isArray(data) ? data.map((item: any) => item.id || item) : [];
        }
      } catch {
        // inscriptions list optional
      }

      return NextResponse.json({
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
      });
    }

    // No slug — return list of featured collection slugs
    return NextResponse.json({ slugs: FEATURED_COLLECTIONS });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
