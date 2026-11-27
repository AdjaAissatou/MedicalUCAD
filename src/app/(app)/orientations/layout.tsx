import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { peutAccederModule } from "@/lib/authz";

// Garde d'accès au module « Orientations » (personnel soignant).
export default async function OrientationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!peutAccederModule(user, "orientations")) redirect("/tableau-de-bord");
  return <>{children}</>;
}
