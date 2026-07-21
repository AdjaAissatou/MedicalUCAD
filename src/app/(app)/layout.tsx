import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { estEtudiant } from "@/lib/authz";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  // Les étudiants n'accèdent pas à l'espace personnel.
  if (estEtudiant(user)) redirect("/espace-etudiant");

  return <AppShell user={user}>{children}</AppShell>;
}
