import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./login-form";
import { HeartPulse, ShieldCheck, CalendarCheck, Pill } from "lucide-react";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/tableau-de-bord");

  return (
    <main className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Volet illustration animé */}
      <div className="relative hidden lg:flex flex-col justify-between bg-[#062e2c] p-12 text-white overflow-hidden">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        {/* grille discrète */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />

        <div className="relative flex items-center gap-3 rise">
          <div className="float flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">UCAD Santé</p>
            <p className="text-sm text-white/60">Services Médicaux</p>
          </div>
        </div>

        <div className="relative space-y-6 rise" style={{ animationDelay: "120ms" }}>
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight">
            Le suivi médical de la
            <br />
            communauté universitaire,
            <br />
            <span className="text-gradient bg-clip-text">réinventé.</span>
          </h1>
          <p className="max-w-md text-white/70 text-lg">
            Dossiers, rendez-vous, consultations, orientations et pharmacie —
            une plateforme unique, sécurisée et élégante pour le service médical
            de l&apos;UCAD.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {[
              { icon: ShieldCheck, label: "Sécurisé & confidentiel" },
              { icon: CalendarCheck, label: "Rendez-vous simplifiés" },
              { icon: Pill, label: "Pharmacie intégrée" },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white/85 ring-1 ring-white/15 backdrop-blur"
              >
                <f.icon className="h-4 w-4" />
                {f.label}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/45 rise" style={{ animationDelay: "240ms" }}>
          © {new Date().getFullYear()} Université Cheikh Anta Diop de Dakar
        </p>
      </div>

      {/* Volet formulaire */}
      <div className="relative flex items-center justify-center p-6 sm:p-12 bg-background">
        {/* halo décoratif sur mobile / fond */}
        <div className="aurora lg:hidden opacity-40" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <div className="relative w-full max-w-sm rise">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight text-foreground">
                UCAD Santé
              </p>
              <p className="text-sm text-muted-foreground">Services Médicaux</p>
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/60 p-8 shadow-xl shadow-primary/5">
            <h2 className="text-2xl font-bold text-foreground">
              Bon retour parmi nous
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Connectez-vous à votre espace de travail.
            </p>

            <div className="mt-8">
              <LoginForm />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card/70 p-4 text-xs text-muted-foreground backdrop-blur">
            <p className="mb-1 font-medium text-foreground">
              Comptes de démonstration
            </p>
            <p>Administrateur — admin@ucad.edu.sn / passer123</p>
            <p>Médecin — medecin@ucad.edu.sn / passer123</p>
          </div>
        </div>
      </div>
    </main>
  );
}
