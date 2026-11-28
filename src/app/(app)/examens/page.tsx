import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { estSoignant } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { initiales, formatDate } from "@/lib/utils";
import {
  STATUT_EXAMEN_LABELS,
  STATUT_EXAMEN_VARIANTS,
  CATEGORIE_EXAMEN_LABELS,
} from "@/lib/constants";
import { FlaskConical, Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

function filtreClass(actif: boolean) {
  return `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    actif
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-foreground hover:bg-muted"
  }`;
}

export default async function ExamensPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f } = await searchParams;
  const user = await getSessionUser();
  const aTraiter = f === "a-traiter";

  const demandes = await prisma.demandeExamen.findMany({
    where: aTraiter ? { statut: { in: ["DEMANDE", "EN_COURS"] } } : {},
    include: { patient: true, medecin: true, resultat: true },
    orderBy: [{ priorite: "desc" }, { date: "desc" }],
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Examens"
        description="Demandes d'examens de laboratoire et d'imagerie."
      >
        {estSoignant(user) && (
          <Link href="/examens/nouvelle">
            <Button variant="accent">
              <Plus className="h-4 w-4" />
              Nouvelle demande
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className="mb-4 flex gap-2">
        <Link href="/examens" className={filtreClass(!aTraiter)}>
          Toutes
        </Link>
        <Link href="/examens?f=a-traiter" className={filtreClass(aTraiter)}>
          À traiter
        </Link>
      </div>

      <Card>
        <CardContent className="p-2">
          {demandes.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="Aucune demande"
              description="Les demandes d'examens apparaîtront ici."
            />
          ) : (
            <ul className="divide-y divide-border">
              {demandes.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/examens/${e.id}`}
                    className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-muted/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {initiales(e.patient.prenom, e.patient.nom)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {e.type}
                        </span>
                        <Badge variant="neutral">
                          {CATEGORIE_EXAMEN_LABELS[e.categorie] ?? e.categorie}
                        </Badge>
                        {e.priorite === "URGENTE" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.patient.prenom} {e.patient.nom} · Dr {e.medecin.nom} ·{" "}
                        {formatDate(e.date)}
                      </p>
                    </div>
                    <Badge variant={STATUT_EXAMEN_VARIANTS[e.statut]}>
                      {STATUT_EXAMEN_LABELS[e.statut] ?? e.statut}
                    </Badge>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
