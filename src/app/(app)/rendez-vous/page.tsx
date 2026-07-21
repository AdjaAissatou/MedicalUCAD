import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { StatutSelect } from "@/components/rendez-vous/statut-select";
import { initiales, formatHeure } from "@/lib/utils";
import { STATUT_RDV_LABELS, STATUT_RDV_VARIANTS } from "@/lib/constants";
import {
  CalendarPlus,
  CalendarDays,
  Clock,
  Filter,
  Stethoscope,
} from "lucide-react";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const FILTRES = [
  { key: "a-venir", label: "À venir" },
  { key: "aujourdhui", label: "Aujourd'hui" },
  { key: "tous", label: "Tous" },
];

function bornesFiltre(filtre: string): Prisma.RendezVousWhereInput {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  const finJour = new Date(debut);
  finJour.setDate(finJour.getDate() + 1);

  if (filtre === "aujourdhui") {
    return { dateHeure: { gte: debut, lt: finJour } };
  }
  if (filtre === "tous") return {};
  return { dateHeure: { gte: debut } }; // à-venir (défaut)
}

function cleJour(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function RendezVousPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre = "a-venir" } = await searchParams;

  const rdvs = await prisma.rendezVous.findMany({
    where: bornesFiltre(filtre),
    include: { patient: true, medecin: true },
    orderBy: { dateHeure: filtre === "tous" ? "desc" : "asc" },
  });

  // Regroupement par jour
  const groupes = new Map<string, typeof rdvs>();
  for (const rdv of rdvs) {
    const cle = cleJour(rdv.dateHeure);
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push(rdv);
  }

  return (
    <div>
      <PageHeader
        title="Rendez-vous"
        description="Planifiez et suivez les rendez-vous du service médical."
      >
        <Link href="/rendez-vous/nouveau">
          <Button variant="accent">
            <CalendarPlus className="h-4 w-4" />
            Nouveau rendez-vous
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-5 flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-1.5">
          {FILTRES.map((f) => (
            <Link key={f.key} href={`/rendez-vous?filtre=${f.key}`}>
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  filtre === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {rdvs.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Aucun rendez-vous"
          description="Aucun rendez-vous ne correspond à ce filtre."
        >
          <Link href="/rendez-vous/nouveau">
            <Button variant="accent">
              <CalendarPlus className="h-4 w-4" />
              Planifier un rendez-vous
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {[...groupes.entries()].map(([jour, liste]) => (
            <div key={jour}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold capitalize text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                {jour}
                <span className="font-normal text-muted-foreground">
                  ({liste.length})
                </span>
              </h2>
              <Card>
                <CardContent className="p-2">
                  <ul className="divide-y divide-border">
                    {liste.map((rdv) => (
                      <li
                        key={rdv.id}
                        className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center"
                      >
                        <div className="flex w-24 shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                          <Clock className="h-4 w-4" />
                          {formatHeure(rdv.dateHeure)}
                        </div>
                        <Link
                          href={`/patients/${rdv.patientId}`}
                          className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                            {initiales(rdv.patient.prenom, rdv.patient.nom)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {rdv.patient.prenom} {rdv.patient.nom}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {rdv.motif ?? "Consultation"} · {rdv.duree} min ·
                              Dr {rdv.medecin.nom}
                            </p>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 sm:ml-auto">
                          <Badge variant={STATUT_RDV_VARIANTS[rdv.statut]}>
                            {STATUT_RDV_LABELS[rdv.statut] ?? rdv.statut}
                          </Badge>
                          <StatutSelect id={rdv.id} statut={rdv.statut} />
                          {rdv.statut !== "TERMINE" &&
                            rdv.statut !== "ANNULE" && (
                              <Link
                                href={`/consultations/nouvelle?rdv=${rdv.id}`}
                                title="Démarrer la consultation"
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-primary hover:bg-secondary"
                              >
                                <Stethoscope className="h-4 w-4" />
                              </Link>
                            )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
