"use client";

import { useEffect, useRef, useState } from "react";

/** Compteur animé qui s'incrémente jusqu'à `value` au montage. */
export function AnimatedNumber({
  value,
  duration = 900,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    // Respecte la préférence d'accessibilité : durée nulle = pas d'animation.
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const duree = reduce ? 0 : duration;

    const start = performance.now();
    const tick = (now: number) => {
      const t = duree > 0 ? Math.min((now - start) / duree, 1) : 1;
      // easeOutExpo
      const eased = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
