"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { TYPES_PATIENT } from "@/lib/constants";

const patientSchema = z.object({
  matricule: z.string().trim().min(1, "Le matricule est obligatoire."),
  nom: z.string().trim().min(1, "Le nom est obligatoire."),
  prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
  dateNaissance: z.string().optional(),
  sexe: z.enum(["M", "F"]).optional().or(z.literal("")),
  telephone: z.string().trim().optional(),
  email: z.string().trim().email("Email invalide.").optional().or(z.literal("")),
  adresse: z.string().trim().optional(),
  type: z.enum(TYPES_PATIENT),
  faculte: z.string().trim().optional(),
  // Dossier médical
  groupeSanguin: z.string().trim().optional(),
  allergies: z.string().trim().optional(),
  antecedentsMedicaux: z.string().trim().optional(),
  antecedentsChirurgicaux: z.string().trim().optional(),
  antecedentsFamiliaux: z.string().trim().optional(),
  traitementEnCours: z.string().trim().optional(),
  observations: z.string().trim().optional(),
});

export type PatientFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseForm(formData: FormData) {
  return patientSchema.safeParse({
    matricule: formData.get("matricule"),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    dateNaissance: formData.get("dateNaissance") ?? "",
    sexe: formData.get("sexe") ?? "",
    telephone: formData.get("telephone") ?? "",
    email: formData.get("email") ?? "",
    adresse: formData.get("adresse") ?? "",
    type: formData.get("type") ?? "ETUDIANT",
    faculte: formData.get("faculte") ?? "",
    groupeSanguin: formData.get("groupeSanguin") ?? "",
    allergies: formData.get("allergies") ?? "",
    antecedentsMedicaux: formData.get("antecedentsMedicaux") ?? "",
    antecedentsChirurgicaux: formData.get("antecedentsChirurgicaux") ?? "",
    antecedentsFamiliaux: formData.get("antecedentsFamiliaux") ?? "",
    traitementEnCours: formData.get("traitementEnCours") ?? "",
    observations: formData.get("observations") ?? "",
  });
}

async function genererNumeroDossier(): Promise<string> {
  const annee = new Date().getFullYear();
  const count = await prisma.dossierMedical.count();
  return `DM-${annee}-${String(count + 1).padStart(4, "0")}`;
}

export async function creerPatient(
  _prev: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const existe = await prisma.patient.findUnique({
    where: { matricule: d.matricule },
  });
  if (existe) {
    return {
      fieldErrors: { matricule: ["Ce matricule est déjà enregistré."] },
    };
  }

  let patientId: string;
  try {
    const numeroDossier = await genererNumeroDossier();
    const patient = await prisma.patient.create({
      data: {
        matricule: d.matricule,
        nom: d.nom,
        prenom: d.prenom,
        dateNaissance: d.dateNaissance ? new Date(d.dateNaissance) : null,
        sexe: d.sexe || null,
        telephone: d.telephone || null,
        email: d.email || null,
        adresse: d.adresse || null,
        type: d.type,
        faculte: d.faculte || null,
        dossier: {
          create: {
            numeroDossier,
            groupeSanguin: d.groupeSanguin || null,
            allergies: d.allergies || null,
            antecedentsMedicaux: d.antecedentsMedicaux || null,
            antecedentsChirurgicaux: d.antecedentsChirurgicaux || null,
            antecedentsFamiliaux: d.antecedentsFamiliaux || null,
            traitementEnCours: d.traitementEnCours || null,
            observations: d.observations || null,
          },
        },
      },
    });
    patientId = patient.id;
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/patients");
  redirect(`/patients/${patientId}`);
}

export async function modifierPatient(
  id: string,
  _prev: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const autre = await prisma.patient.findUnique({
    where: { matricule: d.matricule },
  });
  if (autre && autre.id !== id) {
    return {
      fieldErrors: { matricule: ["Ce matricule est déjà utilisé."] },
    };
  }

  try {
    await prisma.patient.update({
      where: { id },
      data: {
        matricule: d.matricule,
        nom: d.nom,
        prenom: d.prenom,
        dateNaissance: d.dateNaissance ? new Date(d.dateNaissance) : null,
        sexe: d.sexe || null,
        telephone: d.telephone || null,
        email: d.email || null,
        adresse: d.adresse || null,
        type: d.type,
        faculte: d.faculte || null,
        dossier: {
          upsert: {
            create: {
              numeroDossier: await genererNumeroDossier(),
              groupeSanguin: d.groupeSanguin || null,
              allergies: d.allergies || null,
              antecedentsMedicaux: d.antecedentsMedicaux || null,
              antecedentsChirurgicaux: d.antecedentsChirurgicaux || null,
              antecedentsFamiliaux: d.antecedentsFamiliaux || null,
              traitementEnCours: d.traitementEnCours || null,
              observations: d.observations || null,
            },
            update: {
              groupeSanguin: d.groupeSanguin || null,
              allergies: d.allergies || null,
              antecedentsMedicaux: d.antecedentsMedicaux || null,
              antecedentsChirurgicaux: d.antecedentsChirurgicaux || null,
              antecedentsFamiliaux: d.antecedentsFamiliaux || null,
              traitementEnCours: d.traitementEnCours || null,
              observations: d.observations || null,
            },
          },
        },
      },
    });
  } catch {
    return { error: "Une erreur est survenue lors de la mise à jour." };
  }

  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  redirect(`/patients/${id}`);
}

export async function supprimerPatient(id: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "MEDECIN") {
    throw new Error("Action non autorisée.");
  }
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/patients");
  redirect("/patients");
}
