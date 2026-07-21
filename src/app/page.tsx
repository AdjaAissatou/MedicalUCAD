import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { LandingHero } from "@/components/landing/landing-hero";
import {
  HeartPulse,
  FolderHeart,
  CalendarCheck,
  Stethoscope,
  Share2,
  Pill,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Activity,
  Accessibility,
  ArrowRight,
  LogIn,
} from "lucide-react";

const MODULES = [
  {
    icon: FolderHeart,
    titre: "Dossiers médicaux",
    desc: "Fiches patients complètes : antécédents, allergies, groupe sanguin et historiques.",
  },
  {
    icon: CalendarCheck,
    titre: "Rendez-vous",
    desc: "Planification, filtres, suivi des statuts et regroupement par jour.",
  },
  {
    icon: Stethoscope,
    titre: "Consultations",
    desc: "Historique des consultations, constantes vitales et diagnostics.",
  },
  {
    icon: Share2,
    titre: "Orientations",
    desc: "Redirections vers spécialistes et structures de soins externes.",
  },
  {
    icon: Pill,
    titre: "Pharmacie",
    desc: "Stock, seuils d'alerte, ruptures et dates de péremption.",
  },
  {
    icon: LayoutDashboard,
    titre: "Tableau de bord",
    desc: "Statistiques, rendez-vous du jour et alertes de pharmacie en un coup d'œil.",
  },
];

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
    <div className="relative bg-background">
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

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            La plateforme
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tout le parcours de soin, réuni
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Six modules qui couvrent l&apos;ensemble du service médical
            universitaire, du premier rendez-vous à la délivrance des
            médicaments.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <ScrollReveal key={m.titre} delay={(i % 3) * 90}>
              <article className="card-hover glow-border group h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <m.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {m.titre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.desc}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

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
  );
}
