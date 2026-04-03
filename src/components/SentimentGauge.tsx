"use client";

interface Props {
  value: number; // 0-100, 0=extreme fear, 100=extreme greed
}

export default function SentimentGauge({ value }: Props) {
  const getLabel = (v: number) => {
    if (v <= 20) return { text: "Extreme Fear", color: "text-red-400" };
    if (v <= 40) return { text: "Fear", color: "text-orange-400" };
    if (v <= 60) return { text: "Neutral", color: "text-yellow-400" };
    if (v <= 80) return { text: "Greed", color: "text-green-400" };
    return { text: "Extreme Greed", color: "text-emerald-400" };
  };

  const label = getLabel(value);
  const rotation = (value / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="p-6 text-center">
      <h3 className="text-sm font-semibold text-muted mb-4">Market Sentiment</h3>

      <div className="relative mx-auto w-40 h-20 overflow-hidden">
        {/* Gauge background arc */}
        <div className="absolute inset-0 rounded-t-full"
          style={{
            background: "conic-gradient(from 180deg at 50% 100%, #ef4444 0deg, #f97316 45deg, #eab308 90deg, #22c55e 135deg, #10b981 180deg)",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />
        <div className="absolute inset-[6px] rounded-t-full bg-surface/90" />

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 h-16 w-0.5 origin-bottom bg-accent transition-transform duration-1000"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent" />
      </div>

      <div className="mt-3">
        <span className={`text-2xl font-bold ${label.color}`}>{value}</span>
        <p className={`text-sm font-medium ${label.color}`}>{label.text}</p>
      </div>
    </div>
  );
}
