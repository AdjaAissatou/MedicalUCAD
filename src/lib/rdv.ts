import { prisma } from "./prisma";

/** Durée par défaut d'un rendez-vous, en minutes. */
export const DUREE_RDV_DEFAUT = 30;

/** Horaires d'ouverture du service (minutes depuis minuit). */
const HORAIRE_DEBUT = 8 * 60; // 08h00
const HORAIRE_FIN = 17 * 60; // 17h00

/** Marge de récupération des rendez-vous voisins (pour tester les chevauchements). */
const FENETRE_MS = 2 * 60 * 60 * 1000;

/** Statuts qui n'occupent plus le créneau (donc libèrent la place). */
const STATUTS_LIBERES = ["ANNULE", "ABSENT"];

export type RaisonIndispo =
  | "dimanche"
  | "hors_horaires"
  | "medecin_occupe"
  | "patient_occupe";

/** Message lisible pour une raison d'indisponibilité. */
export function messageIndispo(raison: RaisonIndispo, self = false): string {
  switch (raison) {
    case "dimanche":
      return "Le service médical est fermé le dimanche.";
    case "hors_horaires":
      return "Les consultations ont lieu entre 08h00 et 17h00.";
    case "medecin_occupe":
      return "Ce créneau n'est plus disponible pour ce médecin. Choisissez une autre heure.";
    case "patient_occupe":
      return self
        ? "Vous avez déjà un rendez-vous sur ce créneau."
        : "Ce patient a déjà un rendez-vous sur ce créneau.";
  }
}

/**
 * Vérifie qu'un créneau est réservable :
 *  - dans les horaires d'ouverture (lun–sam, 08h–17h) ;
 *  - sans chevauchement avec un rendez-vous existant du médecin ;
 *  - sans chevauchement avec un autre rendez-vous du patient.
 * Renvoie la raison du refus, ou `null` si le créneau est libre.
 */
export async function verifierDisponibilite(opts: {
  medecinId: string;
  patientId?: string;
  dateHeure: Date;
  duree?: number;
  /** Rendez-vous à ignorer (utile lors d'une modification). */
  ignorerRdvId?: string;
}): Promise<RaisonIndispo | null> {
  const duree = opts.duree ?? DUREE_RDV_DEFAUT;

  // Horaires d'ouverture.
  const jour = opts.dateHeure.getDay(); // 0 = dimanche
  const minutes = opts.dateHeure.getHours() * 60 + opts.dateHeure.getMinutes();
  if (jour === 0) return "dimanche";
  if (minutes < HORAIRE_DEBUT || minutes > HORAIRE_FIN) return "hors_horaires";

  const debut = opts.dateHeure.getTime();
  const fin = debut + duree * 60_000;
  const chevauche = (autreDebut: number, autreDuree: number) => {
    const autreFin = autreDebut + (autreDuree || DUREE_RDV_DEFAUT) * 60_000;
    return autreDebut < fin && debut < autreFin;
  };
  const plage = {
    gte: new Date(debut - FENETRE_MS),
    lte: new Date(fin + FENETRE_MS),
  };
  const exclure = opts.ignorerRdvId ? { id: { not: opts.ignorerRdvId } } : {};

  // Chevauchement côté médecin.
  const rdvMedecin = await prisma.rendezVous.findMany({
    where: {
      medecinId: opts.medecinId,
      statut: { notIn: STATUTS_LIBERES },
      dateHeure: plage,
      ...exclure,
    },
    select: { dateHeure: true, duree: true },
  });
  if (rdvMedecin.some((r) => chevauche(r.dateHeure.getTime(), r.duree))) {
    return "medecin_occupe";
  }

  // Chevauchement côté patient.
  if (opts.patientId) {
    const rdvPatient = await prisma.rendezVous.findMany({
      where: {
        patientId: opts.patientId,
        statut: { notIn: STATUTS_LIBERES },
        dateHeure: plage,
        ...exclure,
      },
      select: { dateHeure: true, duree: true },
    });
    if (rdvPatient.some((r) => chevauche(r.dateHeure.getTime(), r.duree))) {
      return "patient_occupe";
    }
  }

  return null;
}
