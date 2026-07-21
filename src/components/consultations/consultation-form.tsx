"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save, Stethoscope, Activity } from "lucide-react";
import type { ConsultationFormState } from "@/app/actions/consultations";

type Option = { id: string; label: string; sous?: string };
type Action = (
  prev: ConsultationFormState,
  formData: FormData
) => Promise<ConsultationFormState>;

export type ConsultationInitial = {
  patientId?: string;
  medecinId?: string;
  rendezVousId?: string;
  date?: string;
  motif?: string | null;
  symptomes?: string | null;
  diagnostic?: string | null;
  traitement?: string | null;
  observations?: string | null;
  poids?: number | null;
  taille?: number | null;
  temperature?: number | null;
  tensionArt?: string | null;
  pouls?: number | null;
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function ConsultationForm({
  action,
  patients,
  medecins,
  initial = {},
  patientVerrouille = false,
  submitLabel = "Enregistrer la consultation",
  cancelHref,
}: {
  action: Action;
  patients: Option[];
  medecins: Option[];
  initial?: ConsultationInitial;
  patientVerrouille?: boolean;
  submitLabel?: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState<
    ConsultationFormState,
    FormData
  >(action, {});
  const fe = state.fieldErrors ?? {};
  const patientLabel = patients.find((p) => p.id === initial.patientId)?.label;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {initial.rendezVousId && (
        <input type="hidden" name="rendezVousId" value={initial.rendezVousId} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-primary" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="patientId">Patient *</Label>
            {patientVerrouille && initial.patientId ? (
              <>
                <input
                  type="hidden"
                  name="patientId"
                  value={initial.patientId}
                />
                <div className="mt-1.5 flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-foreground">
                  {patientLabel ?? "Patient sélectionné"}
                </div>
              </>
            ) : (
              <Select
                id="patientId"
                name="patientId"
                defaultValue={initial.patientId ?? ""}
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
            )}
            <FieldError errors={fe.patientId} />
          </div>
          <div>
            <Label htmlFor="medecinId">Médecin *</Label>
            <Select
              id="medecinId"
              name="medecinId"
              defaultValue={initial.medecinId ?? ""}
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={initial.date}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="motif">Motif de consultation</Label>
            <Input
              id="motif"
              name="motif"
              defaultValue={initial.motif ?? ""}
              placeholder="Ex : Fièvre, contrôle…"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Constantes / signes vitaux
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="poids">Poids (kg)</Label>
            <Input
              id="poids"
              name="poids"
              inputMode="decimal"
              defaultValue={initial.poids ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="taille">Taille (cm)</Label>
            <Input
              id="taille"
              name="taille"
              inputMode="decimal"
              defaultValue={initial.taille ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="temperature">Température (°C)</Label>
            <Input
              id="temperature"
              name="temperature"
              inputMode="decimal"
              defaultValue={initial.temperature ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="tensionArt">Tension artérielle</Label>
            <Input
              id="tensionArt"
              name="tensionArt"
              placeholder="Ex : 12/8"
              defaultValue={initial.tensionArt ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pouls">Pouls (bpm)</Label>
            <Input
              id="pouls"
              name="pouls"
              inputMode="numeric"
              defaultValue={initial.pouls ?? ""}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Examen clinique</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div>
            <Label htmlFor="symptomes">Symptômes</Label>
            <Textarea
              id="symptomes"
              name="symptomes"
              defaultValue={initial.symptomes ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="diagnostic">Diagnostic</Label>
            <Textarea
              id="diagnostic"
              name="diagnostic"
              defaultValue={initial.diagnostic ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="traitement">Traitement / conduite à tenir</Label>
            <Textarea
              id="traitement"
              name="traitement"
              defaultValue={initial.traitement ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              name="observations"
              defaultValue={initial.observations ?? ""}
              className="mt-1.5"
            />
          </div>
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
