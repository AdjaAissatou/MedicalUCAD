import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { AnimatedNumber } from "@/components/animated-number";
import { formatHeure, initiales } from "@/lib/utils";
import { STATUT_RDV_LABELS, STATUT_RDV_VARIANTS } from "@/lib/constants";
import {
  Users,
  CalendarCheck,
  Stethoscope,
  Pill,
  CalendarClock,
  ArrowRight,
  TriangleAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

function debutFinJour() {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 1);
  return { debut, fin };
}

export default async function TableauDeBord() {
  const user = await getSessionUser();
  const { debut, fin } = debutFinJour();

  const [
    nbPatients,
    nbRdvJour,
    nbConsultationsMois,
    rdvJour,
    stockFaible,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.rendezVous.count({
      where: { dateHeure: { gte: debut, lt: fin } },
    }),
    prisma.consultation.count({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.rendezVous.findMany({
      where: { dateHeure: { gte: debut, lt: fin } },
      include: { patient: true, medecin: true },
      orderBy: { dateHeure: "asc" },
      take: 8,
    }),
    prisma.medicament.findMany({
      where: { stock: { lte: prisma.medicament.fields.seuilAlerte } },
      take: 5,
      orderBy: { stock: "asc" },
    }),
  ]);

  const stats = [
    {
      label: "Patients enregistrés",
      value: nbPatients,
      icon: Users,
      href: "/patients",
      color: "text-primary bg-primary/10",
    },
    {
      label: "Rendez-vous aujourd'hui",
      value: nbRdvJour,
      icon: CalendarCheck,
      href: "/rendez-vous",
      color: "text-accent bg-accent/10",
    },
    {
      label: "Consultations ce mois",
      value: nbConsultationsMois,
      icon: Stethoscope,
      href: "/consultations",
      color: "text-cyan-700 bg-cyan-100",
    },
    {
      label: "Alertes de stock",
      value: stockFaible.length,
      icon: Pill,
      href: "/pharmacie",
      color: "text-amber-700 bg-amber-100",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${user?.prenom} 👋`}
        description="Voici un aperçu de l'activité du service médical aujourd'hui."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} index={i}>
            <Link href={s.href}>
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.color}`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-foreground">
                    <AnimatedNumber value={s.value} />
                  </p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Rendez-vous du jour */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">
                Rendez-vous du jour
              </h2>
            </div>
            <Link
              href="/rendez-vous"
              className="text-sm font-medium text-primary hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <CardContent className="p-2">
            {rdvJour.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Aucun rendez-vous aujourd'hui"
                description="Les rendez-vous planifiés pour aujourd'hui apparaîtront ici."
              />
            ) : (
              <ul className="divide-y divide-border">
                {rdvJour.map((rdv) => (
                  <li
                    key={rdv.id}
                    className="flex items-center gap-4 px-3 py-3"
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center">
                      <span className="text-sm font-semibold text-primary">
                        {formatHeure(rdv.dateHeure)}
                      </span>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                      {initiales(rdv.patient.prenom, rdv.patient.nom)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {rdv.patient.prenom} {rdv.patient.nom}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {rdv.motif ?? "Consultation"} · Dr {rdv.medecin.nom}
                      </p>
                    </div>
                    <Badge variant={STATUT_RDV_VARIANTS[rdv.statut]}>
                      {STATUT_RDV_LABELS[rdv.statut] ?? rdv.statut}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Alertes stock pharmacie */}
        <Card>
          <div className="flex items-center gap-2 border-b border-border p-5">
            <TriangleAlert className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-foreground">Alertes pharmacie</h2>
          </div>
          <CardContent className="p-2">
            {stockFaible.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="Stock sous contrôle"
                description="Aucun médicament sous le seuil d'alerte."
              />
            ) : (
              <ul className="divide-y divide-border">
                {stockFaible.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {m.nom}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.dosage ?? m.forme ?? "—"}
                      </p>
                    </div>
                    <Badge variant={m.stock === 0 ? "destructive" : "warning"}>
                      {m.stock} restant{m.stock > 1 ? "s" : ""}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
