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

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
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
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              name="prenom"
              defaultValue={initial.prenom}
              required
              className="mt-1.5"
            />
            <FieldError errors={fe.prenom} />
          </div>
          <div>
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              name="nom"
              defaultValue={initial.nom}
              required
              className="mt-1.5"
            />
            <FieldError errors={fe.nom} />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initial.email}
              required
              className="mt-1.5"
            />
            <FieldError errors={fe.email} />
          </div>
          <div>
            <Label htmlFor="role">Rôle *</Label>
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
            <Label htmlFor="motDePasse">
              Mot de passe {edition ? "(laisser vide pour conserver)" : "*"}
            </Label>
            <Input
              id="motDePasse"
              name="motDePasse"
              type="password"
              required={!edition}
              placeholder={edition ? "••••••••" : "Au moins 6 caractères"}
              className="mt-1.5"
            />
            <FieldError errors={fe.motDePasse} />
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
