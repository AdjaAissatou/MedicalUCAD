"use client";

import { useTransition } from "react";
import { changerStatutRdv } from "@/app/actions/rendez-vous";
import { STATUT_RDV_LABELS, TRANSITIONS_RDV } from "@/lib/constants";

export function StatutSelect({
  id,
  statut,
}: {
  id: string;
  statut: string;
}) {
  const [pending, startTransition] = useTransition();

  // Machine à états : on ne propose que les transitions autorisées.
  // Le statut courant reste affiché ; un état final désactive le sélecteur.
  const transitions = TRANSITIONS_RDV[statut] ?? [];
  const terminal = transitions.length === 0;
  const options = [statut, ...transitions];

  return (
    <select
      aria-label="Changer le statut"
      value={statut}
      disabled={pending || terminal}
      title={terminal ? "Statut final — non modifiable" : undefined}
      onChange={(e) =>
        startTransition(() => changerStatutRdv(id, e.target.value))
      }
      className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {options.map((s) => (
        <option key={s} value={s}>
          {STATUT_RDV_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
