"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  creerOrientation,
  type OrientationFormState,
} from "@/app/actions/orientations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Share2 } from "lucide-react";

type Option = { id: string; label: string; sous?: string };

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

export function OrientationForm({
  patients,
  medecins,
  patientPreselect,
}: {
  patients: Option[];
  medecins: Option[];
  patientPreselect?: string;
}) {
  const [state, formAction, pending] = useActionState<
    OrientationFormState,
    FormData
  >(creerOrientation, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid gap-5 p-6">
          {state.error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div>
            <Label htmlFor="patientId" required>
              Patient
            </Label>
            <Select
              id="patientId"
              name="patientId"
              defaultValue={patientPreselect ?? ""}
              required
              className="mt-1.5"
              {...errorProps("patientId", fe.patientId)}
            >
              <option value="" disabled>
                Sélectionner un patient…
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.sous ? ` — ${p.sous}` : ""}
                </option>
              ))}
            </Select>
            <FieldError id="patientId-error" errors={fe.patientId} />
          </div>

          <div>
            <Label htmlFor="medecinId" required>
              Médecin orienteur
            </Label>
            <Select
              id="medecinId"
              name="medecinId"
              defaultValue=""
              required
              className="mt-1.5"
              {...errorProps("medecinId", fe.medecinId)}
            >
              <option value="" disabled>
                Sélectionner un médecin…
              </option>
              {medecins.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                  {m.sous ? ` — ${m.sous}` : ""}
                </option>
              ))}
            </Select>
            <FieldError id="medecinId-error" errors={fe.medecinId} />
          </div>

          <div>
            <Label htmlFor="serviceCible" required>
              Service / structure de destination
            </Label>
            <Input
              id="serviceCible"
              name="serviceCible"
              placeholder="Ex : Cardiologie — Hôpital Fann"
              required
              className="mt-1.5"
              {...errorProps("serviceCible", fe.serviceCible)}
            />
            <FieldError id="serviceCible-error" errors={fe.serviceCible} />
          </div>

          <div>
            <Label htmlFor="motif" required>
              Motif de l&apos;orientation
            </Label>
            <Textarea
              id="motif"
              name="motif"
              placeholder="Raison de la redirection vers ce service…"
              required
              className="mt-1.5"
              {...errorProps("motif", fe.motif)}
            />
            <FieldError id="motif-error" errors={fe.motif} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/orientations">Annuler</Link>
        </Button>
        <Button type="submit" variant="accent" loading={pending}>
          {!pending && <Share2 className="h-4 w-4" />}
          {pending ? "Enregistrement…" : "Créer l'orientation"}
        </Button>
      </div>
    </form>
  );
}
