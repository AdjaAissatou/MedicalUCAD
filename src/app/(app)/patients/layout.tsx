import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule, accueilParRole } from "@/lib/authz";

// Garde d'accès au module « Dossiers médicaux ».
export default async function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!peutAccederModule(user, "patients")) redirect(accueilParRole(user));
  return <>{children}</>;
}
