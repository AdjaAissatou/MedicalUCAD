"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { enregistrePatients } from "@/lib/authz";

async function requireGestionDossiers() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!enregistrePatients(user)) {
    throw new Error("Action non autorisée.");
  }
  return user;
}

const schema = z.object({
  email: z.string().trim().email("Email invalide.").toLowerCase(),
  motDePasse: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export type AccesEtudiantState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};

/** Crée un compte de connexion (rôle ETUDIANT) lié à un dossier patient. */
export async function creerAccesEtudiant(
  patientId: string,
  _prev: AccesEtudiantState,
  formData: FormData
): Promise<AccesEtudiantState> {
  await requireGestionDossiers();

  const parsed = schema.safeParse({
    email: formData.get("email"),
    motDePasse: formData.get("motDePasse"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, motDePasse } = parsed.data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { compte: true },
  });
  if (!patient) return { error: "Patient introuvable." };
  if (patient.compte) {
    return { error: "Ce patient possède déjà un accès étudiant." };
  }

  const emailPris = await prisma.user.findUnique({ where: { email } });
  if (emailPris) {
    return { fieldErrors: { email: ["Cet email est déjà utilisé."] } };
  }

  await prisma.user.create({
    data: {
      email,
      motDePasse: await bcrypt.hash(motDePasse, 10),
      nom: patient.nom,
      prenom: patient.prenom,
      role: "ETUDIANT",
      patientId: patient.id,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  return { ok: true };
}

/** Réinitialise le mot de passe du compte étudiant d'un patient. */
export async function reinitialiserMotDePasseEtudiant(
  patientId: string,
  _prev: AccesEtudiantState,
  formData: FormData
): Promise<AccesEtudiantState> {
  await requireGestionDossiers();

  const motDePasse = String(formData.get("motDePasse") ?? "");
  if (motDePasse.length < 6) {
    return {
      fieldErrors: {
        motDePasse: ["Le mot de passe doit contenir au moins 6 caractères."],
      },
    };
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { compte: true },
  });
  if (!patient?.compte) return { error: "Aucun accès étudiant à modifier." };

  await prisma.user.update({
    where: { id: patient.compte.id },
    data: { motDePasse: await bcrypt.hash(motDePasse, 10), actif: true },
  });

  revalidatePath(`/patients/${patientId}`);
  return { ok: true };
}

/** Active/désactive l'accès étudiant. */
export async function basculerAccesEtudiant(patientId: string) {
  await requireGestionDossiers();
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { compte: true },
  });
  if (!patient?.compte) throw new Error("Aucun accès étudiant.");
  await prisma.user.update({
    where: { id: patient.compte.id },
    data: { actif: !patient.compte.actif },
  });
  revalidatePath(`/patients/${patientId}`);
}

/** Supprime définitivement l'accès étudiant. */
export async function revoquerAccesEtudiant(patientId: string) {
  await requireGestionDossiers();
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { compte: true },
  });
  if (!patient?.compte) return;
  await prisma.user.delete({ where: { id: patient.compte.id } });
  revalidatePath(`/patients/${patientId}`);
}
