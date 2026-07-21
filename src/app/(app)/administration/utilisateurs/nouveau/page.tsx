import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { UtilisateurForm } from "@/components/administration/utilisateur-form";
import { creerUtilisateur } from "@/app/actions/utilisateurs";
import { ArrowLeft } from "lucide-react";

export default function NouvelUtilisateurPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/administration/utilisateurs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux utilisateurs
      </Link>
      <PageHeader
        title="Nouvel utilisateur"
        description="Créez un compte pour un membre du personnel."
      />
      <UtilisateurForm
        action={creerUtilisateur}
        submitLabel="Créer l'utilisateur"
      />
    </div>
  );
}
