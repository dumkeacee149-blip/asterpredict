export interface PredictionRequest {
  token: string;
  timeframe: string;
}

export interface PredictionResult {
  direction: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
  token: string;
  timeframe: string;
  timestamp: number;
}

export interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  sparkline?: number[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const SUPPORTED_TOKENS: Record<string, { name: string; coingeckoId: string; symbol: string }> = {
  ASTER: { name: "Aster", coingeckoId: "aster", symbol: "ASTER" },
  BTC: { name: "Bitcoin", coingeckoId: "bitcoin", symbol: "BTC" },
  ETH: { name: "Ethereum", coingeckoId: "ethereum", symbol: "ETH" },
  SOL: { name: "Solana", coingeckoId: "solana", symbol: "SOL" },
  BNB: { name: "BNB", coingeckoId: "binancecoin", symbol: "BNB" },
};

export const TIMEFRAMES = ["1H", "4H", "24H", "7D"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
