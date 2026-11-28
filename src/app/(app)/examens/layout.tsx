import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule, accueilParRole } from "@/lib/authz";

// Garde d'accès au module « Examens » (soignants + laborantin).
export default async function ExamensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!peutAccederModule(user, "examens")) redirect(accueilParRole(user));
  return <>{children}</>;
}
