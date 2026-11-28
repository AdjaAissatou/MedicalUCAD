"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { importerPatients, type ResultatImport } from "@/app/actions/import-patients";
import type { LigneBrute } from "@/lib/import-patients";
import { TYPES_PATIENT, TYPE_PATIENT_LABELS } from "@/lib/constants";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
} from "lucide-react";

type Ligne = {
  matricule: string;
  nom: string;
  prenom: string;
  type: string;
  telephone: string;
};

const vide = (): Ligne => ({
  matricule: "",
  nom: "",
  prenom: "",
  type: "ETUDIANT",
  telephone: "",
});

const cellClass =
  "w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SaisieRapide() {
  const [lignes, setLignes] = useState<Ligne[]>([vide(), vide(), vide()]);
  const [resultat, setResultat] = useState<ResultatImport | null>(null);
  const [pending, startTransition] = useTransition();

  const pretes = useMemo(
    () => lignes.filter((l) => l.matricule && l.nom && l.prenom).length,
    [lignes]
  );

  function maj(i: number, cle: keyof Ligne, valeur: string) {
    setLignes((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [cle]: valeur } : l))
    );
    setResultat(null);
  }

  function ajouter() {
    setLignes((prev) => [...prev, vide()]);
  }

  function retirer(i: number) {
    setLignes((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [vide()]
    );
  }

  function enregistrer() {
    const candidates: LigneBrute[] = lignes
      .filter((l) => l.matricule || l.nom || l.prenom)
      .map((l) => ({
        matricule: l.matricule,
        nom: l.nom,
        prenom: l.prenom,
        type: l.type,
        telephone: l.telephone,
      }));
    if (candidates.length === 0) return;
    setResultat(null);
    startTransition(async () => {
      const r = await importerPatients(candidates);
      setResultat(r);
      // Retire les lignes créées avec succès (par matricule).
      if (r.crees > 0 && r.rejets.length === 0 && r.ignores.length === 0) {
        setLignes([vide(), vide(), vide()]);
      }
    });
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">
                  Matricule <span className="text-destructive">*</span>
                </th>
                <th className="px-3 py-2 font-medium">
                  Nom <span className="text-destructive">*</span>
                </th>
                <th className="px-3 py-2 font-medium">
                  Prénom <span className="text-destructive">*</span>
                </th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Téléphone</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lignes.map((l, i) => (
                <tr key={i}>
                  <td className="px-2 py-1.5">
                    <input
                      className={cellClass}
                      value={l.matricule}
                      onChange={(e) => maj(i, "matricule", e.target.value)}
                      placeholder="N° carte / matricule"
                      aria-label={`Matricule ligne ${i + 1}`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className={cellClass}
                      value={l.nom}
                      onChange={(e) => maj(i, "nom", e.target.value)}
                      aria-label={`Nom ligne ${i + 1}`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className={cellClass}
                      value={l.prenom}
                      onChange={(e) => maj(i, "prenom", e.target.value)}
                      aria-label={`Prénom ligne ${i + 1}`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      className={cellClass}
                      value={l.type}
                      onChange={(e) => maj(i, "type", e.target.value)}
                      aria-label={`Type ligne ${i + 1}`}
                    >
                      {TYPES_PATIENT.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_PATIENT_LABELS[t] ?? t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className={cellClass}
                      value={l.telephone}
                      onChange={(e) => maj(i, "telephone", e.target.value)}
                      aria-label={`Téléphone ligne ${i + 1}`}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => retirer(i)}
                      aria-label={`Retirer la ligne ${i + 1}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border p-4">
          <Button type="button" variant="outline" size="sm" onClick={ajouter}>
            <Plus className="h-4 w-4" />
            Ajouter une ligne
          </Button>
          <span className="text-sm text-muted-foreground">
            {pretes} ligne{pretes > 1 ? "s" : ""} prête{pretes > 1 ? "s" : ""}
          </span>
          <Button
            type="button"
            variant="accent"
            size="sm"
            className="ml-auto"
            loading={pending}
            disabled={pretes === 0 || pending}
            onClick={enregistrer}
          >
            {!pending && <Save className="h-4 w-4" />}
            {pending
              ? "Enregistrement…"
              : `Enregistrer ${pretes} dossier${pretes > 1 ? "s" : ""}`}
          </Button>
        </div>
      </Card>

      {resultat && (
        <Card>
          <CardContent className="space-y-2 p-5">
            {resultat.erreur ? (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" /> {resultat.erreur}
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2 font-medium text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  {resultat.crees} dossier{resultat.crees > 1 ? "s" : ""} enregistré
                  {resultat.crees > 1 ? "s" : ""}.
                </p>
                {resultat.ignores.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Déjà existants :{" "}
                    {resultat.ignores.map((r) => r.matricule).join(", ")}
                  </p>
                )}
                {resultat.rejets.length > 0 && (
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {resultat.rejets.map((r, i) => (
                      <li key={i}>
                        Ligne {r.ligne || "?"}
                        {r.matricule ? ` (${r.matricule})` : ""} —{" "}
                        {r.raisons.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
                {resultat.crees > 0 && (
                  <Link
                    href="/patients"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Voir les dossiers <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
