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
