"use client";

import { useState, useEffect } from "react";
import { SUPPORTED_TOKENS, TIMEFRAMES, MarketData } from "@/lib/types";

interface PredictionResult {
  direction: string;
  confidence: number;
  target_price?: number;
  support?: number;
  resistance?: number;
  reasoning: string;
}

export default function PredictionCard({ compact = false }: { compact?: boolean }) {
  const [token, setToken] = useState("ASTER");
  const [timeframe, setTimeframe] = useState("24H");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [streamText, setStreamText] = useState("");
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/market-data");
        if (res.ok) setMarketData(await res.json());
      } catch {}
    }
    fetchData();
  }, []);

  const currentPrice = marketData[token]?.price;
  const change24h = marketData[token]?.change24h;

  async function handlePredict() {
    setLoading(true);
    setResult(null);
    setStreamText("");

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, timeframe }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullText += parsed.content;
                setStreamText(fullText);
              }
            } catch {}
          }
        }
      }

      try {
        const cleaned = fullText.replace(/```json\n?|\n?```/g, "").trim();
        const prediction = JSON.parse(cleaned);
        setResult(prediction);
        setStreamText("");
      } catch {
        setResult({
          direction: "neutral",
          confidence: 50,
          reasoning: fullText,
        });
      }
    } catch {
      setStreamText("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price: number) {
    return price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  const directionColor = {
    bullish: "text-green-400",
    bearish: "text-red-400",
    neutral: "text-yellow-400",
  };

  const directionBg = {
    bullish: "bg-green-400/10 border-green-400/20",
    bearish: "bg-red-400/10 border-red-400/20",
    neutral: "bg-yellow-400/10 border-yellow-400/20",
  };

  const directionIcon = {
    bullish: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06l5.25-5.25a.75.75 0 0 1 1.06 0l3.048 3.047A20.902 20.902 0 0 1 14.6 7.243l-2.554.684a.75.75 0 0 1-.468-1.049Z" clipRule="evenodd" />
      </svg>
    ),
    bearish: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l.69-2.573a.75.75 0 1 1 1.45.388l-1.282 4.78a.75.75 0 0 1-.92.53l-4.78-1.281a.75.75 0 0 1 .388-1.45l3.025.811a19.407 19.407 0 0 0-3.286-6.19L7.53 12.22a.75.75 0 0 1-1.06 0L1.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    ),
    neutral: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className={compact ? "p-4" : "p-6"}>
      {/* Header with price */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-accent font-[var(--font-heading)] tracking-wider">
            ${SUPPORTED_TOKENS[token]?.symbol}
          </span>
          {currentPrice && (
            <span className="text-lg font-bold font-mono text-foreground">
              ${formatPrice(currentPrice)}
            </span>
          )}
          {change24h !== undefined && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              change24h >= 0 ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
            }`}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="rounded-lg bg-surface-light border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {Object.entries(SUPPORTED_TOKENS).map(([key, val]) => (
            <option key={key} value={key}>
              ${val.symbol}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-2 text-sm transition-colors ${
                timeframe === tf
                  ? "bg-accent text-background font-medium"
                  : "bg-surface-light text-muted hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-background transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              Predict
            </>
          )}
        </button>
      </div>

      {/* Loading stream */}
      {loading && streamText && (
        <div className="rounded-xl bg-background/50 border border-white/5 p-4 text-sm text-muted font-mono leading-relaxed">
          <span className="stream-cursor">{streamText}</span>
        </div>
      )}

      {loading && !streamText && (
        <div className="flex items-center gap-3 text-sm text-muted py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="italic">Kage is reading the shadows...</span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Direction + Confidence header */}
          <div className={`flex items-center justify-between rounded-xl border p-4 ${
            directionBg[result.direction as keyof typeof directionBg] || directionBg.neutral
          }`}>
            <div className="flex items-center gap-3">
              <div className={directionColor[result.direction as keyof typeof directionColor] || "text-yellow-400"}>
                {directionIcon[result.direction as keyof typeof directionIcon] || directionIcon.neutral}
              </div>
              <div>
                <div className={`text-lg font-bold uppercase tracking-wide ${
                  directionColor[result.direction as keyof typeof directionColor] || "text-yellow-400"
                }`}>
                  {result.direction}
                </div>
                <div className="text-xs text-muted">
                  {timeframe} Outlook
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent font-mono">{result.confidence}%</div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Confidence</div>
            </div>
          </div>

          {/* Price targets grid */}
          {(result.target_price || result.support || result.resistance) && (
            <div className="grid grid-cols-3 gap-3">
              {result.target_price && (
                <div className="rounded-lg bg-surface/60 border border-white/5 p-3 text-center">
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Target</div>
                  <div className={`text-base font-bold font-mono ${
                    directionColor[result.direction as keyof typeof directionColor] || "text-foreground"
                  }`}>
                    ${formatPrice(result.target_price)}
                  </div>
                  {currentPrice && (
                    <div className={`text-[10px] mt-0.5 ${
                      result.target_price > currentPrice ? "text-green-400" : "text-red-400"
                    }`}>
                      {result.target_price > currentPrice ? "+" : ""}
                      {(((result.target_price - currentPrice) / currentPrice) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              )}
              {result.support && (
                <div className="rounded-lg bg-surface/60 border border-white/5 p-3 text-center">
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Support</div>
                  <div className="text-base font-bold font-mono text-red-400">
                    ${formatPrice(result.support)}
                  </div>
                </div>
              )}
              {result.resistance && (
                <div className="rounded-lg bg-surface/60 border border-white/5 p-3 text-center">
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Resistance</div>
                  <div className="text-base font-bold font-mono text-green-400">
                    ${formatPrice(result.resistance)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confidence bar */}
          <div className="w-full bg-surface-light rounded-full h-1">
            <div
              className="confidence-bar h-1 transition-all duration-1000"
              style={{ width: `${result.confidence}%` }}
            />
          </div>

          {/* Reasoning */}
          <p className="text-sm text-muted leading-relaxed">{result.reasoning}</p>

          <p className="text-[10px] text-muted/40 italic">
            Not financial advice. AI predictions are for entertainment only. DYOR.
          </p>
        </div>
      )}
    </div>
  );
}
