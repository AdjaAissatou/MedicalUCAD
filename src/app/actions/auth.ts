"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { error: "Veuillez renseigner votre email et votre mot de passe." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.actif) {
    return { error: "Identifiants incorrects ou compte désactivé." };
  }

  const ok = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!ok) {
    return { error: "Identifiants incorrects ou compte désactivé." };
  }

  await createSession(user.id);
  redirect("/tableau-de-bord");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
