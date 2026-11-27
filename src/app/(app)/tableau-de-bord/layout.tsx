import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule, accueilParRole } from "@/lib/authz";

// Tableau de bord opérationnel : personnel de terrain seulement.
export default async function TableauDeBordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!peutAccederModule(user, "tableau-de-bord")) {
    redirect(accueilParRole(user));
  }
  return <>{children}</>;
}
