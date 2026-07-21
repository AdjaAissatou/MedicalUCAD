"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "up" | "left" | "right" | "scale" | "fade";

/**
 * Révèle son contenu quand il entre dans le viewport (IntersectionObserver) —
 * un vrai effet « au scroll », distinct de `.reveal` qui ne joue qu'au montage.
 *
 * - `variant` : direction de l'entrée.
 * - `delay` : décalage (ms) pour l'effet de cascade sur des éléments voisins.
 * - `once` : ne joue qu'une fois (par défaut) ; sinon rejoue à chaque passage.
 * - Respecte `prefers-reduced-motion` (contenu visible immédiatement, via CSS).
 *
 * La classe `.is-visible` est basculée directement sur le nœud (pas de state
 * React) : rien à re-rendre, et le contenu reste visible si l'API est absente.
 */
export function ScrollReveal({
  children,
  variant = "up",
  delay = 0,
  once = true,
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  once?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          if (once) obs.disconnect();
        } else if (!once) {
          el.classList.remove("is-visible");
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const variantClass =
    variant === "left"
      ? "sr-left"
      : variant === "right"
        ? "sr-right"
        : variant === "scale"
          ? "sr-scale"
          : variant === "fade"
            ? "sr-fade"
            : "";

  return (
    <div
      ref={ref}
      className={cn("sr", variantClass, className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
