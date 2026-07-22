import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { HospitalLanding } from "@/components/landing/hospital/hospital-landing";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/tableau-de-bord");
  return <HospitalLanding />;
}
