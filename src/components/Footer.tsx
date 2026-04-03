export default function Footer() {
  return (
    <footer className="border-t border-[rgba(201,168,92,0.06)] bg-background py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-lg">🥷</span>
            <span className="font-heading text-sm font-bold tracking-wider text-muted">
              ASTER<span className="text-accent">PREDICT</span>
            </span>
          </div>
          <p className="text-xs text-muted/60 text-center">
            Not financial advice. AI predictions are for informational purposes only. Always DYOR.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://x.com/Asterpredict" target="_blank" rel="noopener noreferrer"
              className="text-sm text-muted hover:text-accent transition-colors">Twitter</a>
            <a href="https://www.asterdex.com/en/trade/pro/futures/ASTERUSDT" target="_blank" rel="noopener noreferrer"
              className="text-sm text-muted hover:text-accent transition-colors">Aster DEX</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
