"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Save } from "lucide-react";
import { enregistrerResultat, type ExamenFormState } from "@/app/actions/examens";

export function ResultatForm({
  demandeId,
  initial,
}: {
  demandeId: string;
  initial?: {
    valeurs?: string | null;
    conclusion?: string | null;
    documentUrl?: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<ExamenFormState, FormData>(
    enregistrerResultat,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <input type="hidden" name="demandeId" value={demandeId} />
      <div>
        <Label htmlFor="valeurs">Résultats / valeurs</Label>
        <Textarea
          id="valeurs"
          name="valeurs"
          defaultValue={initial?.valeurs ?? ""}
          placeholder="Ex : Hb 12,5 g/dL ; GB 6 500/mm³…"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="conclusion">Conclusion</Label>
        <Textarea
          id="conclusion"
          name="conclusion"
          defaultValue={initial?.conclusion ?? ""}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="documentUrl">Lien du document (optionnel)</Label>
        <Input
          id="documentUrl"
          name="documentUrl"
          defaultValue={initial?.documentUrl ?? ""}
          placeholder="https://…"
          className="mt-1.5"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" loading={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {pending ? "Enregistrement…" : "Enregistrer le résultat"}
        </Button>
      </div>
    </form>
  );
}
