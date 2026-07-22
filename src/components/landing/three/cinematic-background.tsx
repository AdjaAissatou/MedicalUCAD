"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Scène WebGL strictement côté client.
const DnaScene = dynamic(() => import("./dna-scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Décor 3D fixe, plein écran, derrière tout le contenu (-z-10). Il ne s'affiche
 * que là où une section est transparente (le hero). Optimisation : la scène est
 * mise en pause (frameloop) dès qu'on a défilé au-delà du hero — inutile de
 * calculer une scène masquée par le contenu opaque.
 */
export function CinematicBackground() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      // actif tant que le hero (≈1,8 écran) est à l'écran
      setActive(window.scrollY < window.innerHeight * 1.8);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-[#04211f]" aria-hidden>
      <DnaScene active={active} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 90% at 50% 32%, transparent 42%, rgba(4,33,31,0.85) 100%)",
        }}
      />
    </div>
  );
}
