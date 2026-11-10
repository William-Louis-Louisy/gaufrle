/**
 * Public SEO configuration. Keep URLs consistent with the Vercel production
 * domain and the public React Router routes.
 *
 * P3.2 updates document.head after hydration. P3.3 will generate the initial
 * HTML for each route; do not claim this is equivalent to prerendering.
 */
export const SITE_ORIGIN = "https://gaufrle.vercel.app";
export const SOCIAL_IMAGE = "https://ucarecdn.com/139613a3-eee1-458c-a37d-986469fa77a9/Capturedcran20231106121336.png";

export interface SeoPage {
  readonly title: string;
  readonly description: string;
  readonly pathname: string;
  readonly url: string;
}

const PAGES = [
  {
    pathname: "/",
    title: "Gaufrle — Jeu de lettres gratuit en français",
    description:
      "Jouez à Gaufrle, le jeu de lettres gratuit en français : trois niveaux de difficulté, des grilles quotidiennes et un défi hebdomadaire.",
  },
  {
    pathname: "/normal-game",
    title: "Gaufrette — Jeu de lettres quotidien | Gaufrle",
    description:
      "Jouez à Gaufrette, le mode facile de Gaufrle. Une nouvelle grille de lettres 5 × 5 chaque jour, directement dans votre navigateur.",
  },
  {
    pathname: "/medium-game",
    title: "Gauf' au suc' — Jeu de lettres quotidien | Gaufrle",
    description:
      "Jouez à Gauf' au suc', le mode intermédiaire de Gaufrle. Une grille de lettres 7 × 7 renouvelée chaque jour.",
  },
  {
    pathname: "/hard-game",
    title: "Gaufre salée — Défi de lettres hebdomadaire | Gaufrle",
    description:
      "Relevez le défi Gaufre salée : la grille difficile 7 × 7 de Gaufrle, renouvelée chaque lundi.",
  },
  {
    pathname: "/support",
    title: "Soutenir Gaufrle — Offrir un café au créateur",
    description:
      "Vous appréciez Gaufrle ? Découvrez comment soutenir le créateur de ce jeu de lettres gratuit.",
  },
] as const;

export const SEO_PAGES: readonly SeoPage[] = PAGES.map((page) => ({
  ...page,
  url: new URL(page.pathname, SITE_ORIGIN).href,
}));

/** Unknown URLs must not claim to be a valid puzzle or be indexed. */
export function getSeoPage(pathname: string): SeoPage | null {
  const normalized = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
  return SEO_PAGES.find((page) => page.pathname === normalized) ?? null;
}

export function createStructuredData(page: SeoPage): Record<string, unknown> {
  if (page.pathname === "/") {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Gaufrle",
      url: page.url,
      description: page.description,
      inLanguage: "fr",
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    url: page.url,
    description: page.description,
    inLanguage: "fr",
    isPartOf: { "@type": "WebSite", name: "Gaufrle", url: SITE_ORIGIN + "/" },
  };
}
