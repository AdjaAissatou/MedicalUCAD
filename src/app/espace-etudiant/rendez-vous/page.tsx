import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { AnnulerRdvButton } from "@/components/etudiant/annuler-rdv-button";
import { formatDateHeure } from "@/lib/utils";
import { STATUT_RDV_LABELS, STATUT_RDV_VARIANTS } from "@/lib/constants";
import { CalendarPlus, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MesRendezVous() {
  const user = await getSessionUser();
  const patientId = user!.patientId!;
  const now = new Date();

  const rdvs = await prisma.rendezVous.findMany({
    where: { patientId },
    include: { medecin: true },
    orderBy: { dateHeure: "desc" },
  });

  const aVenir = rdvs
    .filter((r) => r.dateHeure >= now && r.statut !== "ANNULE" && r.statut !== "TERMINE")
    .sort((a, b) => a.dateHeure.getTime() - b.dateHeure.getTime());
  const passes = rdvs.filter((r) => !aVenir.includes(r));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mes rendez-vous
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez et gérez vos rendez-vous.
          </p>
        </div>
        <Link
          href="/espace-etudiant/rendez-vous/nouveau"
          className={buttonVariants({ variant: "accent" })}
        >
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Prendre RDV</span>
        </Link>
      </div>

      {rdvs.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Aucun rendez-vous"
          description="Prenez votre premier rendez-vous en quelques secondes."
        >
          <Link
            href="/espace-etudiant/rendez-vous/nouveau"
            className={buttonVariants({ variant: "accent" })}
          >
            <CalendarPlus className="h-4 w-4" />
            Prendre un rendez-vous
          </Link>
        </EmptyState>
      ) : (
        <>
          {aVenir.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                À venir
              </h2>
              <div className="space-y-2">
                {aVenir.map((rdv, i) => (
                  <Reveal key={rdv.id} index={i} variant="fade">
                    <Card>
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {formatDateHeure(rdv.dateHeure)}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {rdv.motif ?? "Consultation"} · Dr{" "}
                            {rdv.medecin.prenom} {rdv.medecin.nom}
                          </p>
                          <Badge
                            variant={STATUT_RDV_VARIANTS[rdv.statut]}
                            dot
                            className="mt-2"
                          >
                            {STATUT_RDV_LABELS[rdv.statut]}
                          </Badge>
                        </div>
                        <AnnulerRdvButton rdvId={rdv.id} />
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {passes.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Historique
              </h2>
              <Card>
                <CardContent className="p-2">
                  <ul className="divide-y divide-border">
                    {passes.map((rdv) => (
                      <li
                        key={rdv.id}
                        className="flex items-center justify-between gap-3 px-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {formatDateHeure(rdv.dateHeure)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {rdv.motif ?? "Consultation"} · Dr {rdv.medecin.nom}
                          </p>
                        </div>
                        <Badge variant={STATUT_RDV_VARIANTS[rdv.statut]}>
                          {STATUT_RDV_LABELS[rdv.statut]}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}
