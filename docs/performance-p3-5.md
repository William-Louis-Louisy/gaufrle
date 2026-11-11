# P3.5 — Audit performances (baseline)

Date de référence : 11 novembre 2026. Baseline : dernier build GitHub Actions de `main` avant P3.5, workflow `42907316160`. Ces tailles sont les **sorties de build Vite**, et non une mesure de transferts réseau ni de Web Vitals réels.

## Ressources constatées

| Ressource Vite | JavaScript/CSS minifié | Gzip Vite |
| --- | ---: | ---: |
| Entrée initiale `index-*.js` | 195,70 Ko | 63,20 Ko |
| CSS initial `index-*.css` | 26,48 Ko | 5,59 Ko |
| `GamePage-*.js` | 79,40 Ko | 22,29 Ko |
| Catalogue normal `NormalGamepage-*.js` | 1 044,29 Ko | 301,31 Ko |
| Catalogue medium `MediumGamepage-*.js` | 358,90 Ko | 102,38 Ko |
| Catalogue hard `HardGamepage-*.js` | 19,67 Ko | 3,99 Ko |
| Dictionnaire 5 lettres `DefFiveLetters-*.js` | 1 268,16 Ko | 437,13 Ko |
| Dictionnaire 7 lettres `DefSevenLetters-*.js` | 3 070,38 Ko | 1 021,47 Ko |

Les catalogues sont séparés par route grâce à `React.lazy` ; les définitions sont chargées à la fin de la partie. Il ne faut **pas additionner ces tailles** pour représenter le téléchargement d'une visite sur l'accueil.

Les images versionnées du projet comprennent `public/images/banner.webp` (321 876 octets, soit ~314 Kio) et `public/images/mascot.webp` (20 894 octets). La bannière est dans le premier écran de la page d'accueil : elle est **candidate LCP à mesurer**, pas un élément LCP confirmé par trace navigateur.

Le service worker de P2.3/P3.3 précache aussi tous les chunks statiques, y compris les dictionnaires ; leur coût de téléchargement initial hors ligne est distinct des imports effectués par le JavaScript de l'application. Toute réduction de ce précache devra être traitée avec les garanties de PWA, sans sacrifier le fonctionnement offline.

## Actions P3.5 à faible risque

1. **Accueil seulement :** lien `rel=preload` avec `as=image` et `fetchpriority=high` pour `/images/banner.webp` dans le HTML prérendu. Aucun préchargement de cette image sur les routes de jeu : évite de faire concurrence aux chunks des catalogues.
2. **Polices :** regrouper les deux stylesheets Google Fonts en une seule requête, en conservant les familles, graisses, variantes italique et `display=swap`. Les deux préconnexions existantes sont conservées.
3. **Tests :** assurer l'absence de preload sur les autres routes, de doublon sur l'accueil et de disparition des familles de polices.

Aucune modification de l'apparence, des images sources, des fonctionnalités, du moteur, des sauvegardes ou de la stratégie de précache.

## Ce qui reste à mesurer en conditions réelles

Aucune mesure Lighthouse/Chrome UX Report spécifique à Gaufrle n'a pu être confirmée dans cet audit. **Ne pas communiquer de scores LCP, CLS, INP ou Lighthouse non mesurés.** Les contrôles CI garantissent la génération HTML, mais pas une amélioration quantifiée des Web Vitals.

Pour comparer proprement l'avant/après, utiliser les deux versions dans **PageSpeed Insights**, onglet **Mobile**, sur `/`, `/normal-game`, `/medium-game` et `/hard-game`, puis le même profil Chrome/Lighthouse sur une connexion et un appareil simulés identiques. Effectuer au moins trois mesures par route et comparer leurs médianes. Contrôler également dans DevTools Network que la bannière est demandée tôt et **une seule fois**, et que les pages de jeu ne préchargent pas cette bannière.

Consulter les données terrain de Search Console / Chrome UX Report ou Vercel Speed Insights si elles sont disponibles ; l'échantillonnage utilisateur est nécessaire pour estimer le LCP, le CLS et surtout l'INP réels.

**Seuils de référence des Core Web Vitals au 75e percentile :** LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms.

## Opportunités à investiguer dans une suite distincte

- Dimensionnement/compression de `banner.webp` pour réduire ses 322 Ko, **après validation visuelle** et vérification de ses dimensions d'origine.
- Traçage du LCP mobile effectif, car une image visible n'est pas automatiquement l'élément LCP.
- Préchargement des polices si nécessaire, après contrôle d'un waterfall réseau (pas de preload aveugle de fichiers externes).
- Analyse du coût initial du précache PWA et des gros dictionnaires ; ne pas les retirer du précache sans valider les scénarios hors ligne.
- Réduction éventuelle du coût de chargement des catalogues, uniquement après profilage du moteur et tests de non-régression.

