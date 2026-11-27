import type { BadgeProps } from "@/components/ui/badge";

export const ROLES = [
  "ADMIN",
  "MEDECIN",
  "PHARMACIEN",
  "INFIRMIER",
  "SECRETAIRE",
] as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  MEDECIN: "Médecin",
  PHARMACIEN: "Pharmacien",
  INFIRMIER: "Infirmier",
  SECRETAIRE: "Secrétaire",
  ETUDIANT: "Étudiant",
};

// Rôle réservé aux comptes self-service liés à un dossier patient.
// Non proposé dans le formulaire de création d'utilisateur du personnel.
export const ROLE_ETUDIANT = "ETUDIANT";

export const TYPES_PATIENT = ["ETUDIANT", "PERSONNEL", "AUTRE"] as const;

export const TYPE_PATIENT_LABELS: Record<string, string> = {
  ETUDIANT: "Étudiant",
  PERSONNEL: "Personnel",
  AUTRE: "Autre",
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
