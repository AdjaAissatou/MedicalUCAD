"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Défilement inertiel (Lenis) — la base du « feel » cinématique.
 * Désactivé sous prefers-reduced-motion. Ne rend rien : attache le lissage
 * au défilement de la page et gère les ancres (#section).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Défilement fluide vers les ancres internes (#modules…).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      const id = a?.getAttribute("href");
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, { offset: -80 });
        }
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
