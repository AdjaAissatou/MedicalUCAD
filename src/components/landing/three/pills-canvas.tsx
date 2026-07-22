"use client";

import dynamic from "next/dynamic";

const PillsScene = dynamic(() => import("./pills-scene"), {
  ssr: false,
  loading: () => null,
});

/** Couche 3D des gélules (remplit son conteneur, non interactive). */
export function PillsCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <PillsScene />
    </div>
  );
}
