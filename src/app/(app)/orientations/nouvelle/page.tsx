import Link from "next/link";
import { optionsPatients, optionsMedecins } from "@/lib/options";
import { PageHeader } from "@/components/page-header";
import { OrientationForm } from "@/components/orientations/orientation-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NouvelleOrientationPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const { patient } = await searchParams;
  const [patients, medecins] = await Promise.all([
    optionsPatients(),
    optionsMedecins(),
  ]);

  return (
    <div className="max-w-2xl">
      <Link
        href="/orientations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux orientations
      </Link>
      <PageHeader
        title="Nouvelle orientation"
        description="Redirigez un patient vers un service ou un spécialiste externe."
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
        <OrientationForm
          patients={patients}
          medecins={medecins}
          patientPreselect={patient}
        />
      )}
    </div>
  );
}
