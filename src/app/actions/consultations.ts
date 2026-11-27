"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { estSoignant } from "@/lib/authz";
import { journaliser } from "@/lib/audit";

const BORNES = {
  poids: {
    min: 1,
    max: 400,
    message: "Le poids doit être un nombre entre 1 et 400 kg.",
  },
  taille: {
    min: 20,
    max: 260,
    message: "La taille doit être un nombre entre 20 et 260 cm.",
  },
  temperature: {
    min: 30,
    max: 45,
    message: "La température doit être un nombre entre 30 et 45 °C.",
  },
  pouls: {
    min: 20,
    max: 300,
    message: "Le pouls doit être un nombre entre 20 et 300 bpm.",
  },
} as const;

const schema = z
  .object({
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
  })
  .superRefine((d, ctx) => {
    for (const champ of ["poids", "taille", "temperature", "pouls"] as const) {
      const brut = d[champ];
      if (!brut || brut.trim() === "") continue;
      const n = Number(brut.replace(",", "."));
      const { min, max, message } = BORNES[champ];
      if (!Number.isFinite(n) || n < min || n > max) {
        ctx.addIssue({ code: "custom", path: [champ], message });
      }
    }
    if (
      d.tensionArt &&
      d.tensionArt.trim() !== "" &&
      !/^\d{1,2}\s*[/.]\s*\d{1,2}$/.test(d.tensionArt.trim())
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["tensionArt"],
        message: "Format de tension attendu, par exemple 12/8.",
      });
    }
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
  if (!estSoignant(user)) {
    return {
      error: "Action réservée au personnel soignant (médecin, infirmier).",
    };
  }

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

  await journaliser({
    user,
    action: "consultation.create",
    cible: `patient#${patientId}`,
  });
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
  if (!estSoignant(user)) {
    return {
      error: "Action réservée au personnel soignant (médecin, infirmier).",
    };
  }

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

  await journaliser({
    user,
    action: "consultation.update",
    cible: `consultation#${id}`,
  });
  revalidatePath("/consultations");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}
