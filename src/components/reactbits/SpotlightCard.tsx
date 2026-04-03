"use client";

import { useRef, useState, ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(201, 168, 92, 0.12)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setIsHovered(true); setOpacity(1); }}
      onMouseLeave={() => { setIsHovered(false); setOpacity(0); }}
      className={`relative overflow-hidden rounded-2xl border border-[rgba(201,168,92,0.08)] bg-surface/50 backdrop-blur-sm transition-all duration-300 ${
        isHovered ? "border-[rgba(201,168,92,0.2)] scale-[1.02]" : ""
      } ${className}`}
    >
      {/* Spotlight gradient */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {/* Subtle border glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: opacity * 0.5,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(201, 168, 92, 0.08), transparent 40%)`,
          mask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          WebkitMask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          padding: "1px",
          maskComposite: "xor",
          WebkitMaskComposite: "xor" as never,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
