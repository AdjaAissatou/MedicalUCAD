import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { ProfilForms } from "@/components/etudiant/profil-forms";
import { Card, CardContent } from "@/components/ui/card";
import { initiales } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MonProfil() {
  const user = await getSessionUser();
  const patient = await prisma.patient.findUnique({
    where: { id: user!.patientId! },
    select: { telephone: true, email: true, adresse: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mon profil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez vos coordonnées et votre mot de passe.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {initiales(user!.prenom, user!.nom)}
          </span>
          <div>
            <p className="font-semibold text-foreground">
              {user!.prenom} {user!.nom}
            </p>
            <p className="text-sm text-muted-foreground">{user!.email}</p>
          </div>
        </CardContent>
      </Card>

      <ProfilForms
        initial={{
          telephone: patient?.telephone ?? null,
          email: patient?.email ?? null,
          adresse: patient?.adresse ?? null,
        }}
      />
    </div>
  );
}
