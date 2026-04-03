"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export default function Counter({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 2,
}: CounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (latest) => {
    if (value >= 1000) return `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
    if (value % 1 !== 0) return `${prefix}${latest.toFixed(1)}${suffix}`;
    return `${prefix}${Math.round(latest)}${suffix}`;
  });

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, spring, value]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
