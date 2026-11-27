import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule, accueilParRole } from "@/lib/authz";

// Garde d'accès au module « Pharmacie » (pharmacien).
export default async function PharmacieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!peutAccederModule(user, "pharmacie")) redirect(accueilParRole(user));
  return <>{children}</>;
}
