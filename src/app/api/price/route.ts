import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try CoinGecko first
    let price = 0;
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        const data = await res.json();
        price = data.bitcoin.usd;
      }
    } catch {
      // Fallback to mempool.space
      const res = await fetch('https://mempool.space/api/v1/prices', {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        price = data.USD;
      }
    }

    return NextResponse.json({ price });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
