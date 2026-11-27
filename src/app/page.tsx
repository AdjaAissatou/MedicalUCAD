import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { accueilParRole } from "@/lib/authz";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UcadLogoMark } from "@/components/brand/ucad-logo";
import { HeroScene } from "@/components/landing/hero-scene";
import { cn } from "@/lib/utils";
import {
  LogIn,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  CalendarCheck,
  Pill,
  Share2,
  FolderHeart,
  LayoutDashboard,
  ArrowRight,
  Check,
  Sparkles,
  Heart,
  Zap,
  Eye,
} from "lucide-react";

const VALEURS = [
  { icon: ShieldCheck, titre: "Confiance", desc: "Des couleurs profondes et rassurantes." },
  { icon: Sparkles, titre: "Excellence", desc: "Digne d'une grande institution universitaire." },
  { icon: Heart, titre: "Humanité", desc: "Une interface chaleureuse, jamais impersonnelle." },
  { icon: Zap, titre: "Innovation", desc: "Des interactions fluides et intelligentes." },
  { icon: Eye, titre: "Clarté", desc: "Chaque information médicale, immédiatement lisible." },
];

const MODULES = [
  { icon: FolderHeart, titre: "Dossiers médicaux", desc: "Antécédents, allergies, groupe sanguin et historiques." },
  { icon: CalendarCheck, titre: "Rendez-vous", desc: "Planification, statuts et suivi au quotidien." },
  { icon: Stethoscope, titre: "Consultations", desc: "Constantes vitales, diagnostics et traitements." },
  { icon: Share2, titre: "Orientations", desc: "Redirections vers spécialistes et structures." },
  { icon: Pill, titre: "Pharmacie", desc: "Stock, seuils d'alerte et péremptions." },
  { icon: LayoutDashboard, titre: "Tableau de bord", desc: "L'activité du service en un coup d'œil." },
];

export default async function Home() {
  const user = await getSessionUser();
  if (user) {
    redirect(accueilParRole(user));
  }

  return (
    <div className="bg-background">
      {/* ─── Barre supérieure ─── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-white/20">
              <UcadLogoMark className="h-7 w-7" />
            </span>
            <span className="text-lg font-bold">
              UCAD <span className="text-gold">Medical</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20"
              )}
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="aurora opacity-70" aria-hidden>
          <span /><span /><span />
        </div>
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
            backgroundSize: "54px 54px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-36">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Santé · Innovation · Excellence
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              La santé universitaire,
              <br />
              <span className="text-gradient">connectée et accessible.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">
              UCAD Medical réunit dossiers médicaux, rendez-vous, consultations
              et pharmacie dans une plateforme unique, élégante et sécurisée —
              pour le personnel soignant comme pour les étudiants.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg", variant: "premium" }))}
              >
                Accéder à la plateforme
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20"
                )}
              >
                <GraduationCap className="h-4 w-4" />
                Espace étudiant
              </Link>
            </div>
          </div>

          {/* Centre 3D premium */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroScene className="h-[320px] w-full sm:h-[420px] lg:h-[540px]" />
            <div className="float absolute bottom-2 left-2 hidden rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 backdrop-blur-md sm:block">
              <p className="text-xs font-semibold text-white">Premium • Sécurisé</p>
              <p className="text-[11px] text-white/60">Dossiers médicaux protégés</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Valeurs ─── */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {VALEURS.map((v) => (
            <div
              key={v.titre}
              className="rounded-2xl border border-border bg-card p-5 text-center"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <v.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold text-foreground">{v.titre}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Deux espaces ─── */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Une plateforme, deux espaces
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Conçue pour chacun
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card-hover relative overflow-hidden rounded-3xl border border-border bg-card p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-foreground">
              Pour le personnel soignant
            </h3>
            <p className="mt-2 text-muted-foreground">
              Médecins, infirmiers, pharmaciens, secrétaires et administrateurs.
            </p>
            <ul className="mt-5 space-y-2.5">
              {["Dossiers patients complets", "Rendez-vous & consultations", "Pharmacie & orientations", "Administration par rôles"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {t}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="card-hover relative overflow-hidden rounded-3xl border border-border bg-card p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <GraduationCap className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-foreground">
              Pour les étudiants
            </h3>
            <p className="mt-2 text-muted-foreground">
              Un espace mobile, installable comme une application.
            </p>
            <ul className="mt-5 space-y-2.5">
              {["Prendre rendez-vous en ligne", "Consulter son dossier médical", "Suivre ses consultations", "Gérer son profil"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {t}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Modules ─── */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Tout le parcours de soin
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Six modules, parfaitement reliés
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.titre}
              className="card-hover group rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <m.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {m.titre}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sécurité ─── */}
      <section className="px-6 pb-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-forest p-10 text-white sm:p-14">
          <div className="aurora opacity-40" aria-hidden>
            <span /><span /><span />
          </div>
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold ring-1 ring-gold/25">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Les données de santé,
                <br />
                protégées sérieusement
              </h2>
              <p className="mt-4 max-w-md text-white/70">
                La confidentialité médicale est au cœur du système : accès par
                rôle, données sensibles jamais exposées, documents vérifiables.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { t: "Accès par rôle", d: "Chaque profil ne voit que ce qui le concerne." },
                { t: "Mots de passe chiffrés", d: "bcrypt, jamais stockés en clair." },
                { t: "Sessions sécurisées", d: "Cookies signés httpOnly, anti-force-brute." },
                { t: "En-têtes durcis", d: "CSP, HSTS, anti-clickjacking." },
              ].map((s) => (
                <div
                  key={s.t}
                  className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10"
                >
                  <p className="font-semibold">{s.t}</p>
                  <p className="mt-1 text-sm text-white/65">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card px-8 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Prêt à prendre soin de votre communauté ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Connectez-vous à UCAD Medical et retrouvez tous vos outils au même
            endroit.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "accent" }))}
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Pied de page ─── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 text-foreground">
            <UcadLogoMark className="h-6 w-6" />
            <span className="font-semibold">
              UCAD <span className="text-gold">Medical</span>
            </span>
          </div>
          <p>© {new Date().getFullYear()} Université Cheikh Anta Diop de Dakar</p>
        </div>
      </footer>
    </div>
  );
}
