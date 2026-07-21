"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  reserverRendezVous,
  type RdvEtudiantState,
} from "@/app/actions/etudiant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CalendarCheck } from "lucide-react";

type Medecin = { id: string; label: string; sous?: string };

function FieldError({ id, errors }: { id?: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}

export function ReservationForm({ medecins }: { medecins: Medecin[] }) {
  const [state, formAction, pending] = useActionState<
    RdvEtudiantState,
    FormData
  >(reserverRendezVous, {});
  const fe = state.fieldErrors ?? {};
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="space-y-5 p-5">
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
            <Label htmlFor="medecinId" required>
              Médecin
            </Label>
            <Select
              id="medecinId"
              name="medecinId"
              defaultValue=""
              required
              className="mt-1.5"
              {...(fe.medecinId
                ? { "aria-invalid": true, "aria-describedby": "medecinId-error" }
                : {})}
            >
              <option value="" disabled>
                Choisir un médecin…
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

          <div className="grid grid-cols-2 gap-3">
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
                required
                className="mt-1.5"
                {...(fe.date
                  ? { "aria-invalid": true, "aria-describedby": "date-error" }
                  : {})}
              />
              <FieldError id="date-error" errors={fe.date} />
            </div>
            <div>
              <Label htmlFor="heure" required>
                Heure
              </Label>
              <Input
                id="heure"
                name="heure"
                type="time"
                defaultValue="09:00"
                required
                className="mt-1.5"
                {...(fe.heure
                  ? { "aria-invalid": true, "aria-describedby": "heure-error" }
                  : {})}
              />
              <FieldError id="heure-error" errors={fe.heure} />
            </div>
          </div>

          <div>
            <Label htmlFor="motif">Motif (facultatif)</Label>
            <Textarea
              id="motif"
              name="motif"
              placeholder="Ex : fièvre, mal de tête, contrôle…"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/espace-etudiant/rendez-vous">Annuler</Link>
        </Button>
        <Button
          type="submit"
          variant="accent"
          loading={pending}
          className="flex-1"
        >
          {!pending && <CalendarCheck className="h-4 w-4" />}
          {pending ? "Réservation…" : "Confirmer"}
        </Button>
      </div>
    </form>
  );
}
