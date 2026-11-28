import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { estLaborantin, estSoignant } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResultatForm } from "@/components/examens/resultat-form";
import { formatDateHeure } from "@/lib/utils";
import {
  STATUT_EXAMEN_LABELS,
  STATUT_EXAMEN_VARIANTS,
  CATEGORIE_EXAMEN_LABELS,
} from "@/lib/constants";
import { ArrowLeft, FlaskConical } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DemandeExamenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  const e = await prisma.demandeExamen.findUnique({
    where: { id },
    include: {
      patient: true,
      medecin: true,
      resultat: { include: { laborantin: true } },
    },
  });
  if (!e) notFound();

  const peutSaisir =
    (estLaborantin(user) || estSoignant(user)) && e.statut !== "ANNULE";

  return (
    <div className="max-w-3xl">
      <Link
        href="/examens"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux examens
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{e.type}</h1>
                <Badge variant="neutral">
                  {CATEGORIE_EXAMEN_LABELS[e.categorie] ?? e.categorie}
                </Badge>
                {e.priorite === "URGENTE" && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <Link
                  href={`/patients/${e.patientId}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {e.patient.prenom} {e.patient.nom}
                </Link>{" "}
                · Prescrit par Dr {e.medecin.prenom} {e.medecin.nom} ·{" "}
                {formatDateHeure(e.date)}
              </p>
              {e.motif && (
                <p className="mt-2 text-sm text-foreground">{e.motif}</p>
              )}
            </div>
            <Badge variant={STATUT_EXAMEN_VARIANTS[e.statut]}>
              {STATUT_EXAMEN_LABELS[e.statut] ?? e.statut}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {e.resultat ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Résultat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {e.resultat.valeurs && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Valeurs
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-foreground">
                  {e.resultat.valeurs}
                </p>
              </div>
            )}
            {e.resultat.conclusion && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Conclusion
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-foreground">
                  {e.resultat.conclusion}
                </p>
              </div>
            )}
            {e.resultat.documentUrl && (
              <a
                href={e.resultat.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-primary hover:underline"
              >
                Document joint
              </a>
            )}
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              Saisi le {formatDateHeure(e.resultat.date)}
              {e.resultat.laborantin
                ? ` par ${e.resultat.laborantin.prenom} ${e.resultat.laborantin.nom}`
                : ""}
            </p>
          </CardContent>
        </Card>
      ) : peutSaisir ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Saisir le résultat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResultatForm demandeId={e.id} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Résultat non encore disponible.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
