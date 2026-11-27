import type { SessionUser } from "./session";

/** Rôles autorisés à gérer l'administration du site. */
export function estAdmin(user: Pick<SessionUser, "role"> | null): boolean {
  return user?.role === "ADMIN";
}

/** Compte étudiant (espace self-service, accès à son propre dossier). */
export function estEtudiant(user: Pick<SessionUser, "role"> | null): boolean {
  return user?.role === "ETUDIANT";
}

/** Membre du personnel (tout rôle sauf étudiant). */
export function estPersonnel(user: Pick<SessionUser, "role"> | null): boolean {
  return !!user && user.role !== "ETUDIANT";
}

/** Peut réaliser des actes médicaux (consultations, orientations, ordonnances). */
export function estSoignant(user: Pick<SessionUser, "role"> | null): boolean {
  return (
    user?.role === "MEDECIN" ||
    user?.role === "INFIRMIER" ||
    user?.role === "ADMIN"
  );
}

/** Peut gérer la pharmacie (stock, dispensation). */
export function gerePharmacie(user: Pick<SessionUser, "role"> | null): boolean {
  return user?.role === "PHARMACIEN" || user?.role === "ADMIN";
}

/** Peut créer/modifier les dossiers patients et rendez-vous. */
export function gereDossiers(user: Pick<SessionUser, "role"> | null): boolean {
  return (
    user?.role === "ADMIN" ||
    user?.role === "MEDECIN" ||
    user?.role === "INFIRMIER" ||
    user?.role === "SECRETAIRE"
  );
}

/** Peut supprimer un dossier patient (action sensible, réservée). */
export function peutSupprimerDossier(
  user: Pick<SessionUser, "role"> | null
): boolean {
  return user?.role === "ADMIN" || user?.role === "MEDECIN";
}

/** Clés des modules de l'espace personnel. */
export type CleModule =
  | "tableau-de-bord"
  | "patients"
  | "rendez-vous"
  | "consultations"
  | "orientations"
  | "pharmacie"
  | "administration";

/**
 * Accès à un module (navigation + ouverture des pages), par rôle.
 * Source unique de vérité pour séparer logiquement les espaces :
 *   soins · accueil/dossiers · pharmacie · administration.
 */
export function peutAccederModule(
  user: Pick<SessionUser, "role"> | null,
  cle: CleModule
): boolean {
  switch (cle) {
    case "tableau-de-bord":
      return estPersonnel(user);
    case "patients":
    case "rendez-vous":
      return gereDossiers(user);
    case "consultations":
    case "orientations":
      return estSoignant(user);
    case "pharmacie":
      return gerePharmacie(user);
    case "administration":
      return estAdmin(user);
    default:
      return false;
  }
}
