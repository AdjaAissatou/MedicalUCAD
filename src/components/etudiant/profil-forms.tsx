"use client";

import { useActionState } from "react";
import {
  modifierMonProfil,
  changerMonMotDePasse,
  type ProfilState,
} from "@/app/actions/etudiant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Save, KeyRound } from "lucide-react";

function FieldError({ id, errors }: { id?: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}

function Ok({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2.5 text-sm text-green-800">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {children}
    </div>
  );
}

function Erreur({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function ProfilForms({
  initial,
}: {
  initial: {
    telephone: string | null;
    email: string | null;
    adresse: string | null;
  };
}) {
  const [pState, pAction, pPending] = useActionState<ProfilState, FormData>(
    modifierMonProfil,
    {}
  );
  const [mState, mAction, mPending] = useActionState<ProfilState, FormData>(
    changerMonMotDePasse,
    {}
  );
  const pfe = pState.fieldErrors ?? {};
  const mfe = mState.fieldErrors ?? {};

  return (
    <div className="space-y-6">
      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mes coordonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={pAction} className="space-y-4">
            {pState.ok && <Ok>Coordonnées mises à jour.</Ok>}
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={initial.telephone ?? ""}
                placeholder="+221 77 000 00 00"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                defaultValue={initial.email ?? ""}
                className="mt-1.5"
                {...(pfe.email
                  ? { "aria-invalid": true, "aria-describedby": "email-error" }
                  : {})}
              />
              <FieldError id="email-error" errors={pfe.email} />
            </div>
            <div>
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                name="adresse"
                defaultValue={initial.adresse ?? ""}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" variant="accent" loading={pPending}>
              {!pPending && <Save className="h-4 w-4" />}
              {pPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Changer mon mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={mAction} className="space-y-4" key={mState.ok ? "ok" : "form"}>
            {mState.ok && <Ok>Mot de passe modifié avec succès.</Ok>}
            {mState.error && <Erreur>{mState.error}</Erreur>}
            <div>
              <Label htmlFor="actuel" required>
                Mot de passe actuel
              </Label>
              <Input
                id="actuel"
                name="actuel"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1.5"
                {...(mfe.actuel
                  ? { "aria-invalid": true, "aria-describedby": "actuel-error" }
                  : {})}
              />
              <FieldError id="actuel-error" errors={mfe.actuel} />
            </div>
            <div>
              <Label htmlFor="nouveau" required>
                Nouveau mot de passe
              </Label>
              <Input
                id="nouveau"
                name="nouveau"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1.5"
                {...(mfe.nouveau
                  ? { "aria-invalid": true, "aria-describedby": "nouveau-error" }
                  : {})}
              />
              <FieldError id="nouveau-error" errors={mfe.nouveau} />
            </div>
            <div>
              <Label htmlFor="confirmation" required>
                Confirmer le nouveau mot de passe
              </Label>
              <Input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1.5"
                {...(mfe.confirmation
                  ? {
                      "aria-invalid": true,
                      "aria-describedby": "confirmation-error",
                    }
                  : {})}
              />
              <FieldError id="confirmation-error" errors={mfe.confirmation} />
            </div>
            <Button type="submit" variant="outline" loading={mPending}>
              {!mPending && <KeyRound className="h-4 w-4" />}
              {mPending ? "Modification…" : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
