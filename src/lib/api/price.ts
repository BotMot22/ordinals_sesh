let cachedPrice: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60_000; // 1 minute

export async function fetchBtcPrice(): Promise<number> {
  if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
    return cachedPrice.price;
  }

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (!res.ok) throw new Error('Failed to fetch BTC price');
    const data = await res.json();
    const price = data.bitcoin.usd;
    cachedPrice = { price, timestamp: Date.now() };
    return price;
  } catch {
    // Fallback: try mempool.space
    try {
      const res = await fetch('https://mempool.space/api/v1/prices');
      if (!res.ok) throw new Error('Fallback price fetch failed');
      const data = await res.json();
      const price = data.USD;
      cachedPrice = { price, timestamp: Date.now() };
      return price;
    } catch {
      return cachedPrice?.price || 0;
    }
  }
}
