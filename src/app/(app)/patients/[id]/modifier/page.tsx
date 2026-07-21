import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PatientForm } from "@/components/patients/patient-form";
import { modifierPatient } from "@/app/actions/patients";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModifierPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { dossier: true },
  });
  if (!patient) notFound();

  const action = modifierPatient.bind(null, id);

  const initial = {
    matricule: patient.matricule,
    nom: patient.nom,
    prenom: patient.prenom,
    dateNaissance: patient.dateNaissance
      ? patient.dateNaissance.toISOString().slice(0, 10)
      : "",
    sexe: patient.sexe,
    telephone: patient.telephone,
    email: patient.email,
    adresse: patient.adresse,
    type: patient.type,
    faculte: patient.faculte,
    groupeSanguin: patient.dossier?.groupeSanguin,
    allergies: patient.dossier?.allergies,
    antecedentsMedicaux: patient.dossier?.antecedentsMedicaux,
    antecedentsChirurgicaux: patient.dossier?.antecedentsChirurgicaux,
    antecedentsFamiliaux: patient.dossier?.antecedentsFamiliaux,
    traitementEnCours: patient.dossier?.traitementEnCours,
    observations: patient.dossier?.observations,
  };

  return (
    <div className="max-w-3xl">
      <Link
        href={`/patients/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <PageHeader
        title={`Modifier — ${patient.prenom} ${patient.nom}`}
        description="Mettez à jour les informations du dossier médical."
      />
      <PatientForm
        action={action}
        initial={initial}
        submitLabel="Enregistrer les modifications"
        cancelHref={`/patients/${id}`}
      />
    </div>
  );
}
