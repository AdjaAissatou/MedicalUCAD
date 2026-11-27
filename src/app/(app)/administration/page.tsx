import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { AnimatedNumber } from "@/components/animated-number";
import { ROLE_LABELS } from "@/lib/constants";
import {
  Users,
  UserCog,
  CalendarDays,
  Stethoscope,
  Share2,
  Pill,
  ArrowRight,
  Settings,
  ShieldCheck,
  ScrollText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  const [
    nbUsers,
    nbPatients,
    nbRdv,
    nbConsultations,
    nbOrientations,
    nbMedicaments,
    parRole,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.patient.count(),
    prisma.rendezVous.count(),
    prisma.consultation.count(),
    prisma.orientation.count(),
    prisma.medicament.count(),
    prisma.user.groupBy({ by: ["role"], _count: true }),
  ]);

  const stats = [
    { label: "Utilisateurs", value: nbUsers, icon: UserCog, href: "/administration/utilisateurs" },
    { label: "Patients", value: nbPatients, icon: Users, href: "/patients" },
    { label: "Rendez-vous", value: nbRdv, icon: CalendarDays, href: "/rendez-vous" },
    { label: "Consultations", value: nbConsultations, icon: Stethoscope, href: "/consultations" },
    { label: "Orientations", value: nbOrientations, icon: Share2, href: "/orientations" },
    { label: "Médicaments", value: nbMedicaments, icon: Pill, href: "/pharmacie" },
  ];

  const gestion = [
    {
      titre: "Utilisateurs & rôles",
      desc: "Créer, modifier, activer ou désactiver les comptes du personnel.",
      href: "/administration/utilisateurs",
      icon: UserCog,
    },
    {
      titre: "Journal d'audit",
      desc: "Consulter la traçabilité des accès et des modifications.",
      href: "/administration/journal",
      icon: ScrollText,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Administration"
        description="Pilotez l'ensemble de la plateforme UCAD Medical."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4" />
          Accès administrateur
        </span>
      </PageHeader>

      {/* Statistiques globales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (
          <Reveal key={s.label} index={i}>
            <Card>
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  <AnimatedNumber value={s.value} />
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Cartes de gestion */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Settings className="h-4 w-4 text-primary" />
            Gestion de la plateforme
          </h2>
          <div className="grid gap-3 sm:grid-cols-1">
            {gestion.map((g, i) => (
              <Reveal key={g.href} index={i} variant="fade">
                <Link href={g.href}>
                  <Card className="card-hover">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        <g.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{g.titre}</p>
                        <p className="text-sm text-muted-foreground">
                          {g.desc}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Répartition par rôle */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Répartition du personnel
          </h2>
          <Card>
            <CardContent className="p-5 space-y-3">
              {parRole.map((r) => (
                <div
                  key={r.role}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-foreground">
                    {ROLE_LABELS[r.role] ?? r.role}
                  </span>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-sm font-semibold text-primary">
                    {r._count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
