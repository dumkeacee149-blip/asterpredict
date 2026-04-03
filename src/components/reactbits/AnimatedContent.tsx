"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface AnimatedContentProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export default function AnimatedContent({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 40,
  className = "",
}: AnimatedContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const dirMap = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        x: dirMap[direction].x,
        y: dirMap[direction].y,
        filter: "blur(8px)",
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
          : {}
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
