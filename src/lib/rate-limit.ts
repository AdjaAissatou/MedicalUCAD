import "server-only";

/**
 * Limiteur de débit simple en mémoire (fenêtre glissante).
 * Suffisant pour une instance unique. Pour un déploiement multi-instances,
 * remplacer le magasin par Redis/Upstash.
 */
type Entree = { count: number; reset: number };
const magasin = new Map<string, Entree>();

// Nettoyage périodique des entrées expirées.
let dernierNettoyage = Date.now();
function nettoyer(maintenant: number) {
  if (maintenant - dernierNettoyage < 60_000) return;
  dernierNettoyage = maintenant;
  for (const [cle, e] of magasin) {
    if (e.reset < maintenant) magasin.delete(cle);
  }
}

export type ResultatLimite = {
  autorise: boolean;
  restant: number;
  resetDansSec: number;
};

/**
 * @param cle       identifiant (ex : `login:ip:email`)
 * @param max       nombre de tentatives autorisées dans la fenêtre
 * @param fenetreMs durée de la fenêtre en millisecondes
 */
export function limiterDebit(
  cle: string,
  max: number,
  fenetreMs: number
): ResultatLimite {
  const maintenant = Date.now();
  nettoyer(maintenant);

  const e = magasin.get(cle);
  if (!e || e.reset < maintenant) {
    magasin.set(cle, { count: 1, reset: maintenant + fenetreMs });
    return { autorise: true, restant: max - 1, resetDansSec: fenetreMs / 1000 };
  }

  e.count += 1;
  const resetDansSec = Math.ceil((e.reset - maintenant) / 1000);
  if (e.count > max) {
    return { autorise: false, restant: 0, resetDansSec };
  }
  return { autorise: true, restant: max - e.count, resetDansSec };
}

/** Réinitialise le compteur (ex : après une connexion réussie). */
export function reinitialiserLimite(cle: string) {
  magasin.delete(cle);
}
