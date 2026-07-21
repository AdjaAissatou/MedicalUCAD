"use client";

import { useTransition } from "react";
import { annulerMonRendezVous } from "@/app/actions/etudiant";
import { X } from "lucide-react";

export function AnnulerRdvButton({ rdvId }: { rdvId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Annuler ce rendez-vous ?")) {
          startTransition(() => annulerMonRendezVous(rdvId));
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive/40 hover:text-destructive disabled:opacity-50 cursor-pointer"
    >
      <X className="h-3.5 w-3.5" />
      {pending ? "…" : "Annuler"}
    </button>
  );
}
