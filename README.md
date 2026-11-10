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

## Continuous integration

The [Validate grids and game sessions](.github/workflows/validate-grid-calendar.yml) workflow runs on **every pull request**, on pushes to `main`, and manually via **Actions → Validate grids and game sessions → Run workflow**.

- `validate`: UTC calendar tests (`npm run test:calendar`) and puzzle catalog validation (`npm run validate:grids`).
- `session`: `npm ci`, TypeScript (`npx tsc --noEmit`), Vitest (`npm test`), and production build (`npm run build`).

Both jobs must succeed before merging. To **enforce** this in GitHub, configure branch protection / repository rules for `main`: require a pull request and require the status checks **`validate`** and **`session`** to pass. GitHub Actions alone reports results but does not prevent merging if no rule is enabled. Rules are administered in GitHub repository settings and are not changed by this PR.

Locally, run `npm ci` followed by the commands above to reproduce the checks.
