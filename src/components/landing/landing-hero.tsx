"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, ArrowRight, ChevronDown, LogIn } from "lucide-react";

/**
 * Hero transparent posé sur le décor 3D fixe (CinematicBackground). Le contenu
 * s'estompe et remonte légèrement au défilement (parallaxe), tandis qu'une
 * couche de halo au premier plan renforce l'illusion de profondeur.
 * Désactivé sous prefers-reduced-motion.
 */
export function LandingHero() {
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
        contentRef.current.style.opacity = String(Math.max(0, 1 - y / 520));
      }
      if (glowRef.current) {
        // couche de premier plan : parallaxe plus rapide → profondeur
        glowRef.current.style.transform = `translate3d(0, ${y * 0.5}px, 0)`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-white lg:items-start lg:px-16 lg:text-left xl:px-24">
      {/* Couche de halo au premier plan (profondeur) */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[46rem] max-w-[90vw] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent)",
        }}
      />

      <div
        ref={contentRef}
        className="relative z-10 max-w-3xl will-change-transform lg:max-w-xl"
      >
        <div className="rise inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/85 ring-1 ring-white/15 backdrop-blur">
          <HeartPulse className="h-4 w-4" />
          Université Cheikh Anta Diop de Dakar
        </div>

        <h1
          className="rise mt-6 text-balance text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl [text-shadow:0_2px_30px_rgba(4,33,31,0.55)]"
          style={{ animationDelay: "80ms" }}
        >
          Le suivi médical de la communauté universitaire,{" "}
          <span className="text-gradient bg-clip-text">réinventé.</span>
        </h1>

        <p
          className="rise mx-auto mt-6 max-w-xl text-pretty text-lg text-white/75 [text-shadow:0_1px_16px_rgba(4,33,31,0.6)]"
          style={{ animationDelay: "160ms" }}
        >
          Dossiers, rendez-vous, consultations, orientations et pharmacie — une
          plateforme unique, sécurisée et élégante pour le service médical de
          l&apos;UCAD.
        </p>

        <div
          className="rise mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          style={{ animationDelay: "240ms" }}
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-[#123b35] hover:bg-white/90"
          >
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Accéder à la plateforme
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="text-white ring-1 ring-white/25 hover:bg-white/10"
          >
            <Link href="#modules">
              Découvrir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Link
        href="#modules"
        aria-label="Faire défiler vers le contenu"
        className="float absolute bottom-8 text-white/50 transition-colors hover:text-white/80"
      >
        <ChevronDown className="h-7 w-7" />
      </Link>
    </section>
  );
}
