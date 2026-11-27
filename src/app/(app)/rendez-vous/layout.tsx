import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule, accueilParRole } from "@/lib/authz";

// Garde d'accès au module « Rendez-vous ».
export default async function RendezVousLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!peutAccederModule(user, "rendez-vous")) redirect(accueilParRole(user));
  return <>{children}</>;
}
