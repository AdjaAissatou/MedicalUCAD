import "server-only";
import { headers } from "next/headers";
import { prisma } from "./prisma";

type Acteur = {
  id?: string | null;
  email?: string | null;
  role?: string | null;
} | null;

async function adresseIp(): Promise<string | null> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Enregistre une entrée dans le journal d'audit (traçabilité).
 * Best-effort : toute erreur est ignorée pour ne jamais interrompre
 * l'action métier.
 */
export async function journaliser(opts: {
  user?: Acteur;
  action: string;
  cible?: string;
  details?: string;
}): Promise<void> {
  try {
    await prisma.journalAudit.create({
      data: {
        userId: opts.user?.id ?? null,
        userEmail: opts.user?.email ?? null,
        userRole: opts.user?.role ?? null,
        action: opts.action,
        cible: opts.cible ?? null,
        details: opts.details ?? null,
        ip: await adresseIp(),
      },
    });
  } catch {
    // Journalisation best-effort : on n'interrompt jamais l'action.
  }
}
