import "server-only";
import { prisma } from "./prisma";

/**
 * Crée une notification pour le compte étudiant lié à un patient (s'il existe).
 * Best-effort : n'interrompt jamais l'action métier.
 */
export async function notifierPatient(
  patientId: string,
  data: { titre: string; message?: string; lien?: string }
) {
  try {
    const compte = await prisma.user.findUnique({
      where: { patientId },
      select: { id: true },
    });
    if (!compte) return;
    await prisma.notification.create({
      data: {
        userId: compte.id,
        titre: data.titre,
        message: data.message ?? null,
        lien: data.lien ?? null,
      },
    });
  } catch {
    // Notification best-effort.
  }
}
