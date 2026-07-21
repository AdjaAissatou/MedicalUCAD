import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { OrientationStatut } from "@/components/orientations/orientation-statut";
import { initiales, formatDate } from "@/lib/utils";
import { Share2, ArrowRight, Plus } from "lucide-react";

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
      >
        <Link href="/orientations/nouvelle">
          <Button variant="accent">
            <Plus className="h-4 w-4" />
            Nouvelle orientation
          </Button>
        </Link>
      </PageHeader>

      {orientations.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="Aucune orientation"
          description="Les orientations vers des spécialistes ou structures externes apparaîtront ici."
        >
          <Link href="/orientations/nouvelle">
            <Button variant="accent">
              <Plus className="h-4 w-4" />
              Nouvelle orientation
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <Card>
          <CardContent className="p-2">
            <ul className="divide-y divide-border">
              {orientations.map((o, i) => {
                const st =
                  STATUT_ORIENTATION[o.statut] ?? STATUT_ORIENTATION.EN_ATTENTE;
                return (
                  <Reveal as="li" key={o.id} index={i} variant="fade" className="px-3 py-3">
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
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={st.variant}>{st.label}</Badge>
                            <OrientationStatut id={o.id} statut={o.statut} />
                          </div>
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
                  </Reveal>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
