"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { gereDossiers } from "@/lib/authz";
import { journaliser } from "@/lib/audit";

async function garde() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!gereDossiers(user)) throw new Error("Action non autorisée.");
  return user;
}

function texte(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

// ─── Antécédents ───
export async function ajouterAntecedent(formData: FormData) {
  const user = await garde();
  const dossierId = texte(formData.get("dossierId"));
  const patientId = texte(formData.get("patientId"));
  const libelle = texte(formData.get("libelle"));
  if (!dossierId || !libelle) return;
  await prisma.antecedentMedical.create({
    data: {
      dossierId,
      type: texte(formData.get("type")) || "MEDICAL",
      libelle,
      annee: texte(formData.get("annee")) || null,
      notes: texte(formData.get("notes")) || null,
    },
  });
  await journaliser({
    user,
    action: "antecedent.add",
    cible: `dossier#${dossierId}`,
    details: libelle,
  });
  if (patientId) revalidatePath(`/patients/${patientId}`);
}

export async function supprimerAntecedent(formData: FormData) {
  const user = await garde();
  const id = texte(formData.get("id"));
  const patientId = texte(formData.get("patientId"));
  if (id) {
    await prisma.antecedentMedical.delete({ where: { id } });
    await journaliser({ user, action: "antecedent.delete", cible: `antecedent#${id}` });
  }
  if (patientId) revalidatePath(`/patients/${patientId}`);
}

// ─── Allergies ───
export async function ajouterAllergie(formData: FormData) {
  const user = await garde();
  const dossierId = texte(formData.get("dossierId"));
  const patientId = texte(formData.get("patientId"));
  const substance = texte(formData.get("substance"));
  if (!dossierId || !substance) return;
  await prisma.allergie.create({
    data: {
      dossierId,
      substance,
      type: texte(formData.get("type")) || "MEDICAMENTEUSE",
      severite: texte(formData.get("severite")) || null,
      reaction: texte(formData.get("reaction")) || null,
    },
  });
  await journaliser({
    user,
    action: "allergie.add",
    cible: `dossier#${dossierId}`,
    details: substance,
  });
  if (patientId) revalidatePath(`/patients/${patientId}`);
}

export async function supprimerAllergie(formData: FormData) {
  const user = await garde();
  const id = texte(formData.get("id"));
  const patientId = texte(formData.get("patientId"));
  if (id) {
    await prisma.allergie.delete({ where: { id } });
    await journaliser({ user, action: "allergie.delete", cible: `allergie#${id}` });
  }
  if (patientId) revalidatePath(`/patients/${patientId}`);
}

// ─── Vaccinations ───
export async function ajouterVaccination(formData: FormData) {
  const user = await garde();
  const dossierId = texte(formData.get("dossierId"));
  const patientId = texte(formData.get("patientId"));
  const vaccin = texte(formData.get("vaccin"));
  if (!dossierId || !vaccin) return;
  const dateAdmin = texte(formData.get("dateAdmin"));
  const rappel = texte(formData.get("rappel"));
  await prisma.vaccination.create({
    data: {
      dossierId,
      vaccin,
      dateAdmin: dateAdmin ? new Date(dateAdmin) : null,
      rappel: rappel ? new Date(rappel) : null,
      notes: texte(formData.get("notes")) || null,
    },
  });
  await journaliser({
    user,
    action: "vaccination.add",
    cible: `dossier#${dossierId}`,
    details: vaccin,
  });
  if (patientId) revalidatePath(`/patients/${patientId}`);
}

export async function supprimerVaccination(formData: FormData) {
  const user = await garde();
  const id = texte(formData.get("id"));
  const patientId = texte(formData.get("patientId"));
  if (id) {
    await prisma.vaccination.delete({ where: { id } });
    await journaliser({ user, action: "vaccination.delete", cible: `vaccination#${id}` });
  }
  if (patientId) revalidatePath(`/patients/${patientId}`);
}
