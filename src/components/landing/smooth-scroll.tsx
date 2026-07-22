"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/components/landing/three/scroll-state";

/**
 * Défilement cinématique :
 * - GSAP ScrollTrigger mappe le défilement du hero (≈1,4 écran) sur 0→1, ce qui
 *   pilote le zoom/échelle/rotation de la scène 3D (transition de scène continue).
 * - Lenis apporte l'inertie et se synchronise avec ScrollTrigger.
 * Désactivé sous prefers-reduced-motion (scène figée, défilement natif).
 */
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Progrès de scène : 0 en haut → 1 après ~1,4 écran de défilement.
    const st = ScrollTrigger.create({
      start: 0,
      end: () => window.innerHeight * 1.4,
      onUpdate: (self) => {
        scrollState.target = self.progress;
      },
    });

    let lenis: Lenis | undefined;
    let raf = 0;
    let onClick: ((e: MouseEvent) => void) | undefined;

    if (!reduce) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const loop = (time: number) => {
        lenis!.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      // Défilement fluide vers les ancres internes.
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
      if (lenis) {
        cancelAnimationFrame(raf);
        lenis.destroy();
      }
    };
  }, []);

  return null;
}
