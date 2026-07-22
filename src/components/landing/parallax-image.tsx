"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Image avec effet de parallaxe au défilement : l'image (légèrement agrandie)
 * se déplace plus lentement que son cadre, créant une illusion de profondeur.
 * Désactivé sous prefers-reduced-motion.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const el = frame.current;
      if (!el || !inner.current) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 (sous le viewport) → 1 (au-dessus), 0 au centre
      const prog = (rect.top + rect.height / 2 - vh / 2) / vh;
      inner.current.style.transform = `translate3d(0, ${prog * -36}px, 0) scale(1.16)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={frame}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-secondary",
        className
      )}
    >
      <div
        ref={inner}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "scale(1.16)" }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
      {/* Voile dégradé pour lier à la charte */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/25 via-transparent to-accent/10 mix-blend-multiply" />
    </div>
  );
}
