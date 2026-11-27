"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { accueilParRole } from "@/lib/authz";
import { limiterDebit, reinitialiserLimite } from "@/lib/rate-limit";

export type LoginState = { error?: string };

const MAX_TENTATIVES = 5;
const FENETRE_MS = 15 * 60 * 1000; // 15 minutes

async function adresseIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { error: "Veuillez renseigner votre email et votre mot de passe." };
  }

  // Anti-force-brute : limite par IP + email.
  const ip = await adresseIp();
  const cle = `login:${ip}:${email}`;
  const limite = limiterDebit(cle, MAX_TENTATIVES, FENETRE_MS);
  if (!limite.autorise) {
    const minutes = Math.ceil(limite.resetDansSec / 60);
    return {
      error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Comparaison systématique (même si l'utilisateur n'existe pas) pour éviter
  // de révéler l'existence d'un compte par le temps de réponse.
  const hachageFactice =
    "$2b$10$abcdefghijklmnopqrstuv0123456789012345678901234567890a";
  const ok = await bcrypt.compare(
    motDePasse,
    user?.motDePasse ?? hachageFactice
  );

  if (!user || !user.actif || !ok) {
    return { error: "Identifiants incorrects ou compte désactivé." };
  }

  reinitialiserLimite(cle);
  await createSession(user.id);
  redirect(accueilParRole(user));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
