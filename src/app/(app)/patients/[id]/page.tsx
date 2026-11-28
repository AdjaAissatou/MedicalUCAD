import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { AccesEtudiantCard } from "@/components/patients/acces-etudiant-card";
import { DossierStructure } from "@/components/patients/dossier-structure";
import { initiales, age, formatDateHeure } from "@/lib/utils";
import {
  TYPE_PATIENT_LABELS,
  STATUT_RDV_LABELS,
  STATUT_RDV_VARIANTS,
} from "@/lib/constants";
import {
  ArrowLeft,
  Pencil,
  CalendarPlus,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Stethoscope,
  CalendarDays,
  FileText,
  Share2,
  History,
} from "lucide-react";

export const dynamic = "force-dynamic";

function InfoLigne({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground whitespace-pre-wrap">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

export default async function PatientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      dossier: {
        include: {
          antecedents: { orderBy: { createdAt: "desc" } },
          allergieList: { orderBy: { createdAt: "desc" } },
          vaccinations: { orderBy: { createdAt: "desc" } },
        },
      },
      compte: { select: { email: true, actif: true } },
      consultations: {
        include: { medecin: true },
        orderBy: { date: "desc" },
      },
      rendezVous: {
        include: { medecin: true },
        orderBy: { dateHeure: "desc" },
      },
      orientations: {
        include: { medecin: true },
        orderBy: { date: "desc" },
      },
      ordonnances: {
        include: { lignes: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!patient) notFound();

  // Traçabilité : accès en lecture au dossier médical.
  const user = await getSessionUser();
  await journaliser({
    user,
    action: "dossier.view",
    cible: `patient#${patient.id}`,
    details: `${patient.prenom} ${patient.nom}`,
  });

  const d = patient.dossier;

  // Chronologie médicale unifiée : consultations, rendez-vous, orientations
  // et ordonnances, fusionnés et triés du plus récent au plus ancien.
  const LIBELLE_STATUT: Record<string, string> = {
    EN_ATTENTE: "En attente",
    REALISEE: "Réalisée",
    ANNULEE: "Annulée",
    DELIVREE: "Délivrée",
    PARTIELLE: "Partielle",
  };
  const VARIANT_STATUT: Record<string, BadgeProps["variant"]> = {
    EN_ATTENTE: "warning",
    REALISEE: "success",
    DELIVREE: "success",
    PARTIELLE: "info",
    ANNULEE: "neutral",
  };
  type EvtChrono = {
    id: string;
    date: Date;
    type: "consultation" | "rendezvous" | "orientation" | "ordonnance";
    titre: string;
    detail?: string;
    auteur?: string;
    statut?: string;
    statutVariant?: BadgeProps["variant"];
  };
  const chronologie: EvtChrono[] = [
    ...patient.consultations.map((c) => ({
      id: `c-${c.id}`,
      date: c.date,
      type: "consultation" as const,
      titre: c.motif?.trim() ? c.motif : "Consultation",
      detail: c.diagnostic?.trim() ? `Diagnostic : ${c.diagnostic}` : undefined,
      auteur: `Dr ${c.medecin.prenom} ${c.medecin.nom}`,
    })),
    ...patient.rendezVous.map((r) => ({
      id: `r-${r.id}`,
      date: r.dateHeure,
      type: "rendezvous" as const,
      titre: r.motif?.trim() ? r.motif : "Rendez-vous",
      auteur: `Dr ${r.medecin.prenom} ${r.medecin.nom}`,
      statut: STATUT_RDV_LABELS[r.statut] ?? r.statut,
      statutVariant: STATUT_RDV_VARIANTS[r.statut],
    })),
    ...patient.orientations.map((o) => ({
      id: `o-${o.id}`,
      date: o.date,
      type: "orientation" as const,
      titre: `Orientation — ${o.serviceCible}`,
      detail: o.motif,
      auteur: `Dr ${o.medecin.prenom} ${o.medecin.nom}`,
      statut: LIBELLE_STATUT[o.statut] ?? o.statut,
      statutVariant: VARIANT_STATUT[o.statut] ?? "neutral",
    })),
    ...patient.ordonnances.map((ord) => ({
      id: `ord-${ord.id}`,
      date: ord.date,
      type: "ordonnance" as const,
      titre: `Ordonnance (${ord.lignes.length} ligne${
        ord.lignes.length > 1 ? "s" : ""
      })`,
      detail: ord.lignes.map((l) => l.designation).join(", ") || undefined,
      statut: LIBELLE_STATUT[ord.statut] ?? ord.statut,
      statutVariant: VARIANT_STATUT[ord.statut] ?? "neutral",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const CHRONO_STYLE: Record<
    EvtChrono["type"],
    { icon: typeof Stethoscope; tint: string }
  > = {
    consultation: { icon: Stethoscope, tint: "bg-primary/10 text-primary" },
    rendezvous: { icon: CalendarDays, tint: "bg-gold/15 text-gold" },
    orientation: { icon: Share2, tint: "bg-mint text-emerald" },
    ordonnance: {
      icon: FileText,
      tint: "bg-secondary text-secondary-foreground",
    },
  };

  return (
    <div className="max-w-5xl">
      <Link
        href="/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux dossiers
      </Link>

      {/* En-tête patient */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
              {initiales(patient.prenom, patient.nom)}
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {patient.prenom} {patient.nom}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="primary">
                  {TYPE_PATIENT_LABELS[patient.type] ?? patient.type}
                </Badge>
                <span>{patient.matricule}</span>
                <span>·</span>
                <span>{age(patient.dateNaissance)}</span>
                {patient.sexe && (
                  <>
                    <span>·</span>
                    <span>
                      {patient.sexe === "M" ? "Masculin" : "Féminin"}
                    </span>
                  </>
                )}
                {d?.numeroDossier && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {d.numeroDossier}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/consultations/nouvelle?patient=${patient.id}`}>
              <Button variant="accent" size="sm">
                <Stethoscope className="h-4 w-4" />
                Consultation
              </Button>
            </Link>
            <Link href={`/rendez-vous/nouveau?patient=${patient.id}`}>
              <Button variant="outline" size="sm">
                <CalendarPlus className="h-4 w-4" />
                Rendez-vous
              </Button>
            </Link>
            <Link href={`/orientations/nouvelle?patient=${patient.id}`}>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
                Orienter
              </Button>
            </Link>
            <Link href={`/patients/${patient.id}/modifier`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne latérale : coordonnées + alertes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                {patient.telephone ?? "—"}
              </p>
              <p className="flex items-center gap-2 text-foreground break-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                {patient.email ?? "—"}
              </p>
              <p className="flex items-start gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                {patient.adresse ?? "—"}
              </p>
              {patient.faculte && (
                <p className="border-t border-border pt-3 text-muted-foreground">
                  {patient.faculte}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Groupe sanguin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Droplet className="h-4 w-4" />
                  Groupe
                </span>
                {d?.groupeSanguin ? (
                  <Badge variant="destructive">{d.groupeSanguin}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </CardContent>
          </Card>

          <AccesEtudiantCard
            patientId={patient.id}
            emailPatient={patient.email}
            compte={patient.compte}
          />
        </div>

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossier structuré : antécédents, allergies, vaccinations */}
          <DossierStructure
            dossierId={d?.id ?? ""}
            patientId={patient.id}
            antecedents={d?.antecedents ?? []}
            allergies={d?.allergieList ?? []}
            vaccinations={d?.vaccinations ?? []}
          />

          {/* Synthèse (texte libre) */}
          {(d?.traitementEnCours?.trim() || d?.observations?.trim()) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Synthèse</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <InfoLigne
                    label="Traitement en cours"
                    value={d?.traitementEnCours}
                  />
                  <div className="sm:col-span-2">
                    <InfoLigne label="Observations" value={d?.observations} />
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Chronologie médicale unifiée */}
          <Card>
            <div className="flex items-center gap-2 border-b border-border p-5">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Chronologie médicale</CardTitle>
            </div>
            <CardContent className="p-0">
              {chronologie.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="Aucun évènement"
                  description="Consultations, rendez-vous, orientations et ordonnances apparaîtront ici."
                />
              ) : (
                <ul className="p-5">
                  {chronologie.map((e, i) => {
                    const style = CHRONO_STYLE[e.type];
                    const Icon = style.icon;
                    return (
                      <li
                        key={e.id}
                        className="relative flex gap-4 pb-6 last:pb-0"
                      >
                        {i < chronologie.length - 1 && (
                          <span
                            className="absolute left-[17px] top-10 h-[calc(100%-1.25rem)] w-px bg-border"
                            aria-hidden
                          />
                        )}
                        <span
                          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.tint}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {e.titre}
                            </p>
                            {e.statut && (
                              <Badge variant={e.statutVariant}>
                                {e.statut}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateHeure(e.date)}
                            {e.auteur ? ` · ${e.auteur}` : ""}
                          </p>
                          {e.detail && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {e.detail}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
