import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { initiales, age, formatDate } from "@/lib/utils";
import { TYPE_PATIENT_LABELS } from "@/lib/constants";
import { UserPlus, Search, Users, Phone, FileText } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const recherche = q?.trim();

  const where: Prisma.PatientWhereInput = recherche
    ? {
        OR: [
          { nom: { contains: recherche } },
          { prenom: { contains: recherche } },
          { matricule: { contains: recherche } },
        ],
      }
    : {};

  const patients = await prisma.patient.findMany({
    where,
    include: { dossier: true, _count: { select: { consultations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Dossiers médicaux"
        description="Gérez les dossiers des étudiants et personnels de l'UCAD."
      >
        <Link href="/patients/nouveau">
          <Button variant="accent">
            <UserPlus className="h-4 w-4" />
            Nouveau patient
          </Button>
        </Link>
      </PageHeader>

      <form className="mb-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={recherche}
            placeholder="Rechercher par nom, prénom ou matricule…"
            className="flex h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </div>
      </form>

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            recherche ? "Aucun patient trouvé" : "Aucun patient enregistré"
          }
          description={
            recherche
              ? "Essayez un autre terme de recherche."
              : "Commencez par enregistrer votre premier patient."
          }
        >
          {!recherche && (
            <Link href="/patients/nouveau">
              <Button variant="accent">
                <UserPlus className="h-4 w-4" />
                Nouveau patient
              </Button>
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {patients.length} patient{patients.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {patients.map((p) => (
              <Link key={p.id} href={`/patients/${p.id}`}>
                <Card className="h-full p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {initiales(p.prenom, p.nom)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {p.prenom} {p.nom}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.matricule} · {age(p.dateNaissance)}
                      </p>
                    </div>
                    <Badge variant="primary">
                      {TYPE_PATIENT_LABELS[p.type] ?? p.type}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {p.dossier?.numeroDossier && (
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {p.dossier.numeroDossier}
                      </span>
                    )}
                    {p.telephone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {p.telephone}
                      </span>
                    )}
                  </div>
                  {p.dossier?.groupeSanguin || p._count.consultations > 0 ? (
                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                      {p.dossier?.groupeSanguin && (
                        <Badge variant="destructive">
                          {p.dossier.groupeSanguin}
                        </Badge>
                      )}
                      {p._count.consultations > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {p._count.consultations} consultation
                          {p._count.consultations > 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        Inscrit le {formatDate(p.createdAt)}
                      </span>
                    </div>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
