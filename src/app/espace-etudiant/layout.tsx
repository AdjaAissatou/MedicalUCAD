import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { estEtudiant } from "@/lib/authz";
import { EtudiantShell } from "@/components/etudiant/etudiant-shell";

export default async function EspaceEtudiantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  // Réservé aux comptes étudiants ; le personnel est renvoyé vers son espace.
  if (!estEtudiant(user)) redirect("/tableau-de-bord");

  const notifications = await prisma.notification.count({
    where: { userId: user.id, lu: false },
  });

  return (
    <EtudiantShell user={user} notifications={notifications}>
      {children}
    </EtudiantShell>
  );
}
