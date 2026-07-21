import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { formatDateHeure, formatDate } from "@/lib/utils";
import { STATUT_RDV_LABELS, STATUT_RDV_VARIANTS } from "@/lib/constants";
import {
  CalendarPlus,
  CalendarClock,
  FileHeart,
  Stethoscope,
  TriangleAlert,
  ArrowRight,
  Droplet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccueilEtudiant() {
  const user = await getSessionUser();
  const patientId = user!.patientId!;

  const now = new Date();
  const [patient, prochainRdv, nbConsultations] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      include: { dossier: true },
    }),
    prisma.rendezVous.findFirst({
      where: {
        patientId,
        dateHeure: { gte: now },
        statut: { in: ["PLANIFIE", "CONFIRME"] },
      },
      include: { medecin: true },
      orderBy: { dateHeure: "asc" },
    }),
    prisma.consultation.count({ where: { patientId } }),
  ]);

  const d = patient?.dossier;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-[#062e2c] p-6 text-white">
          <div className="aurora opacity-70" aria-hidden>
            <span /><span /><span />
          </div>
          <div className="relative">
            <p className="text-sm text-white/60">Bonjour 👋</p>
            <h1 className="mt-1 text-2xl font-bold">
              {user!.prenom} {user!.nom}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Bienvenue dans votre espace santé UCAD.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Prochain rendez-vous */}
      <Reveal index={1}>
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">
                Prochain rendez-vous
              </h2>
            </div>
            {prochainRdv ? (
              <Link
                href="/espace-etudiant/rendez-vous"
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {formatDateHeure(prochainRdv.dateHeure)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {prochainRdv.motif ?? "Consultation"} · Dr{" "}
                    {prochainRdv.medecin.prenom} {prochainRdv.medecin.nom}
                  </p>
                </div>
                <Badge variant={STATUT_RDV_VARIANTS[prochainRdv.statut]} dot>
                  {STATUT_RDV_LABELS[prochainRdv.statut]}
                </Badge>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun rendez-vous à venir.
                </p>
                <Link
                  href="/espace-etudiant/rendez-vous/nouveau"
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Prendre un rendez-vous
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* Actions rapides */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Reveal index={2}>
          <Link href="/espace-etudiant/rendez-vous/nouveau" className="block h-full">
            <Card className="card-hover h-full">
              <CardContent className="flex items-center gap-3 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <CalendarPlus className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Prendre rendez-vous
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Choisissez un médecin et un créneau
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </Reveal>
        <Reveal index={3}>
          <Link href="/espace-etudiant/dossier" className="block h-full">
            <Card className="card-hover h-full">
              <CardContent className="flex items-center gap-3 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileHeart className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Mon dossier</p>
                  <p className="text-xs text-muted-foreground">
                    Antécédents, allergies, groupe sanguin
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </Reveal>
      </div>

      {/* Aperçu santé */}
      <Reveal index={4}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplet className="h-4 w-4" /> Groupe sanguin
              </div>
              <p className="mt-1 text-lg font-bold text-foreground">
                {d?.groupeSanguin ?? "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Stethoscope className="h-4 w-4" /> Consultations
              </div>
              <p className="mt-1 text-lg font-bold text-foreground">
                {nbConsultations}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TriangleAlert className="h-4 w-4 text-amber-600" /> Allergies
              </div>
              <p className="mt-1 text-sm font-medium text-foreground line-clamp-2">
                {d?.allergies?.trim() ? d.allergies : "Aucune connue"}
              </p>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      <p className="text-center text-xs text-muted-foreground">
        Dossier créé le {patient ? formatDate(patient.createdAt) : "—"}
      </p>
    </div>
  );
}
