"use client";

import { useEffect, useState } from "react";
import { MarketData, SUPPORTED_TOKENS } from "@/lib/types";

export default function PriceTicker() {
  const [prices, setPrices] = useState<Record<string, MarketData>>({});

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/market-data");
        if (res.ok) {
          setPrices(await res.json());
        }
      } catch {}
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const tokens = Object.keys(SUPPORTED_TOKENS);

  return (
    <div className="overflow-hidden border-y border-white/5 bg-surface/30">
      <div className="flex animate-[ticker-scroll_30s_linear_infinite] gap-8 px-4 py-2 whitespace-nowrap">
        {[...tokens, ...tokens].map((symbol, i) => {
          const data = prices[symbol];
          const positive = data && data.change24h >= 0;
          return (
            <div key={`${symbol}-${i}`} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">${symbol}</span>
              {data ? (
                <>
                  <span className="text-muted font-mono">
                    ${data.price < 1 ? data.price.toFixed(4) : data.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span className={positive ? "text-green-400" : "text-red-400"}>
                    {positive ? "+" : ""}
                    {data.change24h.toFixed(2)}%
                  </span>
                </>
              ) : (
                <span className="text-muted">--</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
