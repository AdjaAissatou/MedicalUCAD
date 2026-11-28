"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { enregistrePatients } from "@/lib/authz";
import { journaliser } from "@/lib/audit";
import { validerLigne, type LigneBrute } from "@/lib/import-patients";

export type RejetImport = {
  ligne: number;
  matricule?: string;
  raisons: string[];
};

export type ResultatImport = {
  crees: number;
  ignores: RejetImport[]; // déjà présents
  rejets: RejetImport[]; // invalides ou en double
  erreur?: string;
};

/**
 * Crée en masse des dossiers patients à partir de lignes brutes
 * (import CSV ou saisie rapide). Revalide et re-valide tout côté serveur.
 */
export async function importerPatients(
  lignes: LigneBrute[]
): Promise<ResultatImport> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!enregistrePatients(user)) {
    return {
      crees: 0,
      ignores: [],
      rejets: [],
      erreur:
        "Action non autorisée : seul le secrétariat peut enregistrer des dossiers.",
    };
  }

  if (!Array.isArray(lignes) || lignes.length === 0) {
    return { crees: 0, ignores: [], rejets: [], erreur: "Aucune ligne à importer." };
  }
  if (lignes.length > 2000) {
    return {
      crees: 0,
      ignores: [],
      rejets: [],
      erreur: "Trop de lignes à la fois (maximum 2000). Scindez le fichier.",
    };
  }

  const rejets: RejetImport[] = [];
  const valides: { data: NonNullable<ReturnType<typeof validerLigne>["data"]> }[] =
    [];
  const vusDansLot = new Set<string>();

  lignes.forEach((brut, i) => {
    const v = validerLigne(brut, i + 1);
    if (!v.data) {
      rejets.push({ ligne: i + 1, matricule: brut.matricule, raisons: v.erreurs });
      return;
    }
    if (vusDansLot.has(v.data.matricule)) {
      rejets.push({
        ligne: i + 1,
        matricule: v.data.matricule,
        raisons: ["Matricule en double dans le fichier"],
      });
      return;
    }
    vusDansLot.add(v.data.matricule);
    valides.push({ data: v.data });
  });

  // Déduplication contre les dossiers déjà enregistrés.
  const matricules = valides.map((v) => v.data.matricule);
  const existants = await prisma.patient.findMany({
    where: { matricule: { in: matricules } },
    select: { matricule: true },
  });
  const dejaLa = new Set(existants.map((e) => e.matricule));

  const ignores: RejetImport[] = [];
  const aCreer = valides.filter((v) => {
    if (dejaLa.has(v.data.matricule)) {
      ignores.push({
        ligne: 0,
        matricule: v.data.matricule,
        raisons: ["Dossier déjà existant"],
      });
      return false;
    }
    return true;
  });

  // Numéro de dossier séquentiel : on calcule la base une seule fois.
  const annee = new Date().getFullYear();
  let compteur = await prisma.dossierMedical.count();
  let crees = 0;

  for (const { data } of aCreer) {
    compteur++;
    const numeroDossier = `DM-${annee}-${String(compteur).padStart(4, "0")}`;
    try {
      await prisma.patient.create({
        data: {
          matricule: data.matricule,
          nom: data.nom,
          prenom: data.prenom,
          type: data.type,
          dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
          sexe: data.sexe,
          telephone: data.telephone,
          email: data.email,
          faculte: data.faculte,
          dossier: {
            create: {
              numeroDossier,
              groupeSanguin: data.groupeSanguin,
            },
          },
        },
      });
      crees++;
    } catch {
      compteur--; // le numéro n'a pas été consommé
      rejets.push({
        matricule: data.matricule,
        ligne: 0,
        raisons: ["Échec de l'enregistrement (matricule déjà pris ?)"],
      });
    }
  }

  if (crees > 0) {
    await journaliser({
      user,
      action: "patient.import",
      cible: `${crees} dossier(s)`,
      details: `importés : ${crees}, ignorés : ${ignores.length}, rejetés : ${rejets.length}`,
    });
    revalidatePath("/patients");
  }

  return { crees, ignores, rejets };
}
