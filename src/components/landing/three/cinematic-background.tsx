"use client";

import dynamic from "next/dynamic";

// Scène WebGL strictement côté client.
const DnaScene = dynamic(() => import("./dna-scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Décor 3D fixe, plein écran, derrière tout le contenu (-z-10). Il ne s'affiche
 * que là où une section est transparente (le hero) : les sections opaques qui
 * défilent par-dessus donnent la transition « scène continue ». Le fond sombre
 * sert de repli si WebGL échoue. Couche de vignette pour la profondeur.
 */
export function CinematicBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#04211f]" aria-hidden>
      <DnaScene />
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
