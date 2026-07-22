import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { LandingHero } from "@/components/landing/landing-hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { CinematicBackground } from "@/components/landing/three/cinematic-background";
import {
  HeartPulse,
  ShieldCheck,
  Zap,
  Activity,
  Accessibility,
  ArrowRight,
  LogIn,
} from "lucide-react";

const POURQUOI = [
  {
    icon: ShieldCheck,
    titre: "Sécurisé & confidentiel",
    desc: "Authentification par session signée, accès par rôle et données protégées — la confidentialité médicale au cœur du système.",
  },
  {
    icon: Zap,
    titre: "Rapide & fluide",
    desc: "Server Actions, rendu instantané et interactions soignées : chaque geste est immédiat, sans rechargement.",
  },
  {
    icon: Activity,
    titre: "Une vue à 360°",
    desc: "Du dossier patient à la pharmacie, tous les modules sont reliés — l'information circule sans ressaisie.",
  },
  {
    icon: Accessibility,
    titre: "Accessible à tous",
    desc: "Conçu selon WCAG : focus visibles, contrastes vérifiés, lecteurs d'écran et respect de « reduced-motion ».",
  },
];

const STATS = [
  { valeur: "6", label: "modules intégrés" },
  { valeur: "WCAG", label: "accessibilité visée" },
  { valeur: "100%", label: "responsive" },
  { valeur: "0", label: "ressaisie de données" },
];

export default async function Home() {
  const user = await getSessionUser();
  if (user) {
    redirect(user.role === "ETUDIANT" ? "/espace-etudiant" : "/tableau-de-bord");
  }

  return (
    <div className="relative">
      <SmoothScroll />
      <CinematicBackground />
      <ScrollProgress />

      {/* En-tête flottant */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 text-white mix-blend-difference">
            <HeartPulse className="h-6 w-6" />
            <span className="text-base font-semibold">UCAD Santé</span>
          </div>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/20"
            )}
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Link>
        </div>
      </header>

      <LandingHero />

      {/* Contenu opaque : couvre le décor 3D fixe et crée la transition
          « scène continue » quand il défile par-dessus le hero. */}
      <div className="relative bg-background">
      {/* Modules — section bento (composant 21st adapté) */}
      <FeaturesBento />

      {/* Bande de statistiques */}
      <section className="relative overflow-hidden bg-[#062e2c] py-20 text-white">
        <div className="aurora opacity-40" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <ScrollReveal
              key={s.label}
              variant="scale"
              delay={i * 90}
              className="text-center"
            >
              <p className="text-gradient bg-clip-text text-4xl font-bold sm:text-5xl">
                {s.valeur}
              </p>
              <p className="mt-2 text-sm text-white/70">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Pourquoi */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <ScrollReveal
            variant="left"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Pourquoi UCAD Santé ?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pensé pour le soin,
              <br />
              construit pour durer
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Un outil médical n&apos;est utile que s&apos;il est fiable, rapide
              et respectueux des personnes. Voici les principes qui ont guidé
              chaque décision.
            </p>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "accent" }),
                "mt-8"
              )}
            >
              Commencer maintenant
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {POURQUOI.map((p, i) => (
              <ScrollReveal key={p.titre} variant="right" delay={(i % 2) * 100}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {p.titre}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action final */}
      <section className="px-6 pb-24">
        <ScrollReveal variant="scale" className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#062e2c] px-8 py-16 text-center text-white shadow-xl">
            <div className="aurora opacity-50" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Prêt à prendre soin de votre communauté ?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70">
                Connectez-vous à l&apos;espace de travail du service médical de
                l&apos;UCAD et retrouvez tous vos outils au même endroit.
              </p>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 bg-white text-[#062e2c] hover:bg-white/90"
                )}
              >
                <LogIn className="h-4 w-4" />
                Accéder à la plateforme
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 text-foreground">
            <HeartPulse className="h-5 w-5 text-primary" />
            <span className="font-semibold">UCAD Santé</span>
          </div>
          <p>
            © {new Date().getFullYear()} Université Cheikh Anta Diop de Dakar
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
