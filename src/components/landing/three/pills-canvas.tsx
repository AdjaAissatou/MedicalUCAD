"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "@/components/landing/use-in-view";

const PillsScene = dynamic(() => import("./pills-scene"), {
  ssr: false,
  loading: () => null,
});

/** Couche 3D des gélules — en pause tant qu'elle est hors-écran. */
export function PillsCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden>
      <PillsScene active={active} />
    </div>
  );
}
