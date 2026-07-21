import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { gerePharmacie } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { MedicamentForm } from "@/components/pharmacie/medicament-form";
import { creerMedicament } from "@/app/actions/medicaments";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NouveauMedicamentPage() {
  const user = await getSessionUser();
  if (!gerePharmacie(user)) redirect("/pharmacie");

  return (
    <div className="max-w-2xl">
      <Link
        href="/pharmacie"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la pharmacie
      </Link>
      <PageHeader
        title="Nouveau médicament"
        description="Ajoutez une référence au catalogue de la pharmacie."
      />
      <MedicamentForm
        action={creerMedicament}
        submitLabel="Ajouter au catalogue"
      />
    </div>
  );
}
