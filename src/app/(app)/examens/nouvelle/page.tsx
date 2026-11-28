import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { estSoignant } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { ExamenForm } from "@/components/examens/examen-form";
import { creerDemandeExamen } from "@/app/actions/examens";
import { optionsPatients, optionsMedecins } from "@/lib/options";

export const dynamic = "force-dynamic";

export default async function NouvelleDemandePage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const user = await getSessionUser();
  if (!estSoignant(user)) redirect("/examens");

  const { patient } = await searchParams;
  const [patients, medecins] = await Promise.all([
    optionsPatients(),
    optionsMedecins(),
  ]);
  const medecinDefaut = user?.role === "MEDECIN" ? user.id : undefined;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nouvelle demande d'examen"
        description="Prescrire un examen de laboratoire ou d'imagerie."
      />
      <ExamenForm
        action={creerDemandeExamen}
        patients={patients}
        medecins={medecins}
        initial={{ patientId: patient, medecinId: medecinDefaut }}
        patientVerrouille={!!patient}
        cancelHref="/examens"
      />
    </div>
  );
}
