import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { initiales, formatDate } from "@/lib/utils";
import { Share2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUT_ORIENTATION: Record<
  string,
  { label: string; variant: "info" | "success" | "neutral" }
> = {
  EN_ATTENTE: { label: "En attente", variant: "info" },
  REALISEE: { label: "Réalisée", variant: "success" },
  ANNULEE: { label: "Annulée", variant: "neutral" },
};

export default async function OrientationsPage() {
  const orientations = await prisma.orientation.findMany({
    include: { patient: true, medecin: true },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Orientations"
        description="Redirections des patients vers des services ou spécialistes externes."
      />

      {orientations.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="Aucune orientation"
          description="Les orientations vers des spécialistes ou structures externes apparaîtront ici."
        />
      ) : (
        <Card>
          <CardContent className="p-2">
            <ul className="divide-y divide-border">
              {orientations.map((o) => {
                const st =
                  STATUT_ORIENTATION[o.statut] ?? STATUT_ORIENTATION.EN_ATTENTE;
                return (
                  <li key={o.id} className="px-3 py-3">
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/patients/${o.patientId}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold hover:opacity-80"
                      >
                        {initiales(o.patient.prenom, o.patient.nom)}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {o.patient.prenom} {o.patient.nom}
                          </span>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground">
                          <ArrowRight className="h-3.5 w-3.5 text-primary" />
                          {o.serviceCible}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {o.motif}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(o.date)} · Dr {o.medecin.prenom}{" "}
                          {o.medecin.nom}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
