import PriceTicker from "@/components/PriceTicker";
import PredictionCard from "@/components/PredictionCard";
import Particles from "@/components/reactbits/Particles";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import Counter from "@/components/reactbits/Counter";
import InkDivider from "@/components/InkDivider";
import HeroVideo from "@/components/HeroVideo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* ───────── Hero Section ───────── */}
      <section className="relative min-h-[92vh] flex items-start sm:items-center">
        {/* Video background */}
        <div className="absolute inset-0 overflow-hidden -z-0">
          <HeroVideo />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-background/50" />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,168,92,0.08)_0%,transparent_50%)]" />
        </div>
        {/* Decorative kanji */}
        <div className="absolute top-1/4 right-[10%] text-[200px] font-bold text-foreground/[0.03] select-none pointer-events-none animate-kanji leading-none">
          予
        </div>
        <div className="absolute bottom-1/4 left-[8%] text-[160px] font-bold text-foreground/[0.02] select-none pointer-events-none animate-kanji leading-none" style={{ animationDelay: '0.5s' }}>
          測
        </div>
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-[1]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div>
            <div className="space-y-8 max-w-xl">
              <AnimatedContent delay={0}>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5 text-xs font-medium text-accent tracking-widest uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                  Live AI Oracle
                </div>
              </AnimatedContent>

              <AnimatedContent delay={0.1}>
                <h1 className="font-display font-semibold text-7xl sm:text-8xl lg:text-[10rem] tracking-wider leading-[0.85] uppercase">
                  <span className="text-hero-gold">Predict</span>
                  <br />
                  <span className="text-hero-light">the Next</span>
                  <br />
                  <span className="text-hero-light">Move</span>
                </h1>
              </AnimatedContent>

              <AnimatedContent delay={0.2}>
                <p className="text-lg text-muted leading-relaxed max-w-lg">
                  AI-powered market intelligence for{" "}
                  <a href="https://www.asterdex.com/en" target="_blank" rel="noopener noreferrer" className="text-accent-teal hover:underline underline-offset-4">
                    Aster DEX
                  </a>.
                  Kage reads on-chain signals, sentiment, and price action
                  — so you trade with foresight, not hope.
                </p>
              </AnimatedContent>

              <AnimatedContent delay={0.3}>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    href="/predict"
                    className="group relative inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-bold text-background tracking-wide overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(201,168,92,0.3)]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <span className="relative">🥷 Enter the Dojo</span>
                  </Link>
                  <a
                    href="https://www.asterdex.com/en/trade/pro/futures/ASTERUSDT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-accent/15 px-8 py-4 text-sm font-medium text-foreground transition-all hover:bg-accent/[0.04] hover:border-accent/30"
                  >
                    Trade on Aster DEX
                    <span className="text-accent">→</span>
                  </a>
                </div>
              </AnimatedContent>

              <AnimatedContent delay={0.35}>
                <div className="ink-card p-0 rounded-2xl max-w-lg">
                  <PredictionCard compact />
                </div>
              </AnimatedContent>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Price Ticker ───────── */}
      <PriceTicker />

      <InkDivider />

      {/* ───────── Stats Section ───────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: 100000, suffix: "+", label: "TPS on Aster Chain", prefix: "" },
                { value: 1001, suffix: "x", label: "Max Leverage", prefix: "" },
                { value: 4, suffix: "", label: "Chains Supported", prefix: "" },
                { value: 42, suffix: "", label: "CMC Ranking", prefix: "#" },
              ].map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="text-4xl sm:text-5xl font-bold text-gold font-display tracking-wider">
                    <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-muted tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedContent>
        </div>
      </section>

      <InkDivider />

      {/* ───────── Features Section ───────── */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <Particles count={30} color="201, 168, 92" connectDistance={80} maxSpeed={0.2} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <AnimatedContent>
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-gold">
                The Arsenal
              </h2>
              <p className="text-muted text-lg max-w-md mx-auto">
                Three weapons. One unfair advantage.
              </p>
            </div>
          </AnimatedContent>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                ),
                title: "AI Predictions",
                desc: "Advanced AI analyzes real-time market data — price, volume, on-chain flows — to predict directional moves with transparent reasoning.",
                accentColor: "rgba(201, 168, 92, 0.15)",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-[#7c5cbf]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                ),
                title: "Sentiment Engine",
                desc: "Fear & greed gauge powered by multi-dimensional signal analysis. Know the market mood before you enter.",
                accentColor: "rgba(124, 92, 191, 0.15)",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-accent-teal">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                ),
                title: "Ask the Shadow",
                desc: "Chat with Kage about any market question. Real-time AI insights on Aster DEX, DeFi perps, and macro trends.",
                accentColor: "rgba(0, 212, 170, 0.15)",
              },
            ].map((feature, i) => (
              <AnimatedContent key={feature.title} delay={i * 0.1}>
                <SpotlightCard className="h-full">
                  <div className="p-8 space-y-5">
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-xl"
                      style={{ background: feature.accentColor }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-heading tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Why Aster DEX ───────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <AnimatedContent>
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight">
                Why <span className="text-gold">Aster DEX</span>?
              </h2>
              <p className="text-muted text-lg">The ninja DEX is just getting started</p>
            </div>
          </AnimatedContent>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: "🔒", text: "Privacy-first hidden orders" },
              { icon: "📈", text: "Stock perpetuals 24/7" },
              { icon: "💰", text: "Yield-bearing collateral" },
              { icon: "🏦", text: "Backed by YZi Labs" },
              { icon: "🌐", text: "Multi-chain access" },
            ].map((item, i) => (
              <AnimatedContent key={item.text} delay={i * 0.05}>
                <div className="ink-card p-5 text-center rounded-xl hover:border-accent/20 transition-colors group cursor-default">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <p className="text-sm text-muted group-hover:text-foreground transition-colors">
                    {item.text}
                  </p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      <InkDivider />

      {/* ───────── CTA Section ───────── */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,92,0.06)_0%,transparent_60%)]" />
        <div className="absolute top-1/3 left-[15%] text-[120px] font-bold text-foreground/[0.015] select-none pointer-events-none leading-none">
          忍
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <AnimatedContent>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to
              <br />
              <span className="text-gold">
                predict the future?
              </span>
            </h2>
          </AnimatedContent>
          <AnimatedContent delay={0.1}>
            <p className="text-lg text-muted mb-10 max-w-md mx-auto">
              AI-powered predictions for $ASTER and top crypto assets. Free. No signup.
            </p>
          </AnimatedContent>
          <AnimatedContent delay={0.2}>
            <Link
              href="/predict"
              className="group relative inline-flex items-center gap-3 rounded-xl bg-accent px-10 py-5 text-base font-bold text-background tracking-wide overflow-hidden transition-all hover:shadow-[0_0_50px_rgba(201,168,92,0.4)] hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <span className="relative">🥷 Launch Dashboard</span>
            </Link>
          </AnimatedContent>
        </div>
      </section>
    </div>
  );
}
