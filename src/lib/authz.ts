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
  return user?.role === "MEDECIN" || user?.role === "INFIRMIER";
}

/** Direction : supervision et statistiques agrégées (aucune donnée nominative). */
export function estDirection(user: Pick<SessionUser, "role"> | null): boolean {
  return user?.role === "DIRECTION";
}

/** Laborantin : examens et résultats de laboratoire. */
export function estLaborantin(user: Pick<SessionUser, "role"> | null): boolean {
  return user?.role === "LABORANTIN";
}

/** Peut gérer la pharmacie (stock, dispensation). */
export function gerePharmacie(user: Pick<SessionUser, "role"> | null): boolean {
  return user?.role === "PHARMACIEN";
}

/**
 * Peut créer/modifier les dossiers patients et rendez-vous.
 * L'administrateur (technique) n'a pas accès aux données médicales.
 */
export function gereDossiers(user: Pick<SessionUser, "role"> | null): boolean {
  return (
    user?.role === "MEDECIN" ||
    user?.role === "INFIRMIER" ||
    user?.role === "SECRETAIRE"
  );
}

/** Peut supprimer un dossier patient (acte clinique sensible, réservé). */
export function peutSupprimerDossier(
  user: Pick<SessionUser, "role"> | null
): boolean {
  return user?.role === "MEDECIN";
}

/** Clés des modules de l'espace personnel. */
export type CleModule =
  | "tableau-de-bord"
  | "patients"
  | "rendez-vous"
  | "consultations"
  | "orientations"
  | "pharmacie"
  | "administration"
  | "supervision";

/**
 * Accès à un module (navigation + ouverture des pages), par rôle.
 * Source unique de vérité pour séparer logiquement les espaces :
 *   soins · accueil/dossiers · pharmacie · administration · direction.
 */
export function peutAccederModule(
  user: Pick<SessionUser, "role"> | null,
  cle: CleModule
): boolean {
  switch (cle) {
    case "tableau-de-bord":
      // Tableau de bord opérationnel : personnel de terrain seulement.
      // L'admin technique et la direction ont leur propre espace.
      return estPersonnel(user) && !estAdmin(user) && !estDirection(user);
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
    case "supervision":
      return estDirection(user);
    default:
      return false;
  }
}

/** Page d'accueil par défaut selon le rôle (espaces séparés). */
export function accueilParRole(
  user: Pick<SessionUser, "role"> | null
): string {
  if (!user) return "/login";
  if (user.role === "ETUDIANT") return "/espace-etudiant";
  if (user.role === "ADMIN") return "/administration";
  if (user.role === "DIRECTION") return "/supervision";
  return "/tableau-de-bord";
}
