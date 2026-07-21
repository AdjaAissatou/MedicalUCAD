"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { AlertCircle, Save } from "lucide-react";
import type { UtilisateurFormState } from "@/app/actions/utilisateurs";

type Action = (
  prev: UtilisateurFormState,
  formData: FormData
) => Promise<UtilisateurFormState>;

export type UtilisateurInitial = {
  prenom?: string;
  nom?: string;
  email?: string;
  role?: string;
  specialite?: string | null;
  telephone?: string | null;
};

function FieldError({ id, errors }: { id?: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}

/** Props d'accessibilité pour lier un champ à son message d'erreur. */
function errorProps(field: string, errors?: string[]) {
  if (!errors?.length) return {};
  return { "aria-invalid": true, "aria-describedby": `${field}-error` } as const;
}

export function UtilisateurForm({
  action,
  initial = {},
  submitLabel = "Enregistrer",
  edition = false,
}: {
  action: Action;
  initial?: UtilisateurInitial;
  submitLabel?: string;
  edition?: boolean;
}) {
  const [state, formAction, pending] = useActionState<
    UtilisateurFormState,
    FormData
  >(action, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          {state.error && (
            <div
              role="alert"
              className="sm:col-span-2 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div>
            <Label htmlFor="prenom" required>
              Prénom
            </Label>
            <Input
              id="prenom"
              name="prenom"
              defaultValue={initial.prenom}
              required
              autoComplete="given-name"
              className="mt-1.5"
              {...errorProps("prenom", fe.prenom)}
            />
            <FieldError id="prenom-error" errors={fe.prenom} />
          </div>
          <div>
            <Label htmlFor="nom" required>
              Nom
            </Label>
            <Input
              id="nom"
              name="nom"
              defaultValue={initial.nom}
              required
              autoComplete="family-name"
              className="mt-1.5"
              {...errorProps("nom", fe.nom)}
            />
            <FieldError id="nom-error" errors={fe.nom} />
          </div>
          <div>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              defaultValue={initial.email}
              required
              className="mt-1.5"
              {...errorProps("email", fe.email)}
            />
            <FieldError id="email-error" errors={fe.email} />
          </div>
          <div>
            <Label htmlFor="role" required>
              Rôle
            </Label>
            <Select
              id="role"
              name="role"
              defaultValue={initial.role ?? "SECRETAIRE"}
              className="mt-1.5"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="specialite">Spécialité</Label>
            <Input
              id="specialite"
              name="specialite"
              defaultValue={initial.specialite ?? ""}
              placeholder="Ex : Médecine générale"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              name="telephone"
              defaultValue={initial.telephone ?? ""}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="motDePasse" required={!edition}>
              Mot de passe {edition && "(laisser vide pour conserver)"}
            </Label>
            <Input
              id="motDePasse"
              name="motDePasse"
              type="password"
              required={!edition}
              autoComplete="new-password"
              placeholder={edition ? "••••••••" : "Au moins 6 caractères"}
              className="mt-1.5"
              {...errorProps("motDePasse", fe.motDePasse)}
            />
            <FieldError id="motDePasse-error" errors={fe.motDePasse} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/administration/utilisateurs">Annuler</Link>
        </Button>
        <Button type="submit" variant="accent" loading={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
