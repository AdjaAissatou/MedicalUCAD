import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { enregistrePatients } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { ImportPatientsForm } from "@/components/patients/import-patients-form";
import { ArrowLeft } from "lucide-react";

export default async function ImportPatientsPage() {
  const user = await getSessionUser();
  if (!enregistrePatients(user)) redirect("/patients");
  return (
    <div className="max-w-4xl">
      <Link
        href="/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux dossiers
      </Link>
      <PageHeader
        title="Importer des dossiers"
        description="Numérisez les dossiers papier en masse à partir d'un fichier CSV / Excel."
      />
      <ImportPatientsForm />
    </div>
  );
}
