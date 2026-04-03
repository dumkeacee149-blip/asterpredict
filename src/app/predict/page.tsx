"use client";

import { useEffect, useState } from "react";
import PredictionCard from "@/components/PredictionCard";
import ChatInterface from "@/components/ChatInterface";
import SentimentGauge from "@/components/SentimentGauge";
import PriceTicker from "@/components/PriceTicker";
import Particles from "@/components/reactbits/Particles";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import { MarketData, SUPPORTED_TOKENS } from "@/lib/types";

export default function PredictPage() {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [selectedToken, setSelectedToken] = useState("ASTER");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/market-data");
        if (res.ok) setMarketData(await res.json());
      } catch {}
    }
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentData = marketData[selectedToken];
  const sentimentScore = currentData
    ? Math.max(0, Math.min(100, 50 + currentData.change24h * 2))
    : 50;

  return (
    <div className="flex flex-col">
      <PriceTicker />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-10">
        {/* Subtle particles */}
        <div className="fixed inset-0 pointer-events-none">
          <Particles count={20} color="201, 168, 92" connectDistance={80} maxSpeed={0.15} size={1} />
        </div>

        {/* Header */}
        <AnimatedContent>
          <div className="mb-10">
            <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight">
              🥷 <span className="text-gold">Prediction</span> Dashboard
            </h1>
            <p className="text-muted mt-2 text-lg">
              AI-powered market analysis for the Aster DEX ecosystem
            </p>
          </div>
        </AnimatedContent>

        <div className="relative z-10 grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token selector */}
            <AnimatedContent delay={0.05}>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SUPPORTED_TOKENS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedToken(key)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                      selectedToken === key
                        ? "bg-accent text-background shadow-[0_0_20px_rgba(201,168,92,0.2)]"
                        : "ink-card text-muted hover:text-foreground"
                    }`}
                  >
                    ${val.symbol}
                  </button>
                ))}
              </div>
            </AnimatedContent>

            {/* Market Overview */}
            {currentData && (
              <AnimatedContent delay={0.1}>
                <div className="ink-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight font-[var(--font-heading)]">
                        ${SUPPORTED_TOKENS[selectedToken].symbol}
                      </h2>
                      <p className="text-sm text-muted">
                        {SUPPORTED_TOKENS[selectedToken].name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold font-mono tracking-tight">
                        ${currentData.price < 1
                          ? currentData.price.toFixed(4)
                          : currentData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm font-medium ${currentData.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {currentData.change24h >= 0 ? "↑" : "↓"}{" "}
                        {Math.abs(currentData.change24h).toFixed(2)}% (24h)
                      </div>
                    </div>
                  </div>

                  {/* Sparkline */}
                  {currentData.sparkline && currentData.sparkline.length > 0 && (
                    <div className="h-28 flex items-end gap-[2px] mb-6">
                      {currentData.sparkline.map((price, i) => {
                        const min = Math.min(...currentData.sparkline!);
                        const max = Math.max(...currentData.sparkline!);
                        const range = max - min || 1;
                        const height = ((price - min) / range) * 100;
                        const isLast = i === currentData.sparkline!.length - 1;
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-t transition-all duration-300 ${isLast ? "bg-accent" : "bg-accent/30 hover:bg-accent/50"}`}
                            style={{ height: `${Math.max(4, height)}%` }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-6 border-t border-accent/[0.08] pt-5">
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider mb-1">Volume 24h</div>
                      <div className="text-base font-semibold font-mono">${(currentData.volume24h / 1e6).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider mb-1">High 24h</div>
                      <div className="text-base font-semibold font-mono text-green-400">
                        ${currentData.high24h < 1 ? currentData.high24h.toFixed(4) : currentData.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider mb-1">Low 24h</div>
                      <div className="text-base font-semibold font-mono text-red-400">
                        ${currentData.low24h < 1 ? currentData.low24h.toFixed(4) : currentData.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            )}

            {/* Prediction Card */}
            <AnimatedContent delay={0.15}>
              <div className="ink-card p-0 rounded-2xl">
                <PredictionCard />
              </div>
            </AnimatedContent>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <AnimatedContent delay={0.1} direction="right">
              <div className="ink-card p-0 rounded-2xl">
                <SentimentGauge value={Math.round(sentimentScore)} />
              </div>
            </AnimatedContent>
            <AnimatedContent delay={0.2} direction="right">
              <div className="ink-card p-0 rounded-2xl">
                <ChatInterface />
              </div>
            </AnimatedContent>
          </div>
        </div>

        {/* Disclaimer */}
        <AnimatedContent delay={0.3}>
          <div className="mt-10 ink-card rounded-2xl p-5 text-center">
            <p className="text-xs text-muted/70">
              ⚠️ Asterpredict AI predictions are for informational and entertainment
              purposes only. This is NOT financial advice. Always DYOR and never invest more than you can afford to lose.
            </p>
          </div>
        </AnimatedContent>
      </div>
    </div>
  );
}
