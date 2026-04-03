'use client';
import React, { useRef, useEffect } from 'react';

interface NoiseProps {
  patternAlpha?: number;
  patternRefreshInterval?: number;
}

export default function Noise({ patternAlpha = 12, patternRefreshInterval = 3 }: NoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId: number;
    const size = 512;

    const resize = () => {
      canvas.width = size;
      canvas.height = size;
    };

    const drawGrain = () => {
      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) drawGrain();
      frame++;
      animationId = requestAnimationFrame(loop);
    };

    resize();
    loop();
    return () => cancelAnimationFrame(animationId);
  }, [patternAlpha, patternRefreshInterval]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-screen w-screen opacity-40"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
