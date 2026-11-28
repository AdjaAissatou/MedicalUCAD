"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TYPES_PATIENT,
  TYPE_PATIENT_LABELS,
  GROUPES_SANGUINS,
  FACULTES,
} from "@/lib/constants";
import { AlertCircle, Save } from "lucide-react";
import type { PatientFormState } from "@/app/actions/patients";

type Action = (
  prev: PatientFormState,
  formData: FormData
) => Promise<PatientFormState>;

export type PatientInitial = {
  matricule?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  sexe?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  type?: string;
  faculte?: string | null;
  groupeSanguin?: string | null;
  traitementEnCours?: string | null;
  observations?: string | null;
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

export function PatientForm({
  action,
  initial = {},
  submitLabel = "Enregistrer",
  cancelHref,
}: {
  action: Action;
  initial?: PatientInitial;
  submitLabel?: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Identité */}
      <Card>
        <CardHeader>
          <CardTitle>Identité du patient</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="matricule" required>
              Matricule / N° carte étudiant
            </Label>
            <Input
              id="matricule"
              name="matricule"
              defaultValue={initial.matricule}
              placeholder="Ex : 20231234 — n° de carte étudiant"
              required
              autoComplete="off"
              className="mt-1.5"
              {...errorProps("matricule", fe.matricule)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Identifiant unique : numéro de carte étudiant, ou matricule du
              personnel.
            </p>
            <FieldError id="matricule-error" errors={fe.matricule} />
          </div>
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              id="type"
              name="type"
              defaultValue={initial.type ?? "ETUDIANT"}
              className="mt-1.5"
            >
              {TYPES_PATIENT.map((t) => (
                <option key={t} value={t}>
                  {TYPE_PATIENT_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
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
            <Label htmlFor="dateNaissance">Date de naissance</Label>
            <Input
              id="dateNaissance"
              name="dateNaissance"
              type="date"
              defaultValue={initial.dateNaissance}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="sexe">Sexe</Label>
            <Select
              id="sexe"
              name="sexe"
              defaultValue={initial.sexe ?? ""}
              className="mt-1.5"
            >
              <option value="">—</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="faculte">Faculté / Service</Label>
            <Select
              id="faculte"
              name="faculte"
              defaultValue={initial.faculte ?? ""}
              className="mt-1.5"
            >
              <option value="">—</option>
              {FACULTES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
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
              {...errorProps("email", fe.email)}
            />
            <FieldError id="email-error" errors={fe.email} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              name="adresse"
              defaultValue={initial.adresse ?? ""}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dossier médical */}
      <Card>
        <CardHeader>
          <CardTitle>Informations médicales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="groupeSanguin">Groupe sanguin</Label>
            <Select
              id="groupeSanguin"
              name="groupeSanguin"
              defaultValue={initial.groupeSanguin ?? ""}
              className="mt-1.5"
            >
              <option value="">—</option>
              {GROUPES_SANGUINS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="traitementEnCours">Traitement en cours</Label>
            <Textarea
              id="traitementEnCours"
              name="traitementEnCours"
              defaultValue={initial.traitementEnCours ?? ""}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              name="observations"
              defaultValue={initial.observations ?? ""}
              className="mt-1.5"
            />
          </div>
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            Les antécédents, allergies et vaccinations se gèrent en détail
            depuis la fiche du patient, après création.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href={cancelHref}>Annuler</Link>
        </Button>
        <Button type="submit" variant="accent" loading={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
