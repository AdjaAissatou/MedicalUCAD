"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";
import {
  FolderHeart,
  CalendarCheck,
  Stethoscope,
  Share2,
  Pill,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Module = { icon: LucideIcon; titre: string; desc: string; num: string };

const MODULES: Module[] = [
  { icon: FolderHeart, titre: "Dossiers médicaux", desc: "Antécédents, allergies, groupe sanguin et historiques, centralisés et sécurisés.", num: "01" },
  { icon: CalendarCheck, titre: "Rendez-vous", desc: "Planification, filtres et suivi des statuts, regroupés par jour.", num: "02" },
  { icon: Stethoscope, titre: "Consultations", desc: "Historique, constantes vitales et diagnostics.", num: "03" },
  { icon: Share2, titre: "Orientations", desc: "Redirections vers spécialistes et structures externes.", num: "04" },
  { icon: Pill, titre: "Pharmacie", desc: "Stock, seuils d'alerte, ruptures et péremptions.", num: "05" },
  { icon: LayoutDashboard, titre: "Tableau de bord", desc: "Statistiques, rendez-vous du jour et alertes en un coup d'œil.", num: "06" },
];

/**
 * Section « modules » épinglée : sur grand écran, la section reste fixe pendant
 * que les 6 cartes défilent horizontalement (GSAP ScrollTrigger pin + scrub).
 * Sur mobile / reduced-motion, repli en grille verticale classique.
 */
export function ModulesPinned() {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const s = section.current;
    const t = track.current;
    if (!s || !t) return;

    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const distance = () =>
          Math.max(0, t.scrollWidth - window.innerWidth + 96);
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: s,
            start: "top top",
            end: () => "+=" + distance(),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(t, { x: 0 });
        };
      }
    );
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Badge variant="primary">La plateforme</Badge>
        <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Tout le parcours de soin, réuni
        </h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Six modules du premier rendez-vous à la délivrance des médicaments.
          <span className="hidden lg:inline"> Faites défiler pour les parcourir.</span>
        </p>
      </div>

      <div className="mt-12 overflow-hidden">
        <div
          ref={track}
          className="flex flex-wrap justify-center gap-6 px-6 lg:w-max lg:flex-nowrap lg:px-16 lg:will-change-transform"
        >
          {MODULES.map((m) => (
            <article
              key={m.titre}
              className="group flex h-64 w-full flex-col justify-between rounded-3xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-lg sm:w-80 lg:w-[22rem] lg:shrink-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <m.icon className="h-6 w-6 stroke-[1.75]" />
                </div>
                <span className="text-3xl font-bold text-border">{m.num}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {m.titre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
