"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  COLONNES_IMPORT,
  lignesDepuisCSV,
  validerLigne,
  modeleCSV,
} from "@/lib/import-patients";
import { importerPatients, type ResultatImport } from "@/app/actions/import-patients";
import { TYPE_PATIENT_LABELS } from "@/lib/constants";
import {
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  ClipboardPaste,
  ArrowRight,
} from "lucide-react";

const MODELE_HREF =
  "data:text/csv;charset=utf-8," + encodeURIComponent(modeleCSV());

export function ImportPatientsForm() {
  const [texte, setTexte] = useState("");
  const [resultat, setResultat] = useState<ResultatImport | null>(null);
  const [pending, startTransition] = useTransition();
  const inputFichier = useRef<HTMLInputElement>(null);

  const { brutes, validees, nbValides, nbErreurs } = useMemo(() => {
    const brutes = lignesDepuisCSV(texte);
    const validees = brutes.map((b, i) => validerLigne(b, i + 1));
    return {
      brutes,
      validees,
      nbValides: validees.filter((v) => v.data).length,
      nbErreurs: validees.filter((v) => !v.data).length,
    };
  }, [texte]);

  async function chargerFichier(f: File) {
    const contenu = await f.text();
    setTexte(contenu);
    setResultat(null);
  }

  function lancerImport() {
    setResultat(null);
    startTransition(async () => {
      const r = await importerPatients(brutes);
      setResultat(r);
    });
  }

  return (
    <div className="space-y-5">
      {/* Consignes + modèle */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Format attendu</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Un fichier CSV avec une ligne d’en-tête. Seuls{" "}
                <strong className="text-foreground">Matricule, Nom, Prénom</strong>{" "}
                sont obligatoires.
              </p>
            </div>
            <a href={MODELE_HREF} download="modele-patients-ucad.csv">
              <Button type="button" variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Modèle CSV
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COLONNES_IMPORT.map((c) => (
              <Badge key={c.cle} variant={c.requis ? "primary" : "neutral"}>
                {c.libelle}
                {c.requis ? " *" : ""}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dépôt du fichier / collage */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputFichier}
              type="file"
              accept=".csv,.tsv,.txt,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) chargerFichier(f);
              }}
            />
            <Button
              type="button"
              variant="accent"
              onClick={() => inputFichier.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Choisir un fichier CSV
            </Button>
            <span className="text-sm text-muted-foreground">
              ou collez les lignes ci-dessous
            </span>
          </div>

          <div>
            <label
              htmlFor="csv"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
              Coller depuis Excel / un tableur
            </label>
            <textarea
              id="csv"
              value={texte}
              onChange={(e) => {
                setTexte(e.target.value);
                setResultat(null);
              }}
              rows={6}
              placeholder={
                "Matricule,Nom,Prénom,Type,Date de naissance,Sexe,Téléphone,Email,Faculté,Groupe sanguin\n20231234,Diop,Awa,Étudiant,12/05/2003,F,77 123 45 67,awa.diop@ucad.edu.sn,FST,O+"
              }
              className="w-full rounded-md border border-input bg-card p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Aperçu */}
      {brutes.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <p className="text-sm font-medium text-foreground">
              Aperçu — {brutes.length} ligne{brutes.length > 1 ? "s" : ""} lue
              {brutes.length > 1 ? "s" : ""}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> {nbValides} valide
              {nbValides > 1 ? "s" : ""}
            </span>
            {nbErreurs > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" /> {nbErreurs} à corriger
              </span>
            )}
            <Button
              type="button"
              variant="accent"
              size="sm"
              className="ml-auto"
              loading={pending}
              disabled={nbValides === 0 || pending}
              onClick={lancerImport}
            >
              {pending
                ? "Import en cours…"
                : `Importer ${nbValides} dossier${nbValides > 1 ? "s" : ""}`}
            </Button>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Matricule</th>
                  <th className="px-3 py-2 font-medium">Nom</th>
                  <th className="px-3 py-2 font-medium">Prénom</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {validees.slice(0, 200).map((v) => (
                  <tr key={v.ligne} className={v.data ? "" : "bg-destructive/5"}>
                    <td className="px-3 py-2 text-muted-foreground">{v.ligne}</td>
                    <td className="px-3 py-2 font-medium text-foreground">
                      {v.brut.matricule || "—"}
                    </td>
                    <td className="px-3 py-2">{v.brut.nom || "—"}</td>
                    <td className="px-3 py-2">{v.brut.prenom || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {v.data
                        ? TYPE_PATIENT_LABELS[v.data.type] ?? v.data.type
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {v.data ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Valide
                        </span>
                      ) : (
                        <span className="text-xs text-destructive">
                          {v.erreurs.join(" · ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {validees.length > 200 && (
              <p className="p-3 text-center text-xs text-muted-foreground">
                Aperçu limité à 200 lignes — l’import les traitera toutes.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Résultat */}
      {resultat && (
        <Card>
          <CardContent className="space-y-3 p-5">
            {resultat.erreur ? (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" /> {resultat.erreur}
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2 font-medium text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  {resultat.crees} dossier{resultat.crees > 1 ? "s" : ""} importé
                  {resultat.crees > 1 ? "s" : ""}.
                </p>
                {resultat.ignores.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {resultat.ignores.length} ignoré(s) — déjà existants :{" "}
                    {resultat.ignores.map((r) => r.matricule).join(", ")}
                  </p>
                )}
                {resultat.rejets.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-destructive">
                      {resultat.rejets.length} rejeté(s) :
                    </p>
                    <ul className="mt-1 list-inside list-disc">
                      {resultat.rejets.slice(0, 20).map((r, i) => (
                        <li key={i}>
                          Ligne {r.ligne || "?"}
                          {r.matricule ? ` (${r.matricule})` : ""} —{" "}
                          {r.raisons.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
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
