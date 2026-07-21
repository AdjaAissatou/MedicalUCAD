import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { optionsPatients, optionsMedecins } from "@/lib/options";
import { PageHeader } from "@/components/page-header";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { creerConsultation } from "@/app/actions/consultations";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NouvelleConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; rdv?: string }>;
}) {
  const { patient, rdv } = await searchParams;
  const [patients, medecins, moi] = await Promise.all([
    optionsPatients(),
    optionsMedecins(),
    getSessionUser(),
  ]);

  // Préremplissage depuis un rendez-vous
  let patientId = patient;
  let medecinId = moi?.role === "MEDECIN" ? moi.id : undefined;
  let motif: string | undefined;
  if (rdv) {
    const rendezVous = await prisma.rendezVous.findUnique({
      where: { id: rdv },
      select: { patientId: true, medecinId: true, motif: true },
    });
    if (rendezVous) {
      patientId = rendezVous.patientId;
      medecinId = rendezVous.medecinId;
      motif = rendezVous.motif ?? undefined;
    }
  }

  const cancelHref = patientId ? `/patients/${patientId}` : "/consultations";

  return (
    <div className="max-w-3xl">
      <Link
        href={cancelHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>
      <PageHeader
        title="Nouvelle consultation"
        description="Enregistrez une consultation médicale et ses constatations."
      />

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun patient enregistré"
          description="Créez d'abord un dossier patient."
        >
          <Link href="/patients/nouveau">
            <Button variant="accent">Créer un patient</Button>
          </Link>
        </EmptyState>
      ) : (
        <ConsultationForm
          action={creerConsultation}
          patients={patients}
          medecins={medecins}
          patientVerrouille={Boolean(patientId)}
          initial={{
            patientId,
            medecinId,
            rendezVousId: rdv,
            motif,
            date: new Date().toISOString().slice(0, 10),
          }}
          cancelHref={cancelHref}
        />
      )}
    </div>
  );
}
