import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { UtilisateurForm } from "@/components/administration/utilisateur-form";
import { modifierUtilisateur } from "@/app/actions/utilisateurs";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModifierUtilisateurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const utilisateur = await prisma.user.findUnique({ where: { id } });
  if (!utilisateur) notFound();

  const action = modifierUtilisateur.bind(null, id);

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
        title={`Modifier — ${utilisateur.prenom} ${utilisateur.nom}`}
        description="Mettez à jour le compte et les droits de cet utilisateur."
      />
      <UtilisateurForm
        action={action}
        edition
        submitLabel="Enregistrer les modifications"
        initial={{
          prenom: utilisateur.prenom,
          nom: utilisateur.nom,
          email: utilisateur.email,
          role: utilisateur.role,
          specialite: utilisateur.specialite,
          telephone: utilisateur.telephone,
        }}
      />
    </div>
  );
}
