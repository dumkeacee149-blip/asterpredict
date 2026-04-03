"use client";

import { useEffect, useRef } from "react";

interface AuroraProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  blur?: number;
}

export default function Aurora({
  color1 = "rgba(0, 212, 170, 0.3)",
  color2 = "rgba(124, 92, 191, 0.3)",
  color3 = "rgba(0, 100, 200, 0.2)",
  speed = 0.5,
  blur = 100,
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.3, y: 0.3, radius: 0.4, color: color1, speedX: 0.7, speedY: 0.5 },
      { x: 0.7, y: 0.6, radius: 0.35, color: color2, speedX: -0.5, speedY: 0.8 },
      { x: 0.5, y: 0.8, radius: 0.3, color: color3, speedX: 0.6, speedY: -0.6 },
    ];

    const animate = () => {
      time += 0.003 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const blob of blobs) {
        const x = canvas.width * (blob.x + 0.15 * Math.sin(time * blob.speedX));
        const y = canvas.height * (blob.y + 0.15 * Math.cos(time * blob.speedY));
        const r = canvas.width * blob.radius;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [color1, color2, color3, speed, blur]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ filter: `blur(${blur}px)` }}
    />
  );
}
