import { NextRequest, NextResponse } from 'next/server';
import { ORDINALS_API } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try JSON first
    let res = await fetch(`${ORDINALS_API}/inscription/${id}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    // Fallback: fetch HTML and parse
    res = await fetch(`${ORDINALS_API}/inscription/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Inscription ${id} not found` },
        { status: 404 }
      );
    }

    const html = await res.text();

    const getField = (label: string): string => {
      const regex = new RegExp(`<dt>${label}</dt>\\s*<dd[^>]*>([\\s\\S]*?)</dd>`);
      const match = html.match(regex);
      if (!match) return '';
      return match[1].replace(/<[^>]*>/g, '').trim();
    };

    const getFieldHref = (label: string): string => {
      const regex = new RegExp(`<dt>${label}</dt>\\s*<dd[^>]*>\\s*<a[^>]*href="([^"]*)"[^>]*>`);
      const match = html.match(regex);
      return match ? match[1].replace(/^\/output\//, '') : '';
    };

    const data = {
      id,
      number: parseInt(getField('number') || '0', 10),
      address: getField('address'),
      output: getFieldHref('output') || getField('output'),
      outputValue: parseInt(getField('output value') || '0', 10),
      contentType: getField('content type'),
      contentLength: parseInt(getField('content length')?.replace(/\s*bytes/, '') || '0', 10),
      timestamp: 0,
      genesisHeight: parseInt(getField('genesis height') || '0', 10),
      genesisFee: parseInt(getField('genesis fee') || '0', 10),
      genesisTx: getField('genesis transaction'),
      location: getField('location'),
      offset: parseInt(getField('offset') || '0', 10),
      sat: 0,
      satName: '',
      rarity: getField('rarity') || 'common',
    };

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inscription' },
      { status: 500 }
    );
  }
}
