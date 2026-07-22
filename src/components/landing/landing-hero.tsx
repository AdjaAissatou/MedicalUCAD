"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroCanvas } from "@/components/landing/three/hero-canvas";
import { HeartPulse, ArrowRight, ChevronDown, LogIn } from "lucide-react";

/**
 * Hero plein écran avec effet de parallaxe : l'arrière-plan (halos + grille)
 * défile plus lentement que le contenu, créant une sensation de profondeur.
 * Le contenu s'estompe légèrement à mesure qu'on quitte le hero.
 * Désactivé sous `prefers-reduced-motion`.
 */
export function LandingHero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
        contentRef.current.style.opacity = String(
          Math.max(0, 1 - y / 600)
        );
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
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#062e2c] px-6 text-center text-white">
      {/* Arrière-plan parallaxe */}
      <div ref={bgRef} className="absolute inset-0 -z-10 will-change-transform">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        {/* Dégradé de fondu vers le bas pour lier au reste de la page */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#062e2c]" />
      </div>

      {/* Scène 3D immersive (WebGL) — décor, non interactif */}
      <HeroCanvas />

      <div ref={contentRef} className="relative z-10 max-w-3xl will-change-transform">
        <div className="rise inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/85 ring-1 ring-white/15 backdrop-blur">
          <HeartPulse className="h-4 w-4" />
          Université Cheikh Anta Diop de Dakar
        </div>

        <h1
          className="rise mt-6 text-balance text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Le suivi médical de la communauté universitaire,{" "}
          <span className="text-gradient bg-clip-text">réinventé.</span>
        </h1>

        <p
          className="rise mx-auto mt-6 max-w-xl text-pretty text-lg text-white/70"
          style={{ animationDelay: "160ms" }}
        >
          Dossiers, rendez-vous, consultations, orientations et pharmacie — une
          plateforme unique, sécurisée et élégante pour le service médical de
          l&apos;UCAD.
        </p>

        <div
          className="rise mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-[#062e2c] hover:bg-white/90"
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

      {/* Indice de défilement */}
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
