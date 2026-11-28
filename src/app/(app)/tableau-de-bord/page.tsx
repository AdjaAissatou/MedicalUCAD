import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule } from "@/lib/authz";
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
  CalendarPlus,
  UserPlus,
  Share2,
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

  const [nbPatients, nbRdvJour, nbConsultationsMois, rdvJour, stockFaible] =
    await Promise.all([
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

  // Cartes filtrées selon les modules accessibles au rôle.
  const toutesStats = [
    {
      label: "Patients enregistrés",
      value: nbPatients,
      icon: Users,
      href: "/patients",
      cle: "patients" as const,
      color: "text-primary bg-primary/10",
      accent: "from-[#2dd4bf] to-[#087f72]",
    },
    {
      label: "Rendez-vous aujourd'hui",
      value: nbRdvJour,
      icon: CalendarCheck,
      href: "/rendez-vous",
      cle: "rendez-vous" as const,
      color: "text-gold bg-gold/15",
      accent: "from-[#e7c377] to-[#cf9f52]",
    },
    {
      label: "Consultations ce mois",
      value: nbConsultationsMois,
      icon: Stethoscope,
      href: "/consultations",
      cle: "consultations" as const,
      color: "text-emerald bg-mint",
      accent: "from-[#12907f] to-[#123b35]",
    },
    {
      label: "Alertes de stock",
      value: stockFaible.length,
      icon: Pill,
      href: "/pharmacie",
      cle: "pharmacie" as const,
      color: "text-amber-600 bg-amber-500/15",
      accent: "from-[#f0b65a] to-[#e2922f]",
    },
  ];
  const stats = toutesStats.filter((s) => peutAccederModule(user, s.cle));
  const voitRdv = peutAccederModule(user, "rendez-vous");
  const voitPharma = peutAccederModule(user, "pharmacie");

  const colsStats =
    stats.length >= 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : stats.length === 3
        ? "sm:grid-cols-3"
        : stats.length === 2
          ? "sm:grid-cols-2"
          : "sm:grid-cols-1";

  const actions = [
    { href: "/consultations/nouvelle", label: "Nouvelle consultation", icon: Stethoscope, cle: "consultations" as const },
    { href: "/rendez-vous/nouveau", label: "Nouveau rendez-vous", icon: CalendarPlus, cle: "rendez-vous" as const },
    { href: "/patients/nouveau", label: "Nouveau dossier", icon: UserPlus, cle: "patients" as const },
    { href: "/orientations/nouvelle", label: "Nouvelle orientation", icon: Share2, cle: "orientations" as const },
    { href: "/pharmacie/nouveau", label: "Ajouter un médicament", icon: Pill, cle: "pharmacie" as const },
  ].filter((a) => peutAccederModule(user, a.cle));

  return (
    <div>
      {/* En-tête premium */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#123b35] p-6 sm:p-8 text-white rise">
        <div className="aurora opacity-70" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative">
          <p className="text-sm text-white/60">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Bonjour, {user?.prenom} 👋
          </h1>
          <p className="mt-1 text-white/70">
            Voici un aperçu de l&apos;activité du service médical aujourd&apos;hui.
          </p>
        </div>
      </div>

      {stats.length > 0 && (
        <div className={`grid gap-4 ${colsStats}`}>
          {stats.map((s, i) => (
            <Reveal key={s.label} index={i}>
              <Link href={s.href}>
                <Card className="card-hover group relative overflow-hidden">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.accent}`}
                  />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${s.color}`}
                      >
                        <s.icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
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
      )}

      {actions.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Accès rapides
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {a.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {voitRdv || voitPharma ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {voitRdv && (
            <Card className={voitPharma ? "lg:col-span-2" : "lg:col-span-3"}>
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
          )}

          {voitPharma && (
            <Card className={voitRdv ? "" : "lg:col-span-3"}>
              <div className="flex items-center gap-2 border-b border-border p-5">
                <TriangleAlert className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold text-foreground">
                  Alertes pharmacie
                </h2>
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
          )}
        </div>
      ) : stats.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="Bienvenue sur UCAD Medical"
          description="Votre tableau de bord s'enrichira avec les modules liés à votre rôle."
        />
      ) : null}
    </div>
  );
}
