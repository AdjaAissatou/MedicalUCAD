"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { verifierDisponibilite, messageIndispo } from "@/lib/rdv";

/** Récupère la session étudiant + son patientId, ou redirige. */
async function requireEtudiant() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ETUDIANT" || !user.patientId) {
    throw new Error("Action réservée aux étudiants.");
  }
  return { user, patientId: user.patientId };
}

// ── Prise de rendez-vous ────────────────────────────────────
const rdvSchema = z.object({
  medecinId: z.string().min(1, "Veuillez choisir un médecin."),
  date: z.string().min(1, "La date est obligatoire."),
  heure: z.string().min(1, "L'heure est obligatoire."),
  motif: z.string().trim().optional(),
});

export type RdvEtudiantState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function reserverRendezVous(
  _prev: RdvEtudiantState,
  formData: FormData
): Promise<RdvEtudiantState> {
  const { patientId } = await requireEtudiant();

  const parsed = rdvSchema.safeParse({
    medecinId: formData.get("medecinId"),
    date: formData.get("date"),
    heure: formData.get("heure"),
    motif: formData.get("motif") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  const dateHeure = new Date(`${d.date}T${d.heure}`);
  if (Number.isNaN(dateHeure.getTime())) {
    return { fieldErrors: { date: ["Date ou heure invalide."] } };
  }
  if (dateHeure.getTime() < Date.now()) {
    return { fieldErrors: { date: ["Choisissez une date à venir."] } };
  }

  // Vérifie que le médecin existe et est actif.
  const medecin = await prisma.user.findFirst({
    where: { id: d.medecinId, role: "MEDECIN", actif: true },
  });
  if (!medecin) return { fieldErrors: { medecinId: ["Médecin invalide."] } };

  // Horaires d'ouverture + créneau libre (médecin et étudiant).
  const indispo = await verifierDisponibilite({
    medecinId: d.medecinId,
    patientId,
    dateHeure,
  });
  if (indispo) {
    const champ = indispo === "dimanche" ? "date" : "heure";
    return { fieldErrors: { [champ]: [messageIndispo(indispo, true)] } };
  }

  try {
    await prisma.rendezVous.create({
      data: {
        patientId,
        medecinId: d.medecinId,
        dateHeure,
        motif: d.motif || null,
        statut: "PLANIFIE",
      },
    });
  } catch {
    return { error: "Une erreur est survenue lors de la réservation." };
  }

  revalidatePath("/espace-etudiant/rendez-vous");
  revalidatePath("/espace-etudiant");
  redirect("/espace-etudiant/rendez-vous");
}

/** Annule un rendez-vous appartenant à l'étudiant connecté. */
export async function annulerMonRendezVous(rdvId: string) {
  const { patientId } = await requireEtudiant();
  const rdv = await prisma.rendezVous.findUnique({ where: { id: rdvId } });
  if (!rdv || rdv.patientId !== patientId) {
    throw new Error("Rendez-vous introuvable.");
  }
  if (rdv.statut === "TERMINE") {
    throw new Error("Un rendez-vous terminé ne peut être annulé.");
  }
  await prisma.rendezVous.update({
    where: { id: rdvId },
    data: { statut: "ANNULE" },
  });
  revalidatePath("/espace-etudiant/rendez-vous");
  revalidatePath("/espace-etudiant");
}

// ── Profil ──────────────────────────────────────────────────
const profilSchema = z.object({
  telephone: z.string().trim().optional(),
  email: z.string().trim().email("Email invalide.").optional().or(z.literal("")),
  adresse: z.string().trim().optional(),
});

export type ProfilState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};

export async function modifierMonProfil(
  _prev: ProfilState,
  formData: FormData
): Promise<ProfilState> {
  const { patientId } = await requireEtudiant();

  const parsed = profilSchema.safeParse({
    telephone: formData.get("telephone") ?? "",
    email: formData.get("email") ?? "",
    adresse: formData.get("adresse") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      telephone: d.telephone || null,
      email: d.email || null,
      adresse: d.adresse || null,
    },
  });

  revalidatePath("/espace-etudiant/profil");
  return { ok: true };
}

// ── Mot de passe ────────────────────────────────────────────
const mdpSchema = z
  .object({
    actuel: z.string().min(1, "Mot de passe actuel requis."),
    nouveau: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères."),
    confirmation: z.string(),
  })
  .refine((v) => v.nouveau === v.confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmation"],
  });

export async function changerMonMotDePasse(
  _prev: ProfilState,
  formData: FormData
): Promise<ProfilState> {
  const { user } = await requireEtudiant();

  const parsed = mdpSchema.safeParse({
    actuel: formData.get("actuel"),
    nouveau: formData.get("nouveau"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const compte = await prisma.user.findUnique({ where: { id: user.id } });
  if (!compte) return { error: "Compte introuvable." };

  const ok = await bcrypt.compare(parsed.data.actuel, compte.motDePasse);
  if (!ok) {
    return { fieldErrors: { actuel: ["Mot de passe actuel incorrect."] } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { motDePasse: await bcrypt.hash(parsed.data.nouveau, 10) },
  });

  return { ok: true };
}
