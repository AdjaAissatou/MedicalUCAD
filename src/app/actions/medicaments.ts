"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { gerePharmacie } from "@/lib/authz";

async function requirePharmacie() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!gerePharmacie(user)) {
    throw new Error("Action réservée à la pharmacie ou à l'administration.");
  }
  return user;
}

const schema = z.object({
  nom: z.string().trim().min(1, "Le nom est obligatoire."),
  dci: z.string().trim().optional(),
  forme: z.string().trim().optional(),
  dosage: z.string().trim().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  seuilAlerte: z.coerce.number().int().min(0).default(10),
  prix: z.coerce.number().min(0).default(0),
  datePeremption: z.string().optional(),
});

export type MedicamentFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function lire(formData: FormData) {
  return schema.safeParse({
    nom: formData.get("nom"),
    dci: formData.get("dci") ?? "",
    forme: formData.get("forme") ?? "",
    dosage: formData.get("dosage") ?? "",
    stock: formData.get("stock") ?? 0,
    seuilAlerte: formData.get("seuilAlerte") ?? 10,
    prix: formData.get("prix") ?? 0,
    datePeremption: formData.get("datePeremption") ?? "",
  });
}

function donnees(d: z.infer<typeof schema>) {
  return {
    nom: d.nom,
    dci: d.dci || null,
    forme: d.forme || null,
    dosage: d.dosage || null,
    stock: d.stock,
    seuilAlerte: d.seuilAlerte,
    prix: d.prix,
    datePeremption: d.datePeremption ? new Date(d.datePeremption) : null,
  };
}

export async function creerMedicament(
  _prev: MedicamentFormState,
  formData: FormData
): Promise<MedicamentFormState> {
  await requirePharmacie();
  const parsed = lire(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await prisma.medicament.create({ data: donnees(parsed.data) });
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement." };
  }
  revalidatePath("/pharmacie");
  redirect("/pharmacie");
}

export async function modifierMedicament(
  id: string,
  _prev: MedicamentFormState,
  formData: FormData
): Promise<MedicamentFormState> {
  await requirePharmacie();
  const parsed = lire(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await prisma.medicament.update({
      where: { id },
      data: donnees(parsed.data),
    });
  } catch {
    return { error: "Une erreur est survenue lors de la mise à jour." };
  }
  revalidatePath("/pharmacie");
  redirect("/pharmacie");
}

/** Ajuste le stock d'un delta (+/-) sans passer sous zéro. */
export async function ajusterStock(id: string, delta: number) {
  await requirePharmacie();
  const m = await prisma.medicament.findUnique({ where: { id } });
  if (!m) throw new Error("Médicament introuvable.");
  const nouveau = Math.max(0, m.stock + delta);
  await prisma.medicament.update({
    where: { id },
    data: { stock: nouveau },
  });
  revalidatePath("/pharmacie");
}

export async function supprimerMedicament(id: string) {
  await requirePharmacie();
  await prisma.medicament.delete({ where: { id } });
  revalidatePath("/pharmacie");
  redirect("/pharmacie");
}
