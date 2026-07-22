"use client";

import dynamic from "next/dynamic";

// La scène WebGL est strictement côté client (three.js n'a pas de SSR).
const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => null,
});

/** Couche 3D du hero — remplit son conteneur, non interactive (décor). */
export function HeroCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <HeroScene />
    </div>
  );
}
