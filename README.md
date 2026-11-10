# Gaufrle

Jeu de lettres en français proposant trois niveaux de difficulté. Les grilles sont publiées selon l'heure de **Paris**, les parties sont conservées localement dans le navigateur, et l'application peut être installée et utilisée hors ligne après son premier chargement en ligne.

**Jouer :** https://gaufrle.vercel.app/

## Fonctionnalités

| Mode | Route | Grille | Publication |
| --- | --- | --- | --- |
| Gaufrette (normal) | `/normal-game` | 5 × 5 | Tous les jours |
| Gauf' au suc' (medium) | `/medium-game` | 7 × 7 | Tous les jours |
| Gaufre salée (hard) | `/hard-game` | 7 × 7 | Chaque lundi |

Les trois modes partagent la présentation `GamePage` mais conservent leurs catalogues, leur calendrier et leurs règles de génération. Le déplacement de lettres s'effectue à la souris, au toucher ou au clavier. Les définitions apparaissent à la fin d'une partie.

## Stack technique

- **React 18**, **TypeScript**, **React Router 6** et **Vite 5** ;
- **Tailwind CSS 3** et **Headless UI** ;
- **React DnD** (backends HTML5 et tactile) ;
- **Vitest**, **Testing Library** et **jsdom** pour les tests de composants et du moteur ;
- **Node.js** (scripts de calendrier et de génération PWA) ;
- **Vercel** pour l'hébergement de l'application statique.

L'application ne nécessite ni serveur applicatif ni base de données pour être exécutée. Les données des puzzles et les définitions proviennent de fichiers JSON versionnés dans le dépôt.

## Installation et développement

**Prérequis :** Node.js **20** (version utilisée par GitHub Actions) et npm. Le déploiement Vercel peut utiliser une version Node différente ; ne changez pas le runtime sans valider les builds.

```bash
git clone https://github.com/William-Louis-Louisy/gaufrle.git
cd gaufrle
npm ci
npm run dev
```

Le serveur de développement Vite est accessible sur **http://localhost:3000**.

Pour tester le résultat compilé, notamment le service worker :

```bash
npm run build
npm run preview
```

Le serveur de prévisualisation utilise **http://localhost:4173**. Le service worker n'est enregistré que dans les builds de production ; `npm run dev` ne reproduit donc pas le mode hors ligne.

### Commandes disponibles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Démarrer Vite en développement (port 3000) |
| `npm run build` | Vérifier TypeScript, compiler avec Vite, puis générer `dist/sw.js` |
| `npm run preview` | Servir localement le build (port 4173) |
| `npx tsc --noEmit` | Vérifier les types sans générer de fichiers |
| `npm test` | Exécuter la suite Vitest une fois |
| `npm run test:watch` | Exécuter Vitest en mode interactif |
| `npm run test:calendar` | Tester les calculs et validations du calendrier (Node) |
| `npm run validate:grids` | Vérifier les dates et la continuité des trois catalogues |
| `npm run test:pwa` | Tester la génération et la cohérence du cache PWA |

Pour reproduire l'ensemble des contrôles principaux avant une pull request :

```bash
npm ci
npm run test:calendar
npm run validate:grids
npx tsc --noEmit
npm test
npm run test:pwa
npm run build
```

## Organisation du projet

```text
src/
├── pages/                  # Accueil, routes des trois difficultés, support, erreurs
├── routes/Routes.tsx       # React Router et chargement différé des pages
├── components/
│   ├── GamePage.tsx        # Affichage commun aux trois modes
│   ├── GameGrid.tsx        # Plateau et interactions
│   ├── WordDefinitions.tsx # États et affichage des définitions
│   └── Navigation/         # Header, menu, layout et navigation
├── hooks/
│   ├── useGameSession.ts   # Session et interactions côté React
│   └── usePublicationDate.ts # Synchronisation au calendrier de Paris
├── utils/
│   ├── GameSession.ts      # Identité, règles, état et sauvegarde des parties
│   ├── GridSchedule.ts     # Sélection des grilles et cadence de publication
│   ├── PublicationClock.ts # Minuit Europe/Paris et changements d'heure
│   ├── CellStatus.ts       # Métadonnées du plateau et statut des cellules
│   ├── Scoring.ts          # Calcul des scores
│   ├── GameNavigation.ts   # Données partagées de navigation
│   └── WordDefinitionsRepository.ts # Chargement différé des dictionnaires
├── jsons/                  # Catalogues de grilles et dictionnaires
└── styles/                 # Styles globaux
scripts/
├── grid-calendar.cjs       # Référentiel de validation des calendriers
├── validate-grid-calendar.cjs
├── grid-calendar.test.cjs
├── reindex-grid-dates.cjs  # Outil de maintenance, dry run par défaut
├── build-pwa.cjs           # Générateur du service worker
└── build-pwa.test.cjs
public/
├── manifest.json           # Métadonnées PWA
├── images/                 # Illustrations hébergées localement
└── pwa-*.png               # Icônes d'installation
```

Les fichiers `NormalGamepage.tsx`, `MediumGamepage.tsx` et `HardGamepage.tsx` importent chacun leur **propre catalogue** avant de transmettre les données à `GamePage`. Cela conserve le chargement différé des difficultés. Les définitions de cinq et sept lettres sont chargées séparément par `WordDefinitionsRepository` lorsqu'une partie se termine.

## Calendrier de publication : invariants à préserver

**Toutes les publications ont lieu à 00:00 dans le fuseau `Europe/Paris`**, et non à minuit UTC ni à minuit selon le fuseau du visiteur. Le mode difficile change le **lundi** ; les deux autres modes changent quotidiennement. `PublicationClock.ts` prend en charge les passages à l'heure d'été et à l'heure d'hiver, tandis que les calculs de dates civiles du calendrier utilisent UTC afin d'éviter les dérives de changement d'heure.

La sélection des puzzles se fait par **cycle fixe**. Ces longueurs sont intentionnelles et ne doivent pas être déduites automatiquement de la taille courante des fichiers :

| Mode | Début du catalogue | Pas | Longueur du cycle |
| --- | --- | --- | --- |
| normal | 2023-11-02 | 1 jour | **8 701** entrées |
| medium | 2023-11-02 | 1 jour | **2 893** entrées |
| hard | 2025-03-10 | 7 jours | **130** entrées |

Les valeurs utilisées en exécution se trouvent dans `GRID_CYCLES` de `src/utils/GridSchedule.ts`. Les bornes de validation des fichiers sont définies séparément dans `scripts/grid-calendar.cjs`.

**Attention avant toute modification des catalogues :**

1. Ne pas réordonner, supprimer, renommer ou réindexer une grille existante sans analyser l'impact sur les publications passées et les sauvegardes.
2. Ne pas modifier les longueurs de cycles ou les dates de départ sans décision explicite : les changements déplaceraient l'association entre dates et grilles.
3. Conserver les identifiants stables, les mots, le type et l'ordre des grilles existantes.
4. Exécuter `npm run test:calendar`, `npm run validate:grids` et les tests de session après tout changement.

Deux particularités historiques sont **volontairement conservées** : les quatre premières entrées du catalogue medium portent le type `normal` ; les positions 65 à 129 du catalogue hard répètent les 65 premières grilles. Ces cas sont pris en compte dans la logique existante ; ils ne doivent pas être « corrigés » lors d'un simple nettoyage technique.

Le script `node scripts/reindex-grid-dates.cjs` effectue **uniquement une simulation** par défaut. Son option `--write` modifie les fichiers JSON : elle doit être réservée à une opération de maintenance validée et accompagnée de tests.

## Sessions et stockage navigateur

`useGameSession.ts` s'appuie sur `GameSession.ts` comme source de vérité pour la grille, les mouvements restants et l'état `playing`, `won` ou `lost`. Chaque mouvement accepté entraîne une sauvegarde dans `localStorage`.

Une partie est identifiée par **(mode, début de période, identifiant de grille)**, afin de ne pas reprendre une sauvegarde correspondant à une autre publication du même puzzle. Le format courant des sessions est `version: 2` ; une compatibilité prudente avec certaines sauvegardes anciennes est maintenue.

| Mode | Clé `localStorage` |
| --- | --- |
| normal | `currentNormalGrid` |
| medium | `currentMediumGrid` |
| hard | `currentHardGrid` |

Le thème utilise également la clé `darkMode`.

La progression est **locale au navigateur et à son profil** : il n'existe pas de synchronisation entre appareils. Ne modifiez pas les clés, le format de session ou la logique de migration sans tests de compatibilité. En cas de stockage indisponible, le jeu peut continuer en mémoire, mais la partie ne sera pas persistée.

## PWA et mode hors ligne

Le manifest `public/manifest.json` décrit l'application installable et ses icônes 192 × 192 et 512 × 512. L'installation est proposée **par le navigateur ou le système** lorsqu'il la prend en charge ; aucune commande d'installation n'est ajoutée à l'interface de Gaufrle. Chrome ne déclenche pas nécessairement de demande spontanée. Sur iPhone, l'ajout à l'écran d'accueil passe par Safari.

Le build `npm run build` :

1. effectue le contrôle TypeScript et la compilation Vite dans `dist/` ;
2. exécute `scripts/build-pwa.cjs` pour produire `dist/sw.js` ;
3. constitue un précache versionné par empreinte des ressources : shell HTML, styles et scripts, **trois modes et catalogues**, **deux dictionnaires**, icônes et **sept illustrations locales**.

Le service worker utilise la navigation réseau avec repli sur `index.html` hors ligne pour les routes React Router. L'activation d'une mise à jour **n'est pas forcée** pendant une partie ; il peut être nécessaire de fermer les anciens onglets pour activer la nouvelle version. La première visite doit être effectuée **en ligne** pour installer et alimenter le cache. Le téléchargement initial inclut les dictionnaires volumineux ; il nécessite donc un peu de patience et d'espace disque.

Les polices Google restent externes : si elles ne figurent pas déjà dans le cache du navigateur, les polices de secours CSS sont utilisées hors ligne.

### Recette manuelle PWA

1. Ouvrir une preview Vercel ou `npm run preview` en ligne ; vérifier la présence du worker dans **DevTools → Application → Service Workers**.
2. Attendre que le précache soit terminé, puis recharger la page sous contrôle du service worker.
3. Passer hors ligne via **DevTools → Network → Offline** ou le mode avion.
4. Ouvrir directement les routes `/normal-game`, `/medium-game` et `/hard-game` ; jouer et vérifier la reprise des parties.
5. Après une victoire ou une défaite, vérifier les définitions et les images (navigation, mascotte, victoire, défaite).
6. Rétablir le réseau, publier une nouvelle version et vérifier le changement de cache après fermeture des éventuels onglets utilisant l'ancienne version.

## Déploiement Vercel

Le projet est une **SPA statique**. Les paramètres attendus sont :

| Paramètre | Valeur |
| --- | --- |
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | installation npm standard (`npm ci` en CI) |

Le fichier `vercel.json` versionné fixe le framework, la commande de build, le répertoire de sortie et le **rewrite SPA vers `/index.html`** pour les navigations directes. Conservez ce rewrite : les routes `/normal-game`, `/medium-game` et `/hard-game` sont gérées côté React.

Avant de fusionner une PR, contrôlez les checks GitHub ainsi que la **preview Vercel**. Ne supposez pas qu'un build réussi valide à lui seul l'installation PWA ou le fonctionnement hors ligne.

## Intégration continue et contributions

Le workflow [Validate grids and game sessions](.github/workflows/validate-grid-calendar.yml) s'exécute sur chaque pull request, sur les pushes vers `main` et manuellement depuis l'onglet Actions. Il comporte deux jobs :

- **`validate`** : tests Node du calendrier (`npm run test:calendar`) et validation de tous les catalogues (`npm run validate:grids`).
- **`session`** : `npm ci`, vérification TypeScript, tests Vitest, tests du générateur PWA et build de production.

Les contrôles **`validate`** et **`session`** doivent être verts avant la fusion. Les règles de protection de `main` imposent la revue par PR ; une modification ne doit pas être poussée directement en production.

Pour contribuer : créez une branche depuis `main`, limitez la PR à un objectif, ajoutez les tests pertinents, exécutez les validations et contrôlez la preview. Les changements de règles, de contenu de grilles, de calendrier ou d'interface nécessitent une validation explicite avant implémentation.

## Maintenance et limites connues

- **Catalogues historiques :** les exceptions medium et la duplication des 65 grilles hard sont documentées ci-dessus ; elles ne doivent pas être modifiées par un nettoyage non fonctionnel.
- **Sauvegardes :** pas de synchronisation multi-appareils ; les données reposent sur le stockage du navigateur.
- **PWA :** le premier précache est relativement lourd, car il comprend les deux dictionnaires ; il dépend d'une connexion initiale.
- **Performance :** les catalogues et dictionnaires sont séparés en chunks Vite. Surveillez leur taille lors d'ajouts de données.
- **Périmètre :** la documentation décrit l'implémentation existante, sans engager de changement d'interface ou de modèle métier.

