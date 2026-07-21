import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./login-form";
import { HeartPulse } from "lucide-react";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/tableau-de-bord");

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Volet illustration */}
      <div className="relative hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(22,163,74,0.5) 0, transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">UCAD Santé</p>
            <p className="text-sm text-white/70">Services Médicaux</p>
          </div>
        </div>

        <div className="relative space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            Le suivi médical de la communauté universitaire, simplifié.
          </h1>
          <p className="text-white/80 max-w-md">
            Dossiers médicaux, rendez-vous, consultations, orientations et
            pharmacie — une plateforme unique pour le service médical de
            l&apos;Université Cheikh Anta Diop de Dakar.
          </p>
        </div>

        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} Université Cheikh Anta Diop de Dakar
        </p>
      </div>

      {/* Volet formulaire */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight text-foreground">
                UCAD Santé
              </p>
              <p className="text-sm text-muted-foreground">Services Médicaux</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accédez à votre espace de travail.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              Comptes de démonstration
            </p>
            <p>Médecin — medecin@ucad.edu.sn / passer123</p>
            <p>Administrateur — admin@ucad.edu.sn / passer123</p>
          </div>
        </div>
      </div>
    </main>
  );
}
