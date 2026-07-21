"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  patientId: z.string().min(1, "Veuillez sélectionner un patient."),
  medecinId: z.string().min(1, "Veuillez sélectionner un médecin."),
  rendezVousId: z.string().optional(),
  date: z.string().optional(),
  motif: z.string().trim().optional(),
  symptomes: z.string().trim().optional(),
  diagnostic: z.string().trim().optional(),
  traitement: z.string().trim().optional(),
  observations: z.string().trim().optional(),
  poids: z.string().optional(),
  taille: z.string().optional(),
  temperature: z.string().optional(),
  tensionArt: z.string().trim().optional(),
  pouls: z.string().optional(),
});

export type ConsultationFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function nombre(v?: string): number | null {
  if (!v || v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function entier(v?: string): number | null {
  const n = nombre(v);
  return n === null ? null : Math.round(n);
}

function lire(formData: FormData) {
  return schema.safeParse({
    patientId: formData.get("patientId"),
    medecinId: formData.get("medecinId"),
    rendezVousId: formData.get("rendezVousId") ?? "",
    date: formData.get("date") ?? "",
    motif: formData.get("motif") ?? "",
    symptomes: formData.get("symptomes") ?? "",
    diagnostic: formData.get("diagnostic") ?? "",
    traitement: formData.get("traitement") ?? "",
    observations: formData.get("observations") ?? "",
    poids: formData.get("poids") ?? "",
    taille: formData.get("taille") ?? "",
    temperature: formData.get("temperature") ?? "",
    tensionArt: formData.get("tensionArt") ?? "",
    pouls: formData.get("pouls") ?? "",
  });
}

function donnees(d: z.infer<typeof schema>) {
  return {
    motif: d.motif || null,
    symptomes: d.symptomes || null,
    diagnostic: d.diagnostic || null,
    traitement: d.traitement || null,
    observations: d.observations || null,
    poids: nombre(d.poids),
    taille: nombre(d.taille),
    temperature: nombre(d.temperature),
    tensionArt: d.tensionArt || null,
    pouls: entier(d.pouls),
  };
}

export async function creerConsultation(
  _prev: ConsultationFormState,
  formData: FormData
): Promise<ConsultationFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const parsed = lire(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  let patientId = d.patientId;
  try {
    const consultation = await prisma.consultation.create({
      data: {
        patientId: d.patientId,
        medecinId: d.medecinId,
        rendezVousId: d.rendezVousId || null,
        date: d.date ? new Date(d.date) : new Date(),
        ...donnees(d),
      },
    });
    patientId = consultation.patientId;

    // Si issue d'un rendez-vous, le marquer terminé.
    if (d.rendezVousId) {
      await prisma.rendezVous.update({
        where: { id: d.rendezVousId },
        data: { statut: "TERMINE" },
      });
    }
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/consultations");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}

export async function modifierConsultation(
  id: string,
  _prev: ConsultationFormState,
  formData: FormData
): Promise<ConsultationFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const parsed = lire(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  let patientId = d.patientId;
  try {
    const c = await prisma.consultation.update({
      where: { id },
      data: {
        medecinId: d.medecinId,
        date: d.date ? new Date(d.date) : undefined,
        ...donnees(d),
      },
    });
    patientId = c.patientId;
  } catch {
    return { error: "Une erreur est survenue lors de la mise à jour." };
  }

  revalidatePath("/consultations");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}
