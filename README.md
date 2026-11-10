# Gaufrle

Application React et TypeScript construite avec **Vite**. La suite de tests utilise **Vitest** ; le moteur de jeu et la rotation des grilles sont inchangés.

## Démarrage

Prérequis : Node.js 20 et npm.

```bash
npm ci
npm run dev
```

Le serveur local utilise http://localhost:3000.

## Validation

```bash
npx tsc --noEmit
npm test
npm run test:calendar
npm run validate:grids
npm run build
npm run preview
```

Le build statique est produit dans `dist/`. Vercel doit utiliser **Framework Preset: Vite**, **Build Command: npm run build**, **Output Directory: dist**. Le fichier `vercel.json` maintient les routes React Router accessibles en navigation directe.

## Application installable et hors ligne (P2.3)

Après un premier chargement **en ligne**, la version de production installe un service worker et télécharge une copie locale des trois modes, des dictionnaires et des visuels de l'interface. Le build crée `dist/sw.js`, qui n'est pas utilisé par `npm run dev`. Les parties continuent à être sauvegardées dans le navigateur comme auparavant.

La commande **« Installer Gaufrle »** ouvre la demande native lorsque Chromium autorise l'événement `beforeinstallprompt`. Si le navigateur ne le fournit pas, le site affiche **« Comment installer ? »** et des instructions adaptées ; Chrome n'affiche pas systématiquement une invite d'installation spontanée. Sur iOS, l'installation passe par le menu Partager de Safari.

Test manuel recommandé :

1. Ouvrir la preview de production ou de PR en ligne et attendre que le worker termine son installation (DevTools → Application → Service Workers).
2. Recharger la page une fois sous contrôle du service worker, puis passer en mode hors ligne (DevTools → Network → Offline, ou mode avion).
3. Ouvrir les trois modes, terminer une partie et vérifier les définitions, images de navigation, mascottes de victoire/défaite et reprise d'une partie enregistrée.
4. Rétablir le réseau et contrôler la mise à jour du service worker après un nouveau déploiement. Fermer les anciens onglets au besoin : l'activation n'est volontairement pas forcée pendant une partie.

**Note :** les polices Google restent des dépendances externes ; le navigateur utilisera ses polices de secours hors ligne.

## Continuous integration

The [Validate grids and game sessions](.github/workflows/validate-grid-calendar.yml) workflow runs on **every pull request**, on pushes to `main`, and manually via **Actions → Validate grids and game sessions → Run workflow**.

- `validate`: UTC calendar tests (`npm run test:calendar`) and puzzle catalog validation (`npm run validate:grids`).
- `session`: `npm ci`, TypeScript (`npx tsc --noEmit`), Vitest (`npm test`), and production build (`npm run build`).

Both jobs must succeed before merging. To **enforce** this in GitHub, configure branch protection / repository rules for `main`: require a pull request and require the status checks **`validate`** and **`session`** to pass. GitHub Actions alone reports results but does not prevent merging if no rule is enabled. Rules are administered in GitHub repository settings and are not changed by this PR.

Locally, run `npm ci` followed by the commands above to reproduce the checks.
