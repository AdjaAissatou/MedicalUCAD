"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { crossState } from "@/components/landing/three/cross-state";
import { useInView } from "@/components/landing/use-in-view";

const CellsCrossScene = dynamic(
  () => import("@/components/landing/three/cells-cross-scene"),
  { ssr: false, loading: () => null }
);

/**
 * Interlude « De la cellule au soin » : section haute (150vh) dont la scène 3D
 * est collée (sticky) plein écran ; en défilant, les cellules dispersées se
 * rassemblent en croix médicale (progrès calculé sur la course sticky).
 */
export function CellsCross() {
  const section = useRef<HTMLElement>(null);
  const active = useInView(section);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      crossState.progress = 1;
      return;
    }
    let raf = 0;
    const update = () => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      crossState.progress = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
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
    <section
      ref={section}
      className="relative min-h-[150vh] bg-[#04211f] text-white"
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-start overflow-hidden pt-24">
        <div className="absolute inset-0" aria-hidden>
          <CellsCrossScene active={active} />
        </div>
        <div className="pointer-events-none relative z-10 max-w-2xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#7fffd4]">
            De la cellule au soin
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl [text-shadow:0_2px_30px_rgba(4,33,31,0.7)]">
            La santé prend forme
          </h2>
          <p className="mt-4 text-white/70 [text-shadow:0_1px_16px_rgba(4,33,31,0.8)]">
            Des milliers d&apos;informations éparses — dossiers, constantes,
            rendez-vous — réunies en un seul soin cohérent. Continuez à faire
            défiler.
          </p>
        </div>
      </div>
    </section>
  );
}
