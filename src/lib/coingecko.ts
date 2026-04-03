import { MarketData, SUPPORTED_TOKENS } from "./types";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

let cache: { data: Record<string, MarketData>; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

export async function getMarketData(tokenSymbol: string): Promise<MarketData | null> {
  const token = SUPPORTED_TOKENS[tokenSymbol];
  if (!token) return null;

  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL && cache.data[tokenSymbol]) {
    return cache.data[tokenSymbol];
  }

  try {
    const ids = Object.values(SUPPORTED_TOKENS).map((t) => t.coingeckoId).join(",");
    const res = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const coins = await res.json();
    const newCache: Record<string, MarketData> = {};

    for (const coin of coins) {
      const symbol = Object.entries(SUPPORTED_TOKENS).find(
        ([, v]) => v.coingeckoId === coin.id
      )?.[0];
      if (symbol) {
        newCache[symbol] = {
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          volume24h: coin.total_volume,
          marketCap: coin.market_cap,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          sparkline: coin.sparkline_in_7d?.price?.slice(-24),
        };
      }
    }

    cache = { data: newCache, timestamp: Date.now() };
    return newCache[tokenSymbol] || null;
  } catch {
    return null;
  }
}

export async function getAllMarketData(): Promise<Record<string, MarketData>> {
  // Trigger fetch for any token to populate cache for all
  await getMarketData("ASTER");
  return cache?.data || {};
}
