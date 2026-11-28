"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function marquerNotificationLue(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  if (id) {
    // updateMany + filtre userId : un utilisateur ne touche que ses notifications.
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { lu: true },
    });
  }
  revalidatePath("/espace-etudiant/notifications");
  revalidatePath("/espace-etudiant", "layout");
}

export async function marquerToutesLues() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await prisma.notification.updateMany({
    where: { userId: user.id, lu: false },
    data: { lu: true },
  });
  revalidatePath("/espace-etudiant/notifications");
  revalidatePath("/espace-etudiant", "layout");
}
