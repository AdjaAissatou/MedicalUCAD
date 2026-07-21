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
};

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
