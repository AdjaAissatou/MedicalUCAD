import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { AnimatedNumber } from "@/components/animated-number";
import { STATUT_RDV_LABELS } from "@/lib/constants";
import {
  Users,
  Stethoscope,
  CalendarDays,
  Share2,
  Pill,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupervisionPage() {
  const [
    nbPatients,
    nbConsultations,
    nbRdv,
    nbOrientations,
    nbMedicaments,
    rdvParStatut,
    consultations,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.consultation.count(),
    prisma.rendezVous.count(),
    prisma.orientation.count(),
    prisma.medicament.count(),
    prisma.rendezVous.groupBy({ by: ["statut"], _count: true }),
    prisma.consultation.findMany({ select: { date: true } }),
  ]);

  const kpis = [
    { label: "Patients suivis", value: nbPatients, icon: Users },
    { label: "Consultations", value: nbConsultations, icon: Stethoscope },
    { label: "Rendez-vous", value: nbRdv, icon: CalendarDays },
    { label: "Orientations", value: nbOrientations, icon: Share2 },
    { label: "Médicaments", value: nbMedicaments, icon: Pill },
  ];

  const totalRdv = rdvParStatut.reduce((acc, r) => acc + r._count, 0) || 1;

  // Consultations des 6 derniers mois (agrégées).
  const maintenant = new Date();
  const mois: { cle: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    mois.push({
      cle: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      count: 0,
    });
  }
  for (const c of consultations) {
    const d = new Date(c.date);
    const m = mois.find((x) => x.cle === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.count++;
  }
  const maxMois = Math.max(1, ...mois.map((m) => m.count));

  return (
    <div>
      <PageHeader
        title="Supervision"
        description="Indicateurs d'activité agrégés — aucune donnée nominative."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <BarChart3 className="h-4 w-4" />
          Direction
        </span>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k, i) => (
          <Reveal key={k.label} index={i}>
            <Card>
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <k.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  <AnimatedNumber value={k.value} />
                </p>
                <p className="text-sm text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Répartition des rendez-vous par statut */}
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-foreground">
              Rendez-vous par statut
            </h2>
          </div>
          <CardContent className="space-y-3 p-5">
            {rdvParStatut.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun rendez-vous enregistré.
              </p>
            ) : (
              rdvParStatut.map((r) => {
                const pct = Math.round((r._count / totalRdv) * 100);
                return (
                  <div key={r.statut}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {STATUT_RDV_LABELS[r.statut] ?? r.statut}
                      </span>
                      <span className="text-muted-foreground">
                        {r._count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Consultations par mois */}
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-foreground">
              Consultations par mois
            </h2>
          </div>
          <CardContent className="space-y-3 p-5">
            {mois.map((m) => {
              const pct = Math.round((m.count / maxMois) * 100);
              return (
                <div key={m.cle}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-foreground">{m.label}</span>
                    <span className="text-muted-foreground">{m.count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-emerald"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
