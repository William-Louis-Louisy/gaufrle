# Mode difficile — génération de grilles candidates

## État du catalogue (audit du 9 novembre 2026)

- `src/jsons/HardGridList.json` : **130 entrées / 65 grilles différentes**.
- Les entrées 66–130 répètent exactement les identifiants et les huit mots des entrées 1–65.
- Les 65 grilles de référence passent le contrôle des **16 intersections**, avec huit mots de sept lettres.
- `src/jsons/DefSevenLetters.json` : **12 132 entrées**, dont **10 913** avec une définition textuelle de plus de quatre caractères ; le générateur exige au moins **25 caractères** pour une définition, ce qui est plus strict.
- `src/utils/HardGridsGeneration.ts` ne construit pas de combinaisons de mots : il transforme huit mots déjà choisis en grilles 7×7 (solution ou lettres mélangées). Le générateur historique complet ne figure pas dans le dépôt actuel.

## Propositions ajoutées

`data/hard-grid-candidates.json` contient **65 grilles supplémentaires** sans date de publication ni référence active dans le jeu. Elles sont toutes marquées `reviewStatus: "pending"` : elles ne sont **pas prêtes à être publiées** sans contrôle éditorial.

Le générateur reproductible `scripts/generate-hard-grid-candidates.cjs` :
1. extrait des mots de sept lettres possédant au moins une définition de 25 caractères ;
2. utilise une clé de quatre caractères pour chaque mot : ses lettres d'index 0, 2, 4 et 6 ;
3. construit par recherche pseudo-aléatoire déterministe quatre clés horizontales, en éliminant immédiatement les préfixes ne pouvant former aucun mot vertical ;
4. construit les quatre mots verticaux avec les 16 lettres imposées par les intersections ;
5. vérifie la présence de huit mots distincts et privilégie les mots déjà apparus dans le catalogue moyen comme *signal éditorial*, sans prétendre que ce catalogue est une référence linguistique ;
6. élimine les grilles identiques (même ensemble de mots, même avec un ordre différent) et les grilles déjà publiées ;
7. sélectionne 65 propositions variées, limitant la réutilisation d'un même mot entre propositions.

Le validateur contrôle l'exactitude des croisements, les mots et leurs définitions, l'unicité des grilles, la provenance des données et les statuts de relecture. **Une définition présente n'établit pas à elle seule la fréquence d'usage, l'orthographe préférable ou l'acceptabilité d'un mot.** Les mots rares, techniques, polysémiques, formes conjuguées et emprunts doivent être relus.

## Commandes

```bash
npm run generate:hard-candidates
npm run validate:hard-candidates
npm run test:hard-candidates
npm run review:hard-candidates > hard-grid-review.md
```

La génération utilise une graine fixe, et le test compare le résultat régénéré au JSON commité. Ne lancer la commande de génération qu'en ayant l'intention de mettre à jour explicitement le catalogue de propositions.

### Relecture indispensable

Pour chaque grille, vérifier :
- l'orthographe et l'emploi de chaque mot (les accents sont omis dans le jeu) ;
- la définition affichée à l'utilisateur, son adéquation au mot et la pertinence du niveau difficile ;
- l'absence de mots choquants, dépréciatifs ou trop spécialisés selon les critères éditoriaux retenus ;
- la variété lexicale de l'ensemble et les éventuels sens ambigus.

Marquer individuellement les propositions `approved` ou `rejected` dans le fichier après relecture. Toute modification manuelle des huit mots doit conserver les 16 croisements et passer le validateur. La régénération remet par défaut les statuts à `pending` : ne pas régénérer après une relecture sans décision explicite.

## Intégration au calendrier — **une étape distincte**

Au 9 novembre 2026, la grille actuelle est **l'entrée 88** (index 87, première semaine : 10 mars 2025). Les **23 premières semaines du second bloc** ont donc déjà servi des doublons, et 42 entrées sont encore futures. Remplacer sans précaution les entrées 66–130 ferait changer les grilles déjà proposées, y compris celle de la semaine en cours, et rendrait certaines sauvegardes incompatibles.

**Stratégie recommandée :**
1. faire approuver les 65 nouvelles grilles par une relecture humaine ;
2. choisir une date de bascule future, au début d'une semaine parisienne ;
3. introduire un calendrier versionné à compter de cette date, alimenté par un jeu de **130 grilles uniques** (les 65 originales + les 65 approuvées) ;
4. maintenir l'ancienne association date→grille pour toutes les dates antérieures à la bascule ; ne pas changer les parties historiques ni les `gridId` passés ;
5. ajouter des tests d'identité de sauvegarde P0.3 et de rotation P0.2 couvrant la frontière de bascule, avant de modifier le sélecteur.

**Cette PR ne change aucun calendrier de production, aucun JSON historique et aucun budget de jeu.**
