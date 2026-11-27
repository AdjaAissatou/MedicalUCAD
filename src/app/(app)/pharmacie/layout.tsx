import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule } from "@/lib/authz";

// Garde d'accès au module « Pharmacie » (pharmacien, administrateur).
export default async function PharmacieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!peutAccederModule(user, "pharmacie")) redirect("/tableau-de-bord");
  return <>{children}</>;
}
