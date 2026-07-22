"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/components/landing/three/scroll-state";

/**
 * Défilement cinématique :
 * - GSAP ScrollTrigger mappe le défilement du hero (≈1,4 écran) sur 0→1, ce qui
 *   pilote le zoom/échelle/rotation de la scène 3D.
 * - Lenis apporte l'inertie ; il est piloté par le ticker GSAP et synchronisé
 *   avec ScrollTrigger (indispensable pour un épinglage fluide).
 * Désactivé sous prefers-reduced-motion (scène figée, défilement natif).
 */
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const st = ScrollTrigger.create({
      start: 0,
      end: () => window.innerHeight * 1.4,
      onUpdate: (self) => {
        scrollState.target = self.progress;
      },
    });

    let lenis: Lenis | undefined;
    let ticker: ((time: number) => void) | undefined;
    let onClick: ((e: MouseEvent) => void) | undefined;

    if (!reduce) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      ticker = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest(
          'a[href^="#"]'
        ) as HTMLAnchorElement | null;
        const id = a?.getAttribute("href");
        if (id && id.length > 1) {
          const el = document.querySelector(id);
          if (el) {
            e.preventDefault();
            lenis!.scrollTo(el as HTMLElement, { offset: -80 });
          }
        }
      };
      document.addEventListener("click", onClick);
    }

    return () => {
      st.kill();
      if (onClick) document.removeEventListener("click", onClick);
      if (ticker) gsap.ticker.remove(ticker);
      if (lenis) lenis.destroy();
    };
  }, []);

  return null;
}
