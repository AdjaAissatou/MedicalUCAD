"use client";

import { useTransition } from "react";
import { changerStatutRdv } from "@/app/actions/rendez-vous";
import { STATUTS_RDV, STATUT_RDV_LABELS } from "@/lib/constants";

export function StatutSelect({
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
        startTransition(() => changerStatutRdv(id, e.target.value))
      }
      className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-50"
    >
      {STATUTS_RDV.map((s) => (
        <option key={s} value={s}>
          {STATUT_RDV_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
