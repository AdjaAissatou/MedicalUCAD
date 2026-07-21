"use client";

import { useTransition } from "react";
import { changerStatutOrientation } from "@/app/actions/orientations";

const STATUTS = [
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "REALISEE", label: "Réalisée" },
  { value: "ANNULEE", label: "Annulée" },
];

export function OrientationStatut({
  id,
  statut,
}: {
  id: string;
  statut: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label="Changer le statut"
      value={statut}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => changerStatutOrientation(id, e.target.value))
      }
      className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-50"
    >
      {STATUTS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
