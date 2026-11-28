import type { BadgeProps } from "@/components/ui/badge";

export const ROLES = [
  "ADMIN",
  "DIRECTION",
  "MEDECIN",
  "INFIRMIER",
  "LABORANTIN",
  "PHARMACIEN",
  "SECRETAIRE",
] as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  DIRECTION: "Direction",
  MEDECIN: "Médecin",
  INFIRMIER: "Infirmier",
  LABORANTIN: "Laborantin",
  PHARMACIEN: "Pharmacien",
  SECRETAIRE: "Secrétaire",
  ETUDIANT: "Étudiant",
};

// Rôle réservé aux comptes self-service liés à un dossier patient.
// Non proposé dans le formulaire de création d'utilisateur du personnel.
export const ROLE_ETUDIANT = "ETUDIANT";

export const TYPES_PATIENT = ["ETUDIANT", "PERSONNEL", "AUTRE"] as const;

export const TYPE_PATIENT_LABELS: Record<string, string> = {
  ETUDIANT: "Étudiant",
  PERSONNEL: "Personnel UCAD (enseignant, agent)",
  AUTRE: "Autre (externe)",
};

export const STATUTS_RDV = [
  "PLANIFIE",
  "CONFIRME",
  "EN_COURS",
  "TERMINE",
  "ANNULE",
  "ABSENT",
] as const;

export const STATUT_RDV_LABELS: Record<string, string> = {
  PLANIFIE: "Planifié",
  CONFIRME: "Confirmé",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
  ABSENT: "Absent",
};

export const STATUT_RDV_VARIANTS: Record<string, BadgeProps["variant"]> = {
  PLANIFIE: "info",
  CONFIRME: "primary",
  EN_COURS: "warning",
  TERMINE: "success",
  ANNULE: "neutral",
  ABSENT: "destructive",
};

// Machine à états des rendez-vous : transitions autorisées depuis chaque statut.
// « Terminé » est un état final ; « Annulé » / « Absent » peuvent être reprogrammés.
export const TRANSITIONS_RDV: Record<string, readonly string[]> = {
  PLANIFIE: ["CONFIRME", "EN_COURS", "ANNULE", "ABSENT"],
  CONFIRME: ["EN_COURS", "PLANIFIE", "ANNULE", "ABSENT"],
  EN_COURS: ["TERMINE", "ANNULE", "ABSENT"],
  TERMINE: [],
  ANNULE: ["PLANIFIE"],
  ABSENT: ["PLANIFIE"],
};

export const GROUPES_SANGUINS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const FACULTES = [
  "Faculté de Médecine (FMPO)",
  "Faculté des Sciences et Techniques (FST)",
  "Faculté des Lettres et Sciences Humaines (FLSH)",
  "Faculté des Sciences Juridiques et Politiques (FSJP)",
  "Faculté des Sciences Économiques et de Gestion (FASEG)",
  "Faculté des Sciences et Technologies de l'Éducation (FASTEF)",
  "École Supérieure Polytechnique (ESP)",
  "Personnel administratif et technique",
  "Autre",
] as const;

// ─── Examens ───
export const STATUTS_EXAMEN = [
  "DEMANDE",
  "EN_COURS",
  "TERMINE",
  "ANNULE",
] as const;

export const STATUT_EXAMEN_LABELS: Record<string, string> = {
  DEMANDE: "Demandé",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export const STATUT_EXAMEN_VARIANTS: Record<string, BadgeProps["variant"]> = {
  DEMANDE: "info",
  EN_COURS: "warning",
  TERMINE: "success",
  ANNULE: "neutral",
};

export const CATEGORIES_EXAMEN = ["BIOLOGIE", "IMAGERIE", "AUTRE"] as const;

export const CATEGORIE_EXAMEN_LABELS: Record<string, string> = {
  BIOLOGIE: "Biologie",
  IMAGERIE: "Imagerie",
  AUTRE: "Autre",
};

export const PRIORITES_EXAMEN = ["NORMALE", "URGENTE"] as const;

export const PRIORITE_EXAMEN_LABELS: Record<string, string> = {
  NORMALE: "Normale",
  URGENTE: "Urgente",
};

// ─── Spécialités (proposées selon le rôle) ───
export const SPECIALITES_MEDECIN = [
  "Médecine générale",
  "Médecine du travail",
  "Cardiologie",
  "Dermatologie",
  "Gynécologie",
  "Pédiatrie",
  "Ophtalmologie",
  "Oto-rhino-laryngologie (ORL)",
  "Psychiatrie",
  "Gastro-entérologie",
  "Pneumologie",
] as const;

export const SPECIALITES_INFIRMIER = [
  "Soins infirmiers généraux",
  "Soins d'urgence",
  "Santé communautaire",
] as const;

/** Spécialités disponibles par rôle (absent = champ spécialité masqué). */
export const SPECIALITES_PAR_ROLE: Record<string, readonly string[]> = {
  MEDECIN: SPECIALITES_MEDECIN,
  INFIRMIER: SPECIALITES_INFIRMIER,
};
