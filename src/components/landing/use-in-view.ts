"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * `true` tant que l'élément (ou une marge autour) est dans le viewport.
 * Sert à mettre en pause les scènes 3D hors-écran (frameloop). Démarre à
 * `true` puis l'observateur corrige — la mise à jour ne se fait que dans le
 * callback (jamais directement dans l'effet).
 */
export function useInView(
  ref: RefObject<Element | null>,
  rootMargin = "250px"
) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
