import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { enregistrePatients } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { PatientForm } from "@/components/patients/patient-form";
import { creerPatient } from "@/app/actions/patients";
import { ArrowLeft } from "lucide-react";

export default async function NouveauPatientPage() {
  const user = await getSessionUser();
  if (!enregistrePatients(user)) redirect("/patients");
  return (
    <div className="max-w-3xl">
      <Link
        href="/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux dossiers
      </Link>
      <PageHeader
        title="Nouveau patient"
        description="Créez un dossier médical pour un étudiant ou un personnel."
      />
      <PatientForm
        action={creerPatient}
        submitLabel="Créer le dossier"
        cancelHref="/patients"
      />
    </div>
  );
}
