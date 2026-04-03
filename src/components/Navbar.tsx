"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/predict", label: "Predict" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(201,168,92,0.08)] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🥷</span>
          <span className="font-heading text-lg font-bold tracking-wider text-foreground">
            ASTER<span className="text-accent">PREDICT</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                pathname === link.href
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-foreground hover:bg-surface/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://x.com/Asterpredict"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface/50 transition-colors"
          >
            𝕏
          </a>
        </div>
      </div>
    </nav>
  );
}
