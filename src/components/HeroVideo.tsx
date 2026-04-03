"use client";

import { useEffect, useRef } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Mobile browsers block autoplay — retry on user interaction or after mount
    const tryPlay = () => {
      video.play().catch(() => {
        // If autoplay blocked, try again on first user interaction
        const handler = () => {
          video.play().catch(() => {});
          document.removeEventListener("touchstart", handler);
          document.removeEventListener("click", handler);
        };
        document.addEventListener("touchstart", handler, { once: true });
        document.addEventListener("click", handler, { once: true });
      });
    };

    tryPlay();
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover sm:object-center max-sm:object-contain max-sm:object-[center_20%]"
      >
        <source src="/hero-bg.mov" type="video/mp4" />
      </video>
      {/* Dark bg to fill letterbox gaps on mobile */}
      <div className="absolute inset-0 bg-[#08080c] -z-10" />
    </>
  );
}
