"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Save } from "lucide-react";
import {
  CATEGORIES_EXAMEN,
  CATEGORIE_EXAMEN_LABELS,
  PRIORITES_EXAMEN,
  PRIORITE_EXAMEN_LABELS,
} from "@/lib/constants";
import type { ExamenFormState } from "@/app/actions/examens";

type Option = { id: string; label: string; sous?: string };
type Action = (
  prev: ExamenFormState,
  fd: FormData
) => Promise<ExamenFormState>;

export function ExamenForm({
  action,
  patients,
  medecins,
  initial = {},
  patientVerrouille = false,
  cancelHref,
}: {
  action: Action;
  patients: Option[];
  medecins: Option[];
  initial?: { patientId?: string; medecinId?: string };
  patientVerrouille?: boolean;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState<ExamenFormState, FormData>(
    action,
    {}
  );
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
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="patientId" required>
              Patient
            </Label>
            {patientVerrouille && initial.patientId ? (
              <>
                <input type="hidden" name="patientId" value={initial.patientId} />
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
            {fe.patientId && (
              <p className="mt-1 text-xs text-destructive">{fe.patientId[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="medecinId" required>
              Médecin prescripteur
            </Label>
            <Select
              id="medecinId"
              name="medecinId"
              defaultValue={initial.medecinId ?? ""}
              required
              className="mt-1.5"
            >
              <option value="" disabled>
                Sélectionner…
              </option>
              {medecins.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </Select>
            {fe.medecinId && (
              <p className="mt-1 text-xs text-destructive">{fe.medecinId[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="type" required>
              Type d&apos;examen
            </Label>
            <Input
              id="type"
              name="type"
              required
              placeholder="Ex : NFS, Glycémie, Radiographie thorax…"
              className="mt-1.5"
            />
            {fe.type && (
              <p className="mt-1 text-xs text-destructive">{fe.type[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="categorie">Catégorie</Label>
            <Select id="categorie" name="categorie" defaultValue="BIOLOGIE" className="mt-1.5">
              {CATEGORIES_EXAMEN.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIE_EXAMEN_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="priorite">Priorité</Label>
            <Select id="priorite" name="priorite" defaultValue="NORMALE" className="mt-1.5">
              {PRIORITES_EXAMEN.map((p) => (
                <option key={p} value={p}>
                  {PRIORITE_EXAMEN_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="motif">Motif / renseignements cliniques</Label>
            <Input id="motif" name="motif" className="mt-1.5" />
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href={cancelHref}>Annuler</Link>
        </Button>
        <Button type="submit" variant="accent" loading={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {pending ? "Enregistrement…" : "Enregistrer la demande"}
        </Button>
      </div>
    </form>
  );
}
