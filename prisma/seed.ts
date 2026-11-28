import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function jour(offsetJours: number, heure: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetJours);
  d.setHours(heure, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Réinitialisation des données…");
  await prisma.ligneOrdonnance.deleteMany();
  await prisma.ordonnance.deleteMany();
  await prisma.orientation.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.rendezVous.deleteMany();
  await prisma.dossierMedical.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medicament.deleteMany();
  await prisma.user.deleteMany();

  const motDePasse = await bcrypt.hash("passer123", 10);

  console.log("👤 Création des utilisateurs…");
  const admin = await prisma.user.create({
    data: {
      email: "admin@ucad.edu.sn",
      motDePasse,
      nom: "Diallo",
      prenom: "Awa",
      role: "ADMIN",
      telephone: "+221 77 100 00 01",
    },
  });

  const medecin1 = await prisma.user.create({
    data: {
      email: "medecin@ucad.edu.sn",
      motDePasse,
      nom: "Ndiaye",
      prenom: "Ousmane",
      role: "MEDECIN",
      specialite: "Médecine générale",
      telephone: "+221 77 100 00 02",
    },
  });

  const medecin2 = await prisma.user.create({
    data: {
      email: "sy@ucad.edu.sn",
      motDePasse,
      nom: "Sy",
      prenom: "Fatou",
      role: "MEDECIN",
      specialite: "Dentiste",
      telephone: "+221 77 100 00 03",
    },
  });

  await prisma.user.create({
    data: {
      email: "pharmacie@ucad.edu.sn",
      motDePasse,
      nom: "Ba",
      prenom: "Moussa",
      role: "PHARMACIEN",
      telephone: "+221 77 100 00 04",
    },
  });

  await prisma.user.create({
    data: {
      email: "direction@ucad.edu.sn",
      motDePasse,
      nom: "Sow",
      prenom: "Awa",
      role: "DIRECTION",
      telephone: "+221 77 100 00 05",
    },
  });

  await prisma.user.create({
    data: {
      email: "infirmier@ucad.edu.sn",
      motDePasse,
      nom: "Diouf",
      prenom: "Khady",
      role: "INFIRMIER",
      telephone: "+221 77 100 00 06",
    },
  });

  await prisma.user.create({
    data: {
      email: "laborantin@ucad.edu.sn",
      motDePasse,
      nom: "Kane",
      prenom: "Modou",
      role: "LABORANTIN",
      telephone: "+221 77 100 00 07",
    },
  });

  await prisma.user.create({
    data: {
      email: "secretaire@ucad.edu.sn",
      motDePasse,
      nom: "Mbaye",
      prenom: "Ndeye",
      role: "SECRETAIRE",
      telephone: "+221 77 100 00 08",
    },
  });

  console.log("🧑‍🎓 Création des patients…");
  const patientsData = [
    {
      matricule: "20231045",
      nom: "Faye",
      prenom: "Aïssatou",
      sexe: "F",
      dateNaissance: new Date("2002-03-15"),
      telephone: "+221 78 200 10 01",
      email: "aissatou.faye@ucad.edu.sn",
      type: "ETUDIANT",
      faculte: "Faculté des Sciences et Techniques (FST)",
      dossier: {
        groupeSanguin: "O+",
        allergies: "Pénicilline",
        antecedentsMedicaux: "Asthme léger depuis l'enfance.",
        traitementEnCours: "Ventoline en cas de crise.",
      },
    },
    {
      matricule: "20219988",
      nom: "Gueye",
      prenom: "Mamadou",
      sexe: "M",
      dateNaissance: new Date("2001-07-22"),
      telephone: "+221 78 200 10 02",
      type: "ETUDIANT",
      faculte: "Faculté des Sciences Économiques et de Gestion (FASEG)",
      dossier: {
        groupeSanguin: "A+",
        antecedentsFamiliaux: "Diabète (père).",
      },
    },
    {
      matricule: "PERS-0421",
      nom: "Sarr",
      prenom: "Bineta",
      sexe: "F",
      dateNaissance: new Date("1985-11-03"),
      telephone: "+221 78 200 10 03",
      email: "bineta.sarr@ucad.edu.sn",
      type: "PERSONNEL",
      faculte: "Personnel administratif et technique",
      dossier: {
        groupeSanguin: "B+",
        antecedentsMedicaux: "Hypertension artérielle.",
        traitementEnCours: "Amlodipine 5mg/jour.",
      },
    },
    {
      matricule: "20228833",
      nom: "Diop",
      prenom: "Cheikh",
      sexe: "M",
      dateNaissance: new Date("2003-01-30"),
      telephone: "+221 78 200 10 04",
      type: "ETUDIANT",
      faculte: "École Supérieure Polytechnique (ESP)",
      dossier: { groupeSanguin: "AB+" },
    },
    {
      matricule: "20205577",
      nom: "Ndour",
      prenom: "Sokhna",
      sexe: "F",
      dateNaissance: new Date("2000-09-12"),
      telephone: "+221 78 200 10 05",
      email: "sokhna.ndour@ucad.edu.sn",
      type: "ETUDIANT",
      faculte: "Faculté de Médecine (FMPO)",
      dossier: {
        groupeSanguin: "O-",
        allergies: "Arachide",
        antecedentsChirurgicaux: "Appendicectomie (2018).",
      },
    },
  ];

  const patients = [];
  let n = 1;
  for (const p of patientsData) {
    const { dossier, ...rest } = p;
    const patient = await prisma.patient.create({
      data: {
        ...rest,
        dossier: {
          create: {
            numeroDossier: `DM-2026-${String(n).padStart(4, "0")}`,
            ...dossier,
          },
        },
      },
    });
    patients.push(patient);
    n++;
  }

  console.log("🧬 Création du dossier structuré (démo)…");
  const dossiers = await prisma.dossierMedical.findMany({
    where: {
      patientId: { in: [patients[0].id, patients[2].id, patients[4].id] },
    },
    select: { id: true, patientId: true },
  });
  const dossierDe = (pid: string) =>
    dossiers.find((x) => x.patientId === pid)?.id;
  const dA = dossierDe(patients[0].id);
  const dB = dossierDe(patients[2].id);
  const dC = dossierDe(patients[4].id);
  if (dA) {
    await prisma.allergie.create({
      data: { dossierId: dA, substance: "Pénicilline", type: "MEDICAMENTEUSE", severite: "MODEREE", reaction: "Urticaire généralisée" },
    });
    await prisma.antecedentMedical.create({
      data: { dossierId: dA, type: "CHRONIQUE", libelle: "Asthme allergique", annee: "Enfance", notes: "Crises saisonnières." },
    });
    await prisma.vaccination.create({
      data: { dossierId: dA, vaccin: "Fièvre jaune", dateAdmin: new Date("2021-05-10"), rappel: new Date("2031-05-10") },
    });
  }
  if (dB) {
    await prisma.antecedentMedical.create({
      data: { dossierId: dB, type: "CHRONIQUE", libelle: "Hypertension artérielle", notes: "Sous Amlodipine 5mg." },
    });
  }
  if (dC) {
    await prisma.allergie.create({
      data: { dossierId: dC, substance: "Arachide", type: "ALIMENTAIRE", severite: "SEVERE", reaction: "Œdème de Quincke" },
    });
    await prisma.antecedentMedical.create({
      data: { dossierId: dC, type: "CHIRURGICAL", libelle: "Appendicectomie", annee: "2018" },
    });
    await prisma.vaccination.create({
      data: { dossierId: dC, vaccin: "Hépatite B", dateAdmin: new Date("2019-03-01") },
    });
  }

  console.log("🎓 Création d'un accès étudiant de démonstration…");
  await prisma.user.create({
    data: {
      email: "aissatou.faye@ucad.edu.sn",
      motDePasse,
      nom: patients[0].nom,
      prenom: patients[0].prenom,
      role: "ETUDIANT",
      patientId: patients[0].id,
    },
  });

  console.log("📅 Création des rendez-vous…");
  await prisma.rendezVous.createMany({
    data: [
      {
        patientId: patients[0].id,
        medecinId: medecin1.id,
        dateHeure: jour(0, 9, 0),
        motif: "Suivi asthme",
        statut: "CONFIRME",
      },
      {
        patientId: patients[1].id,
        medecinId: medecin1.id,
        dateHeure: jour(0, 10, 30),
        motif: "Consultation générale",
        statut: "PLANIFIE",
      },
      {
        patientId: patients[3].id,
        medecinId: medecin2.id,
        dateHeure: jour(0, 11, 15),
        motif: "Contrôle dentaire",
        statut: "PLANIFIE",
      },
      {
        patientId: patients[2].id,
        medecinId: medecin1.id,
        dateHeure: jour(1, 8, 30),
        motif: "Renouvellement ordonnance HTA",
        statut: "PLANIFIE",
      },
      {
        patientId: patients[4].id,
        medecinId: medecin1.id,
        dateHeure: jour(2, 14, 0),
        motif: "Certificat médical",
        statut: "PLANIFIE",
      },
      {
        patientId: patients[0].id,
        medecinId: medecin1.id,
        dateHeure: jour(-5, 9, 0),
        motif: "Première consultation",
        statut: "TERMINE",
      },
    ],
  });

  console.log("🩺 Création des consultations…");
  const consultation = await prisma.consultation.create({
    data: {
      patientId: patients[0].id,
      medecinId: medecin1.id,
      date: jour(-5, 9, 15),
      motif: "Première consultation",
      symptomes: "Toux nocturne, essoufflement à l'effort.",
      diagnostic: "Asthme allergique modéré.",
      traitement: "Corticoïde inhalé + bronchodilatateur de secours.",
      poids: 58,
      taille: 165,
      temperature: 37.1,
      tensionArt: "11/7",
      pouls: 76,
    },
  });

  await prisma.consultation.create({
    data: {
      patientId: patients[2].id,
      medecinId: medecin1.id,
      date: jour(-12, 10, 0),
      motif: "Suivi hypertension",
      diagnostic: "HTA équilibrée sous traitement.",
      traitement: "Poursuite Amlodipine 5mg.",
      poids: 72,
      tensionArt: "13/8",
      pouls: 80,
    },
  });

  console.log("↪️  Création des orientations…");
  await prisma.orientation.create({
    data: {
      patientId: patients[0].id,
      medecinId: medecin1.id,
      consultationId: consultation.id,
      serviceCible: "Service de Pneumologie — Hôpital Fann",
      motif: "Exploration fonctionnelle respiratoire.",
      statut: "EN_ATTENTE",
    },
  });

  console.log("🧪 Création des demandes d'examens (démo)…");
  await prisma.demandeExamen.create({
    data: {
      patientId: patients[0].id,
      medecinId: medecin1.id,
      consultationId: consultation.id,
      type: "NFS (Numération formule sanguine)",
      categorie: "BIOLOGIE",
      motif: "Bilan de suivi asthme.",
      priorite: "NORMALE",
      statut: "DEMANDE",
      date: jour(-4, 10, 0),
    },
  });
  const demandeTerminee = await prisma.demandeExamen.create({
    data: {
      patientId: patients[2].id,
      medecinId: medecin1.id,
      type: "Glycémie à jeun",
      categorie: "BIOLOGIE",
      priorite: "NORMALE",
      statut: "TERMINE",
      date: jour(-10, 9, 0),
    },
  });
  await prisma.resultatExamen.create({
    data: {
      demandeId: demandeTerminee.id,
      valeurs: "Glycémie : 0,98 g/L",
      conclusion: "Valeur dans les normes.",
      date: jour(-9, 14, 0),
    },
  });

  console.log("💊 Création du stock pharmacie…");
  await prisma.medicament.createMany({
    data: [
      {
        nom: "Paracétamol 500mg",
        dci: "Paracétamol",
        forme: "Comprimé",
        dosage: "500mg",
        stock: 240,
        seuilAlerte: 50,
        prix: 500,
        datePeremption: new Date("2027-06-30"),
      },
      {
        nom: "Amoxicilline 1g",
        dci: "Amoxicilline",
        forme: "Comprimé",
        dosage: "1g",
        stock: 8,
        seuilAlerte: 20,
        prix: 1500,
        datePeremption: new Date("2026-12-31"),
      },
      {
        nom: "Salbutamol spray",
        dci: "Salbutamol",
        forme: "Aérosol",
        dosage: "100µg/dose",
        stock: 0,
        seuilAlerte: 5,
        prix: 3000,
        datePeremption: new Date("2026-09-15"),
      },
      {
        nom: "Amlodipine 5mg",
        dci: "Amlodipine",
        forme: "Comprimé",
        dosage: "5mg",
        stock: 60,
        seuilAlerte: 15,
        prix: 2000,
        datePeremption: new Date("2027-03-20"),
      },
      {
        nom: "Ibuprofène 400mg",
        dci: "Ibuprofène",
        forme: "Comprimé",
        dosage: "400mg",
        stock: 12,
        seuilAlerte: 30,
        prix: 800,
        datePeremption: new Date("2027-01-10"),
      },
      {
        nom: "Sérum physiologique",
        forme: "Solution",
        dosage: "0,9% — 500ml",
        stock: 45,
        seuilAlerte: 10,
        prix: 1200,
        datePeremption: new Date("2028-02-28"),
      },
    ],
  });

  console.log("✅ Données de démonstration créées avec succès.");
  console.log("   Administrateur : admin@ucad.edu.sn / passer123");
  console.log("   Direction      : direction@ucad.edu.sn / passer123");
  console.log("   Médecin        : medecin@ucad.edu.sn / passer123");
  console.log("   Infirmier      : infirmier@ucad.edu.sn / passer123");
  console.log("   Laborantin     : laborantin@ucad.edu.sn / passer123");
  console.log("   Pharmacien     : pharmacie@ucad.edu.sn / passer123");
  console.log("   Secrétaire     : secretaire@ucad.edu.sn / passer123");
  console.log("   Étudiant       : aissatou.faye@ucad.edu.sn / passer123");
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
