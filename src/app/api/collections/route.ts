import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS_GITHUB } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (slug) {
      // Fetch specific collection metadata
      const metaRes = await fetch(`${COLLECTIONS_GITHUB}/${slug}/meta.json`, {
        next: { revalidate: 3600 },
      });

      if (!metaRes.ok) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      const meta = await metaRes.json();

      // Also fetch inscriptions list
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

    // Fetch list of all collections
    const res = await fetch(
      'https://api.github.com/repos/ordinals-wallet/ordinals-collections/contents/collections',
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }

    const data = await res.json();
    const slugs = data
      .filter((item: any) => item.type === 'dir')
      .map((item: any) => item.name);

    return NextResponse.json({ slugs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
