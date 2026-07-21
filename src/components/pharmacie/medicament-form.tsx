"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Save } from "lucide-react";
import type { MedicamentFormState } from "@/app/actions/medicaments";

type Action = (
  prev: MedicamentFormState,
  formData: FormData
) => Promise<MedicamentFormState>;

export type MedicamentInitial = {
  nom?: string;
  dci?: string | null;
  forme?: string | null;
  dosage?: string | null;
  stock?: number;
  seuilAlerte?: number;
  prix?: number;
  datePeremption?: string;
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function MedicamentForm({
  action,
  initial = {},
  submitLabel = "Enregistrer",
}: {
  action: Action;
  initial?: MedicamentInitial;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<
    MedicamentFormState,
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

          <div className="sm:col-span-2">
            <Label htmlFor="nom">Nom commercial *</Label>
            <Input
              id="nom"
              name="nom"
              defaultValue={initial.nom}
              required
              placeholder="Ex : Doliprane 500mg"
              className="mt-1.5"
            />
            <FieldError errors={fe.nom} />
          </div>
          <div>
            <Label htmlFor="dci">DCI (molécule)</Label>
            <Input
              id="dci"
              name="dci"
              defaultValue={initial.dci ?? ""}
              placeholder="Ex : Paracétamol"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="forme">Forme</Label>
            <Input
              id="forme"
              name="forme"
              defaultValue={initial.forme ?? ""}
              placeholder="Comprimé, sirop, injectable…"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              name="dosage"
              defaultValue={initial.dosage ?? ""}
              placeholder="Ex : 500mg"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="prix">Prix (FCFA)</Label>
            <Input
              id="prix"
              name="prix"
              inputMode="numeric"
              defaultValue={initial.prix ?? 0}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock actuel</Label>
            <Input
              id="stock"
              name="stock"
              inputMode="numeric"
              defaultValue={initial.stock ?? 0}
              className="mt-1.5"
            />
            <FieldError errors={fe.stock} />
          </div>
          <div>
            <Label htmlFor="seuilAlerte">Seuil d&apos;alerte</Label>
            <Input
              id="seuilAlerte"
              name="seuilAlerte"
              inputMode="numeric"
              defaultValue={initial.seuilAlerte ?? 10}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="datePeremption">Date de péremption</Label>
            <Input
              id="datePeremption"
              name="datePeremption"
              type="date"
              defaultValue={initial.datePeremption}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Link href="/pharmacie">
          <Button type="button" variant="outline">
            Annuler
          </Button>
        </Link>
        <Button type="submit" variant="accent" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
