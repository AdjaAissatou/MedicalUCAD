"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { estSoignant, estLaborantin } from "@/lib/authz";
import { journaliser } from "@/lib/audit";
import { STATUTS_EXAMEN } from "@/lib/constants";

export type ExamenFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const demandeSchema = z.object({
  patientId: z.string().min(1, "Veuillez sélectionner un patient."),
  medecinId: z.string().min(1, "Veuillez sélectionner un médecin."),
  type: z.string().trim().min(1, "Le type d'examen est obligatoire."),
  categorie: z.string().trim().optional(),
  motif: z.string().trim().optional(),
  priorite: z.string().trim().optional(),
});

export async function creerDemandeExamen(
  _prev: ExamenFormState,
  formData: FormData
): Promise<ExamenFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estSoignant(user)) {
    return { error: "Seul le personnel soignant peut prescrire un examen." };
  }

  const parsed = demandeSchema.safeParse({
    patientId: formData.get("patientId"),
    medecinId: formData.get("medecinId"),
    type: formData.get("type"),
    categorie: formData.get("categorie") ?? "BIOLOGIE",
    motif: formData.get("motif") ?? "",
    priorite: formData.get("priorite") ?? "NORMALE",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  let patientId = d.patientId;
  try {
    const demande = await prisma.demandeExamen.create({
      data: {
        patientId: d.patientId,
        medecinId: d.medecinId,
        type: d.type,
        categorie: d.categorie || "BIOLOGIE",
        motif: d.motif || null,
        priorite: d.priorite || "NORMALE",
        statut: "DEMANDE",
      },
    });
    patientId = demande.patientId;
    await journaliser({
      user,
      action: "examen.demande",
      cible: `examen#${demande.id}`,
      details: d.type,
    });
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/examens");
  revalidatePath(`/patients/${patientId}`);
  redirect("/examens");
}

export async function changerStatutExamen(id: string, statut: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estSoignant(user) && !estLaborantin(user)) {
    throw new Error("Action non autorisée.");
  }
  if (!STATUTS_EXAMEN.includes(statut as (typeof STATUTS_EXAMEN)[number])) {
    throw new Error("Statut invalide.");
  }
  await prisma.demandeExamen.update({ where: { id }, data: { statut } });
  await journaliser({ user, action: "examen.statut", cible: `examen#${id}`, details: statut });
  revalidatePath("/examens");
  revalidatePath(`/examens/${id}`);
}

const resultatSchema = z.object({
  demandeId: z.string().min(1),
  valeurs: z.string().trim().optional(),
  conclusion: z.string().trim().optional(),
  documentUrl: z.string().trim().optional(),
});

export async function enregistrerResultat(
  _prev: ExamenFormState,
  formData: FormData
): Promise<ExamenFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estLaborantin(user) && !estSoignant(user)) {
    return { error: "Action réservée au laboratoire." };
  }

  const parsed = resultatSchema.safeParse({
    demandeId: formData.get("demandeId"),
    valeurs: formData.get("valeurs") ?? "",
    conclusion: formData.get("conclusion") ?? "",
    documentUrl: formData.get("documentUrl") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  let patientId = "";
  try {
    const demande = await prisma.demandeExamen.findUnique({
      where: { id: d.demandeId },
      select: { patientId: true },
    });
    patientId = demande?.patientId ?? "";
    await prisma.resultatExamen.upsert({
      where: { demandeId: d.demandeId },
      create: {
        demandeId: d.demandeId,
        laborantinId: user.id,
        valeurs: d.valeurs || null,
        conclusion: d.conclusion || null,
        documentUrl: d.documentUrl || null,
      },
      update: {
        laborantinId: user.id,
        valeurs: d.valeurs || null,
        conclusion: d.conclusion || null,
        documentUrl: d.documentUrl || null,
      },
    });
    await prisma.demandeExamen.update({
      where: { id: d.demandeId },
      data: { statut: "TERMINE" },
    });
    await journaliser({ user, action: "examen.resultat", cible: `examen#${d.demandeId}` });
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement du résultat." };
  }

  revalidatePath("/examens");
  revalidatePath(`/examens/${d.demandeId}`);
  if (patientId) revalidatePath(`/patients/${patientId}`);
  redirect(`/examens/${d.demandeId}`);
}

export async function supprimerDemandeExamen(id: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estSoignant(user)) throw new Error("Action non autorisée.");
  await prisma.demandeExamen.delete({ where: { id } });
  await journaliser({ user, action: "examen.delete", cible: `examen#${id}` });
  revalidatePath("/examens");
  redirect("/examens");
}
