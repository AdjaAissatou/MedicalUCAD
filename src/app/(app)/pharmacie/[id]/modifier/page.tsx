import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { gerePharmacie } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { MedicamentForm } from "@/components/pharmacie/medicament-form";
import { modifierMedicament } from "@/app/actions/medicaments";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModifierMedicamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!gerePharmacie(user)) redirect("/pharmacie");

  const { id } = await params;
  const medicament = await prisma.medicament.findUnique({ where: { id } });
  if (!medicament) notFound();

  const action = modifierMedicament.bind(null, id);

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
        title={`Modifier — ${medicament.nom}`}
        description="Mettez à jour les informations et le stock de ce médicament."
      />
      <MedicamentForm
        action={action}
        submitLabel="Enregistrer les modifications"
        initial={{
          nom: medicament.nom,
          dci: medicament.dci,
          forme: medicament.forme,
          dosage: medicament.dosage,
          stock: medicament.stock,
          seuilAlerte: medicament.seuilAlerte,
          prix: medicament.prix,
          datePeremption: medicament.datePeremption
            ? medicament.datePeremption.toISOString().slice(0, 10)
            : undefined,
        }}
      />
    </div>
  );
}
