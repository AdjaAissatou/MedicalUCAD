"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * Bandeau « battement cardiaque » : la ligne d'ECG se dessine au fil du
 * défilement (stroke-dashoffset piloté par la position dans le viewport).
 * Respecte prefers-reduced-motion (ligne affichée complète).
 */
export function EcgInterlude() {
  const section = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);

  // Tracé ECG répété (5 battements) sur une viewBox 1200×200, ligne de base y=100.
  const d = useMemo(() => {
    const beats = 5;
    const w = 240;
    let s = "M0,100 ";
    for (let i = 0; i < beats; i++) {
      const b = i * w;
      s +=
        `L${b + 80},100 L${b + 100},88 L${b + 120},100 ` +
        `L${b + 150},112 L${b + 160},28 L${b + 172},160 L${b + 184},100 ` +
        `L${b + 208},82 L${b + 232},100 `;
    }
    return s + "L1200,100";
  }, []);

  useEffect(() => {
    const p = path.current;
    const el = section.current;
    if (!p || !el) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      p.style.strokeDashoffset = "0";
      return;
    }
    p.style.strokeDashoffset = `${len}`;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(Math.max((vh - rect.top) / (vh * 0.85), 0), 1);
      p.style.strokeDashoffset = `${len * (1 - prog)}`;
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
      className="relative overflow-hidden bg-[#123b35] py-24 text-white"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#7fffd4]">
          En temps réel
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Chaque battement compte
        </h2>
        <p className="mt-4 text-white/70">
          Constantes, alertes, disponibilités — l&apos;information circule au
          rythme de la vie universitaire, sans temps mort.
        </p>
      </div>

      <div className="relative mt-10">
        <svg
          viewBox="0 0 1200 200"
          className="h-28 w-full sm:h-40"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="ecg-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#7fffd4" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          <path
            ref={path}
            d={d}
            fill="none"
            stroke="url(#ecg-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(127,255,212,0.55))" }}
          />
        </svg>
      </div>
    </section>
  );
}
