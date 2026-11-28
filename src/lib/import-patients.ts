import { TYPES_PATIENT } from "./constants";

/**
 * Import de patients en masse — parsing + validation partagés entre le client
 * (aperçu) et le serveur (création). Module pur, sans accès base ni DOM.
 */

export const COLONNES_IMPORT = [
  { cle: "matricule", libelle: "Matricule", requis: true },
  { cle: "nom", libelle: "Nom", requis: true },
  { cle: "prenom", libelle: "Prénom", requis: true },
  { cle: "type", libelle: "Type", requis: false },
  { cle: "naissance", libelle: "Date de naissance", requis: false },
  { cle: "sexe", libelle: "Sexe", requis: false },
  { cle: "telephone", libelle: "Téléphone", requis: false },
  { cle: "email", libelle: "Email", requis: false },
  { cle: "faculte", libelle: "Faculté", requis: false },
  { cle: "groupe", libelle: "Groupe sanguin", requis: false },
] as const;

export type CleColonne = (typeof COLONNES_IMPORT)[number]["cle"];
export type LigneBrute = Partial<Record<CleColonne, string>>;

export type DonneesPatient = {
  matricule: string;
  nom: string;
  prenom: string;
  type: string;
  dateNaissance: string | null; // ISO (YYYY-MM-DD)
  sexe: string | null;
  telephone: string | null;
  email: string | null;
  faculte: string | null;
  groupeSanguin: string | null;
};

export type LigneValidee = {
  ligne: number; // 1-based (hors en-tête)
  brut: LigneBrute;
  data?: DonneesPatient;
  erreurs: string[];
};

function sansAccents(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Détecte le séparateur (`,` `;` ou tabulation) sur la première ligne. */
function detecterSeparateur(texte: string): string {
  const premiere = texte.split(/\r?\n/)[0] ?? "";
  const tabs = (premiere.match(/\t/g) || []).length;
  const pts = (premiere.match(/;/g) || []).length;
  const virg = (premiere.match(/,/g) || []).length;
  if (tabs >= pts && tabs >= virg && tabs > 0) return "\t";
  return pts > virg ? ";" : ",";
}

/** Parseur CSV minimal gérant les guillemets et les doubles guillemets. */
export function parseCSV(texte: string): string[][] {
  const sep = detecterSeparateur(texte);
  const lignes: string[][] = [];
  let champ = "";
  let ligne: string[] = [];
  let dansGuillemets = false;

  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (dansGuillemets) {
      if (c === '"') {
        if (texte[i + 1] === '"') {
          champ += '"';
          i++;
        } else {
          dansGuillemets = false;
        }
      } else {
        champ += c;
      }
    } else if (c === '"') {
      dansGuillemets = true;
    } else if (c === sep) {
      ligne.push(champ);
      champ = "";
    } else if (c === "\n") {
      ligne.push(champ);
      lignes.push(ligne);
      ligne = [];
      champ = "";
    } else if (c !== "\r") {
      champ += c;
    }
  }
  if (champ !== "" || ligne.length) {
    ligne.push(champ);
    lignes.push(ligne);
  }
  return lignes.filter((l) => l.some((x) => x.trim() !== ""));
}

const SYNONYMES: Record<string, CleColonne> = {
  matricule: "matricule",
  "n carte etudiant": "matricule",
  "n carte": "matricule",
  carte: "matricule",
  nom: "nom",
  prenom: "prenom",
  type: "type",
  naissance: "naissance",
  "date de naissance": "naissance",
  "date naissance": "naissance",
  ddn: "naissance",
  sexe: "sexe",
  genre: "sexe",
  telephone: "telephone",
  tel: "telephone",
  email: "email",
  mail: "email",
  courriel: "email",
  faculte: "faculte",
  ufr: "faculte",
  groupe: "groupe",
  "groupe sanguin": "groupe",
};

/** Associe chaque en-tête du fichier à une clé connue (ou null). */
function indexerEntetes(entetes: string[]): (CleColonne | null)[] {
  return entetes.map((e) => SYNONYMES[sansAccents(e)] ?? null);
}

/**
 * Transforme un CSV collé/chargé en lignes brutes exploitables.
 * Détecte une éventuelle ligne d'en-tête ; sinon applique l'ordre par défaut.
 */
export function lignesDepuisCSV(texte: string): LigneBrute[] {
  const rows = parseCSV(texte);
  if (rows.length === 0) return [];

  const mappingEntete = indexerEntetes(rows[0]);
  const aEntete = mappingEntete.some((m) => m !== null);
  const ordreParDefaut = COLONNES_IMPORT.map((c) => c.cle);
  const mapping = aEntete ? mappingEntete : ordreParDefaut;
  const donnees = aEntete ? rows.slice(1) : rows;

  return donnees.map((cells) => {
    const brut: LigneBrute = {};
    cells.forEach((valeur, i) => {
      const cle = mapping[i];
      if (cle) brut[cle] = valeur.trim();
    });
    return brut;
  });
}

const RE_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function normaliserType(v?: string): string {
  const k = sansAccents(v ?? "");
  if (!k) return "ETUDIANT";
  if (["etudiant", "student", "eleve"].includes(k)) return "ETUDIANT";
  if (["personnel", "agent", "enseignant", "staff", "employe"].includes(k))
    return "PERSONNEL";
  if (["autre", "externe", "visiteur"].includes(k)) return "AUTRE";
  return "AUTRE";
}

function normaliserSexe(v?: string): string | null {
  const k = sansAccents(v ?? "");
  if (["m", "masculin", "homme", "h", "male"].includes(k)) return "M";
  if (["f", "feminin", "femme", "female"].includes(k)) return "F";
  return null;
}

/** Parse une date FR (JJ/MM/AAAA) ou ISO (AAAA-MM-JJ). */
function parseDate(v: string): { iso: string | null; invalide: boolean } {
  const s = v.trim();
  if (!s) return { iso: null, invalide: false };
  let y: number, m: number, d: number;
  const fr = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (fr) {
    d = +fr[1];
    m = +fr[2];
    y = +fr[3];
  } else if (iso) {
    y = +iso[1];
    m = +iso[2];
    d = +iso[3];
  } else {
    return { iso: null, invalide: true };
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d ||
    y < 1900 ||
    date.getTime() > Date.now()
  ) {
    return { iso: null, invalide: true };
  }
  return { iso: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, invalide: false };
}

/** Valide une ligne brute et renvoie les données normalisées + erreurs. */
export function validerLigne(brut: LigneBrute, ligne: number): LigneValidee {
  const erreurs: string[] = [];
  const matricule = (brut.matricule ?? "").trim();
  const nom = (brut.nom ?? "").trim();
  const prenom = (brut.prenom ?? "").trim();

  if (!matricule) erreurs.push("Matricule manquant");
  if (!nom) erreurs.push("Nom manquant");
  if (!prenom) erreurs.push("Prénom manquant");

  const type = normaliserType(brut.type);
  if (!TYPES_PATIENT.includes(type as (typeof TYPES_PATIENT)[number])) {
    erreurs.push("Type invalide");
  }

  const { iso: dateNaissance, invalide } = parseDate(brut.naissance ?? "");
  if (invalide) erreurs.push("Date de naissance invalide (attendu JJ/MM/AAAA)");

  const email = (brut.email ?? "").trim();
  if (email && !RE_EMAIL.test(email)) erreurs.push("Email invalide");

  if (erreurs.length) return { ligne, brut, erreurs };

  return {
    ligne,
    brut,
    erreurs: [],
    data: {
      matricule,
      nom,
      prenom,
      type,
      dateNaissance,
      sexe: normaliserSexe(brut.sexe),
      telephone: (brut.telephone ?? "").trim() || null,
      email: email || null,
      faculte: (brut.faculte ?? "").trim() || null,
      groupeSanguin: (brut.groupe ?? "").trim() || null,
    },
  };
}

/** Exemple de contenu CSV (en-tête + 2 lignes) pour le modèle téléchargeable. */
export function modeleCSV(): string {
  const entete = COLONNES_IMPORT.map((c) => c.libelle).join(",");
  return [
    entete,
    "20231234,Diop,Awa,Étudiant,12/05/2003,F,77 123 45 67,awa.diop@ucad.edu.sn,Faculté des Sciences (FST),O+",
    "AG-0456,Ndiaye,Moussa,Personnel,03/09/1985,M,,m.ndiaye@ucad.edu.sn,,A+",
  ].join("\n");
}
