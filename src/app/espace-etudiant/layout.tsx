import { redirect } from "next/navigation";
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

  return <EtudiantShell user={user}>{children}</EtudiantShell>;
}
