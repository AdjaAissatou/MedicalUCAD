# UCAD Santé — Gestion des Services Médicaux

Plateforme web de gestion des services médicaux de l'**Université Cheikh Anta
Diop de Dakar (UCAD)** : dossiers médicaux, rendez-vous, consultations,
orientations et pharmacie.

## Fonctionnalités

| Module | Description | État |
| --- | --- | --- |
| **Tableau de bord** | Statistiques, rendez-vous du jour, alertes pharmacie | ✅ |
| **Dossiers médicaux** | Fiches patients (étudiants & personnels), antécédents, allergies, groupe sanguin, historiques | ✅ |
| **Rendez-vous** | Planification, filtres, suivi des statuts, regroupement par jour | ✅ |
| **Consultations** | Historique des consultations et diagnostics | ✅ (lecture) |
| **Orientations** | Redirections vers spécialistes / structures externes | ✅ (lecture) |
| **Pharmacie** | Stock, seuils d'alerte, ruptures, péremptions | ✅ (lecture) |

## Stack technique

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — design system « Accessible & Ethical » (WCAG AAA),
  palette teal médical + vert santé, typographie Figtree
- **Prisma 6** + **SQLite** (développement) — basculable vers **PostgreSQL**
- **Zod** (validation) · **bcryptjs** (mots de passe) · authentification par
  session signée (cookie httpOnly)

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données
cp .env.example .env         # DATABASE_URL="file:./dev.db"
npm run db:push              # crée le schéma
npm run db:seed              # données de démonstration

# 3. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur http://localhost:3000

### Comptes de démonstration

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Médecin | `medecin@ucad.edu.sn` | `passer123` |
| Administrateur | `admin@ucad.edu.sn` | `passer123` |
| Pharmacien | `pharmacie@ucad.edu.sn` | `passer123` |

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run db:push` | Synchronise le schéma Prisma avec la base |
| `npm run db:seed` | Peuple la base de données de démonstration |
| `npm run db:studio` | Ouvre Prisma Studio (exploration de la base) |

## Passage en production (PostgreSQL)

Dans `prisma/schema.prisma`, remplacer le provider :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Puis définir `DATABASE_URL` vers votre instance PostgreSQL et exécuter
`npm run db:push`. Pensez également à définir `SESSION_SECRET` (secret de
signature des sessions) en variable d'environnement.

## Structure du projet

```
src/
├── app/
│   ├── (app)/              # espace authentifié (sidebar + topbar)
│   │   ├── tableau-de-bord/
│   │   ├── patients/       # dossiers médicaux (CRUD)
│   │   ├── rendez-vous/    # planification
│   │   ├── consultations/
│   │   ├── orientations/
│   │   └── pharmacie/
│   ├── actions/            # Server Actions (auth, patients, rendez-vous)
│   └── login/
├── components/             # composants UI et métier
└── lib/                    # prisma, session, utils, constantes
prisma/
├── schema.prisma           # modèle de données
└── seed.ts                 # données de démonstration
```

---

© Université Cheikh Anta Diop de Dakar
