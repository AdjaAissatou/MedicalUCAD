"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { estSoignant } from "@/lib/authz";

const schema = z.object({
  patientId: z.string().min(1, "Veuillez sélectionner un patient."),
  medecinId: z.string().min(1, "Veuillez sélectionner un médecin."),
  serviceCible: z.string().trim().min(1, "Le service de destination est obligatoire."),
  motif: z.string().trim().min(1, "Le motif est obligatoire."),
});

export type OrientationFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function creerOrientation(
  _prev: OrientationFormState,
  formData: FormData
): Promise<OrientationFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estSoignant(user)) {
    return {
      error: "Action réservée au personnel soignant (médecin, infirmier).",
    };
  }

  const parsed = schema.safeParse({
    patientId: formData.get("patientId"),
    medecinId: formData.get("medecinId"),
    serviceCible: formData.get("serviceCible"),
    motif: formData.get("motif"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  try {
    await prisma.orientation.create({
      data: {
        patientId: d.patientId,
        medecinId: d.medecinId,
        serviceCible: d.serviceCible,
        motif: d.motif,
        statut: "EN_ATTENTE",
      },
    });
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/orientations");
  revalidatePath(`/patients/${d.patientId}`);
  redirect("/orientations");
}

export async function changerStatutOrientation(id: string, statut: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estSoignant(user)) {
    throw new Error("Action non autorisée.");
  }
  if (!["EN_ATTENTE", "REALISEE", "ANNULEE"].includes(statut)) {
    throw new Error("Statut invalide.");
  }
  await prisma.orientation.update({ where: { id }, data: { statut } });
  revalidatePath("/orientations");
}
