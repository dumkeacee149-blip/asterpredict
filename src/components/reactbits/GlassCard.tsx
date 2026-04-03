"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: number;
}

export default function GlassCard({
  children,
  className = "",
  blur = 16,
}: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] ${className}`}
      style={{
        backdropFilter: `blur(${blur}px) saturate(1.5)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.5)`,
      }}
    >
      {children}
    </div>
  );
}
