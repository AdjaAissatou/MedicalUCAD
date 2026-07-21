"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { estAdmin } from "@/lib/authz";
import { ROLES } from "@/lib/constants";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!estAdmin(user)) throw new Error("Action réservée à l'administrateur.");
  return user;
}

const baseSchema = z.object({
  prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
  nom: z.string().trim().min(1, "Le nom est obligatoire."),
  email: z.string().trim().email("Email invalide.").toLowerCase(),
  role: z.enum(ROLES),
  specialite: z.string().trim().optional(),
  telephone: z.string().trim().optional(),
});

export type UtilisateurFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function creerUtilisateur(
  _prev: UtilisateurFormState,
  formData: FormData
): Promise<UtilisateurFormState> {
  await requireAdmin();

  const parsed = baseSchema
    .extend({
      motDePasse: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
    })
    .safeParse({
      prenom: formData.get("prenom"),
      nom: formData.get("nom"),
      email: formData.get("email"),
      role: formData.get("role"),
      specialite: formData.get("specialite") ?? "",
      telephone: formData.get("telephone") ?? "",
      motDePasse: formData.get("motDePasse"),
    });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const existe = await prisma.user.findUnique({ where: { email: d.email } });
  if (existe) {
    return { fieldErrors: { email: ["Cet email est déjà utilisé."] } };
  }

  try {
    await prisma.user.create({
      data: {
        prenom: d.prenom,
        nom: d.nom,
        email: d.email,
        role: d.role,
        specialite: d.specialite || null,
        telephone: d.telephone || null,
        motDePasse: await bcrypt.hash(d.motDePasse, 10),
      },
    });
  } catch {
    return { error: "Une erreur est survenue lors de la création." };
  }

  revalidatePath("/administration/utilisateurs");
  redirect("/administration/utilisateurs");
}

export async function modifierUtilisateur(
  id: string,
  _prev: UtilisateurFormState,
  formData: FormData
): Promise<UtilisateurFormState> {
  await requireAdmin();

  const motDePasseSaisi = String(formData.get("motDePasse") ?? "");
  const schema = motDePasseSaisi
    ? baseSchema.extend({
        motDePasse: z
          .string()
          .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
      })
    : baseSchema;

  const parsed = schema.safeParse({
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    role: formData.get("role"),
    specialite: formData.get("specialite") ?? "",
    telephone: formData.get("telephone") ?? "",
    ...(motDePasseSaisi ? { motDePasse: motDePasseSaisi } : {}),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const autre = await prisma.user.findUnique({ where: { email: d.email } });
  if (autre && autre.id !== id) {
    return { fieldErrors: { email: ["Cet email est déjà utilisé."] } };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        prenom: d.prenom,
        nom: d.nom,
        email: d.email,
        role: d.role,
        specialite: d.specialite || null,
        telephone: d.telephone || null,
        ...(motDePasseSaisi
          ? { motDePasse: await bcrypt.hash(motDePasseSaisi, 10) }
          : {}),
      },
    });
  } catch {
    return { error: "Une erreur est survenue lors de la mise à jour." };
  }

  revalidatePath("/administration/utilisateurs");
  redirect("/administration/utilisateurs");
}

export async function basculerActivation(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) {
    throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Utilisateur introuvable.");
  await prisma.user.update({
    where: { id },
    data: { actif: !user.actif },
  });
  revalidatePath("/administration/utilisateurs");
}

export async function supprimerUtilisateur(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/administration/utilisateurs");
  redirect("/administration/utilisateurs");
}
