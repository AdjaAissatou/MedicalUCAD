import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { optionsPatients, optionsMedecins } from "@/lib/options";
import { PageHeader } from "@/components/page-header";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { modifierConsultation } from "@/app/actions/consultations";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModifierConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [consultation, patients, medecins] = await Promise.all([
    prisma.consultation.findUnique({ where: { id } }),
    optionsPatients(),
    optionsMedecins(),
  ]);
  if (!consultation) notFound();

  const action = modifierConsultation.bind(null, id);
  const cancelHref = `/patients/${consultation.patientId}`;

  return (
    <div className="max-w-3xl">
      <Link
        href={cancelHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <PageHeader
        title="Modifier la consultation"
        description="Mettez à jour les informations de cette consultation."
      />
      <ConsultationForm
        action={action}
        patients={patients}
        medecins={medecins}
        patientVerrouille
        submitLabel="Enregistrer les modifications"
        initial={{
          patientId: consultation.patientId,
          medecinId: consultation.medecinId,
          date: consultation.date.toISOString().slice(0, 10),
          motif: consultation.motif,
          symptomes: consultation.symptomes,
          diagnostic: consultation.diagnostic,
          traitement: consultation.traitement,
          observations: consultation.observations,
          poids: consultation.poids,
          taille: consultation.taille,
          temperature: consultation.temperature,
          tensionArt: consultation.tensionArt,
          pouls: consultation.pouls,
        }}
        cancelHref={cancelHref}
      />
    </div>
  );
}
