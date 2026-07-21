import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./prisma";

const COOKIE_NAME = "ucad_session";
const MAX_AGE = 60 * 60 * 8; // 8 heures

// En production, SESSION_SECRET est OBLIGATOIRE : on refuse de signer/vérifier
// avec un secret par défaut afin d'éviter des sessions falsifiables.
// Résolution paresseuse (à l'exécution) pour ne pas casser le build.
let secretCache: string | null = null;
function getSecret(): string {
  if (secretCache) return secretCache;
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      throw new Error(
        "SESSION_SECRET manquant ou trop court (>= 32 caractères requis) en production. " +
          "Générez-en un avec : openssl rand -base64 48"
      );
    }
    secretCache = secret;
  } else {
    secretCache = secret ?? "ucad-sante-dev-secret-change-me-in-production";
  }
  return secretCache;
}

export type SessionUser = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  specialite: string | null;
  patientId: string | null; // renseigné pour les comptes ETUDIANT
};

function sign(value: string): string {
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
  return `${value}.${sig}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export async function createSession(userId: string) {
  const payload = JSON.stringify({ userId, exp: Date.now() + MAX_AGE * 1000 });
  const token = sign(Buffer.from(payload).toString("base64url"));
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const value = verify(token);
  if (!value) return null;

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString());
    if (!payload.userId || (payload.exp && payload.exp < Date.now())) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        specialite: true,
        patientId: true,
        actif: true,
      },
    });
    if (!user || !user.actif) return null;
    const { actif: _actif, ...rest } = user;
    void _actif;
    return rest;
  } catch {
    return null;
  }
}
