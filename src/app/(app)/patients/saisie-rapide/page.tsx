import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { enregistrePatients } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { SaisieRapide } from "@/components/patients/saisie-rapide";
import { ArrowLeft } from "lucide-react";

export default async function SaisieRapidePage() {
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
        title="Saisie rapide"
        description="Enregistrez plusieurs dossiers à la suite, sans recharger la page."
      />
      <SaisieRapide />
    </div>
  );
}
