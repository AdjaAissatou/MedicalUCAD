import { prisma } from "./prisma";
import { ROLE_LABELS } from "./constants";

export async function optionsPatients() {
  const patients = await prisma.patient.findMany({
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, prenom: true, matricule: true },
  });
  return patients.map((p) => ({
    id: p.id,
    label: `${p.prenom} ${p.nom}`,
    sous: p.matricule,
  }));
}

export async function optionsMedecins() {
  const medecins = await prisma.user.findMany({
    where: { role: "MEDECIN", actif: true },
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, prenom: true, specialite: true, role: true },
  });
  return medecins.map((m) => ({
    id: m.id,
    label: `Dr ${m.prenom} ${m.nom}`,
    sous: m.specialite ?? ROLE_LABELS[m.role],
  }));
}
