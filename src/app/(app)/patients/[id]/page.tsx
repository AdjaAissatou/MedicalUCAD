import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { AccesEtudiantCard } from "@/components/patients/acces-etudiant-card";
import { initiales, age, formatDate, formatDateHeure } from "@/lib/utils";
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
  TriangleAlert,
  Stethoscope,
  CalendarDays,
  FileText,
  Share2,
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
      dossier: true,
      compte: { select: { email: true, actif: true } },
      consultations: {
        include: { medecin: true },
        orderBy: { date: "desc" },
      },
      rendezVous: {
        include: { medecin: true },
        orderBy: { dateHeure: "desc" },
        take: 10,
      },
    },
  });

  if (!patient) notFound();

  const d = patient.dossier;

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
              <CardTitle className="text-base">Constantes clés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Droplet className="h-4 w-4" />
                  Groupe sanguin
                </span>
                {d?.groupeSanguin ? (
                  <Badge variant="destructive">{d.groupeSanguin}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
              <div className="border-t border-border pt-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TriangleAlert className="h-4 w-4 text-amber-600" />
                  Allergies
                </p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {d?.allergies?.trim() ? d.allergies : "Aucune connue"}
                </p>
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
          {/* Dossier médical */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dossier médical</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <InfoLigne
                  label="Antécédents médicaux"
                  value={d?.antecedentsMedicaux}
                />
                <InfoLigne
                  label="Antécédents chirurgicaux"
                  value={d?.antecedentsChirurgicaux}
                />
                <InfoLigne
                  label="Antécédents familiaux"
                  value={d?.antecedentsFamiliaux}
                />
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

          {/* Historique consultations */}
          <Card>
            <div className="flex items-center gap-2 border-b border-border p-5">
              <Stethoscope className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                Historique des consultations
              </CardTitle>
            </div>
            <CardContent className="p-2">
              {patient.consultations.length === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title="Aucune consultation"
                  description="L'historique des consultations apparaîtra ici."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {patient.consultations.map((c) => (
                    <li key={c.id} className="px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {c.motif ?? "Consultation"}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(c.date)}
                        </span>
                      </div>
                      {c.diagnostic && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium">Diagnostic :</span>{" "}
                          {c.diagnostic}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Dr {c.medecin.prenom} {c.medecin.nom}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Rendez-vous */}
          <Card>
            <div className="flex items-center gap-2 border-b border-border p-5">
              <CalendarDays className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Rendez-vous</CardTitle>
            </div>
            <CardContent className="p-2">
              {patient.rendezVous.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Aucun rendez-vous"
                  description="Planifiez un rendez-vous pour ce patient."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {patient.rendezVous.map((rdv) => (
                    <li
                      key={rdv.id}
                      className="flex items-center justify-between gap-2 px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatDateHeure(rdv.dateHeure)}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
}
