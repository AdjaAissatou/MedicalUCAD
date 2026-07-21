"use client";

import { useActionState, useTransition, useState } from "react";
import {
  creerAccesEtudiant,
  reinitialiserMotDePasseEtudiant,
  basculerAccesEtudiant,
  revoquerAccesEtudiant,
  type AccesEtudiantState,
} from "@/app/actions/acces-etudiant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  KeyRound,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Compte = { email: string; actif: boolean } | null;

function FieldError({ id, errors }: { id?: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}

export function AccesEtudiantCard({
  patientId,
  emailPatient,
  compte,
}: {
  patientId: string;
  emailPatient: string | null;
  compte: Compte;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" />
          Accès étudiant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {compte ? (
          <CompteExistant patientId={patientId} compte={compte} />
        ) : (
          <CreationCompte patientId={patientId} emailPatient={emailPatient} />
        )}
      </CardContent>
    </Card>
  );
}

function CreationCompte({
  patientId,
  emailPatient,
}: {
  patientId: string;
  emailPatient: string | null;
}) {
  const action = creerAccesEtudiant.bind(null, patientId);
  const [state, formAction, pending] = useActionState<
    AccesEtudiantState,
    FormData
  >(action, {});
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Accès étudiant créé. L&apos;étudiant peut se connecter avec cet email et
        ce mot de passe.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Créez un identifiant pour que cet étudiant accède à son espace
        (rendez-vous, dossier, consultations).
      </p>
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <div>
        <Label htmlFor="acces-email" required>
          Email de connexion
        </Label>
        <Input
          id="acces-email"
          name="email"
          type="email"
          inputMode="email"
          defaultValue={emailPatient ?? ""}
          placeholder="prenom.nom@ucad.edu.sn"
          required
          className="mt-1.5"
          {...(fe.email
            ? { "aria-invalid": true, "aria-describedby": "acces-email-error" }
            : {})}
        />
        <FieldError id="acces-email-error" errors={fe.email} />
      </div>
      <div>
        <Label htmlFor="acces-mdp" required>
          Mot de passe provisoire
        </Label>
        <Input
          id="acces-mdp"
          name="motDePasse"
          type="text"
          placeholder="Au moins 6 caractères"
          required
          className="mt-1.5"
          {...(fe.motDePasse
            ? { "aria-invalid": true, "aria-describedby": "acces-mdp-error" }
            : {})}
        />
        <FieldError id="acces-mdp-error" errors={fe.motDePasse} />
        <p className="mt-1 text-xs text-muted-foreground">
          Communiquez-le à l&apos;étudiant ; il pourra le changer ensuite.
        </p>
      </div>
      <Button type="submit" variant="accent" loading={pending} className="w-full">
        {!pending && <GraduationCap className="h-4 w-4" />}
        {pending ? "Création…" : "Créer l'accès étudiant"}
      </Button>
    </form>
  );
}

function CompteExistant({
  patientId,
  compte,
}: {
  patientId: string;
  compte: { email: string; actif: boolean };
}) {
  const [pending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);
  const resetAction = reinitialiserMotDePasseEtudiant.bind(null, patientId);
  const [resetState, resetFormAction, resetPending] = useActionState<
    AccesEtudiantState,
    FormData
  >(resetAction, {});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {compte.email}
          </p>
          <p className="text-xs text-muted-foreground">Compte étudiant</p>
        </div>
        <Badge variant={compte.actif ? "success" : "neutral"} dot>
          {compte.actif ? "Actif" : "Désactivé"}
        </Badge>
      </div>

      {resetState.ok && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2.5 text-xs text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Mot de passe réinitialisé.
        </div>
      )}

      {showReset ? (
        <form action={resetFormAction} className="space-y-2">
          <Label htmlFor="reset-mdp" required>
            Nouveau mot de passe
          </Label>
          <Input
            id="reset-mdp"
            name="motDePasse"
            type="text"
            placeholder="Au moins 6 caractères"
            required
            {...(resetState.fieldErrors?.motDePasse
              ? { "aria-invalid": true }
              : {})}
          />
          <FieldError errors={resetState.fieldErrors?.motDePasse} />
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              variant="accent"
              loading={resetPending}
            >
              Enregistrer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowReset(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowReset(true)}
          >
            <KeyRound className="h-4 w-4" />
            Réinitialiser le mot de passe
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(() => basculerAccesEtudiant(patientId))
            }
          >
            <Power className="h-4 w-4" />
            {compte.actif ? "Désactiver" : "Réactiver"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            disabled={pending}
            onClick={() => {
              if (confirm("Supprimer définitivement l'accès étudiant ?")) {
                startTransition(() => revoquerAccesEtudiant(patientId));
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Révoquer
          </Button>
        </div>
      )}
    </div>
  );
}
