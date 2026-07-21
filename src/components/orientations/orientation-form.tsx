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

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
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
            <Label htmlFor="patientId">Patient *</Label>
            <Select
              id="patientId"
              name="patientId"
              defaultValue={patientPreselect ?? ""}
              required
              className="mt-1.5"
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
            <FieldError errors={fe.patientId} />
          </div>

          <div>
            <Label htmlFor="medecinId">Médecin orienteur *</Label>
            <Select
              id="medecinId"
              name="medecinId"
              defaultValue=""
              required
              className="mt-1.5"
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
            <FieldError errors={fe.medecinId} />
          </div>

          <div>
            <Label htmlFor="serviceCible">Service / structure de destination *</Label>
            <Input
              id="serviceCible"
              name="serviceCible"
              placeholder="Ex : Cardiologie — Hôpital Fann"
              required
              className="mt-1.5"
            />
            <FieldError errors={fe.serviceCible} />
          </div>

          <div>
            <Label htmlFor="motif">Motif de l&apos;orientation *</Label>
            <Textarea
              id="motif"
              name="motif"
              placeholder="Raison de la redirection vers ce service…"
              required
              className="mt-1.5"
            />
            <FieldError errors={fe.motif} />
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
