"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { STATUTS_RDV, TRANSITIONS_RDV } from "@/lib/constants";
import { gereDossiers } from "@/lib/authz";

const rdvSchema = z.object({
  patientId: z.string().min(1, "Veuillez sélectionner un patient."),
  medecinId: z.string().min(1, "Veuillez sélectionner un médecin."),
  date: z.string().min(1, "La date est obligatoire."),
  heure: z.string().min(1, "L'heure est obligatoire."),
  duree: z.coerce.number().int().min(5).max(240).default(30),
  motif: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type RdvFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function creerRendezVous(
  _prev: RdvFormState,
  formData: FormData
): Promise<RdvFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!gereDossiers(user)) {
    return {
      error:
        "Action non autorisée : votre rôle ne permet pas de gérer les rendez-vous.",
    };
  }

  const parsed = rdvSchema.safeParse({
    patientId: formData.get("patientId"),
    medecinId: formData.get("medecinId"),
    date: formData.get("date"),
    heure: formData.get("heure"),
    duree: formData.get("duree") ?? 30,
    motif: formData.get("motif") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  const dateHeure = new Date(`${d.date}T${d.heure}`);
  if (Number.isNaN(dateHeure.getTime())) {
    return { fieldErrors: { date: ["Date ou heure invalide."] } };
  }

  try {
    await prisma.rendezVous.create({
      data: {
        patientId: d.patientId,
        medecinId: d.medecinId,
        dateHeure,
        duree: d.duree,
        motif: d.motif || null,
        notes: d.notes || null,
        statut: "PLANIFIE",
      },
    });
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/rendez-vous");
  revalidatePath("/tableau-de-bord");
  redirect("/rendez-vous");
}

export async function changerStatutRdv(id: string, statut: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!gereDossiers(user)) {
    throw new Error("Action non autorisée.");
  }
  if (!STATUTS_RDV.includes(statut as (typeof STATUTS_RDV)[number])) {
    throw new Error("Statut invalide.");
  }

  const rdv = await prisma.rendezVous.findUnique({
    where: { id },
    select: { statut: true },
  });
  if (!rdv) throw new Error("Rendez-vous introuvable.");

  // Aucun changement demandé.
  if (statut === rdv.statut) return;

  // Respect de la machine à états (ex. « Terminé » est définitif).
  const autorisees = TRANSITIONS_RDV[rdv.statut] ?? [];
  if (!autorisees.includes(statut)) {
    throw new Error("Changement de statut non autorisé.");
  }

  await prisma.rendezVous.update({ where: { id }, data: { statut } });
  revalidatePath("/rendez-vous");
  revalidatePath("/tableau-de-bord");
}
