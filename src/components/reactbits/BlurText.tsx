'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  stepDuration?: number;
  onAnimationComplete?: () => void;
}

export default function BlurText({
  text = '',
  delay = 150,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  stepDuration = 0.35,
  onAnimationComplete,
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const from = useMemo(
    () => direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, y: -40 }
      : { filter: 'blur(10px)', opacity: 0, y: 40 },
    [direction]
  );

  return (
    <p ref={ref} className={`${className} flex flex-wrap`}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={from}
          animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : from}
          transition={{
            duration: stepDuration * 2,
            delay: (index * delay) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </p>
  );
}
