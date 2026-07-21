import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { estAdmin } from "@/lib/authz";

export default async function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estAdmin(user)) redirect("/tableau-de-bord");
  return <>{children}</>;
}
