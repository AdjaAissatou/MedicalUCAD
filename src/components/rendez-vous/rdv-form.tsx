"use client";

import { useActionState } from "react";
import Link from "next/link";
import { creerRendezVous, type RdvFormState } from "@/app/actions/rendez-vous";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CalendarPlus } from "lucide-react";

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

export function RdvForm({
  patients,
  medecins,
  patientPreselect,
}: {
  patients: Option[];
  medecins: Option[];
  patientPreselect?: string;
}) {
  const [state, formAction, pending] = useActionState<RdvFormState, FormData>(
    creerRendezVous,
    {}
  );
  const fe = state.fieldErrors ?? {};

  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          {state.error && (
            <div
              role="alert"
              className="sm:col-span-2 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="sm:col-span-2">
            <Label htmlFor="patientId" required>
              Patient
            </Label>
            <Select
              id="patientId"
              name="patientId"
              defaultValue={patientPreselect ?? ""}
              className="mt-1.5"
              required
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

          <div className="sm:col-span-2">
            <Label htmlFor="medecinId" required>
              Médecin
            </Label>
            <Select
              id="medecinId"
              name="medecinId"
              defaultValue=""
              className="mt-1.5"
              required
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
            <Label htmlFor="date" required>
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              min={aujourdhui}
              defaultValue={aujourdhui}
              className="mt-1.5"
              required
              {...errorProps("date", fe.date)}
            />
            <FieldError id="date-error" errors={fe.date} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="heure" required>
                Heure
              </Label>
              <Input
                id="heure"
                name="heure"
                type="time"
                defaultValue="09:00"
                className="mt-1.5"
                required
                {...errorProps("heure", fe.heure)}
              />
              <FieldError id="heure-error" errors={fe.heure} />
            </div>
            <div>
              <Label htmlFor="duree">Durée (min)</Label>
              <Select
                id="duree"
                name="duree"
                defaultValue="30"
                className="mt-1.5"
              >
                {[15, 20, 30, 45, 60].map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="motif">Motif</Label>
            <Input
              id="motif"
              name="motif"
              placeholder="Ex : Consultation générale, suivi, vaccination…"
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/rendez-vous">Annuler</Link>
        </Button>
        <Button type="submit" variant="accent" loading={pending}>
          {!pending && <CalendarPlus className="h-4 w-4" />}
          {pending ? "Enregistrement…" : "Planifier le rendez-vous"}
        </Button>
      </div>
    </form>
  );
}
