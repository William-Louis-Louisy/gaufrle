import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createStructuredData, getSeoPage, SOCIAL_IMAGE } from "../utils/Seo";

const STRUCTURED_DATA_ID = "gaufrle-structured-data";

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string | null) {
  const links = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
  if (!url) {
    links.forEach((link) => link.remove());
    return;
  }

  const link = links[0] ?? document.createElement("link");
  link.rel = "canonical";
  link.href = url;
  if (!link.isConnected) document.head.appendChild(link);
  links.forEach((other, index) => {
    if (index > 0) other.remove();
  });
}

/** Meta tags belong to the current route, not the preceding SPA route. */
export default function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = getSeoPage(pathname);
    document.title = page?.title ?? "Page introuvable | Gaufrle";

    setMeta('meta[name="description"]', "name", "description",
      page?.description ?? "Cette page n'existe pas sur Gaufrle.");
    setMeta('meta[name="robots"]', "name", "robots",
      page ? "index,follow" : "noindex,follow");
    setCanonical(page?.url ?? null);

    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "Gaufrle");
    setMeta('meta[property="og:locale"]', "property", "og:locale", "fr_FR");
    setMeta('meta[property="og:title"]', "property", "og:title", document.title);
    setMeta('meta[property="og:description"]', "property", "og:description",
      page?.description ?? "Page introuvable | Gaufrle");
    setMeta('meta[property="og:url"]', "property", "og:url", page?.url ?? window.location.href);
    setMeta('meta[property="og:image"]', "property", "og:image", SOCIAL_IMAGE);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:url"]', "name", "twitter:url", page?.url ?? window.location.href);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", document.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description",
      page?.description ?? "Page introuvable | Gaufrle");
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", SOCIAL_IMAGE);

    const old = document.getElementById(STRUCTURED_DATA_ID);
    old?.remove();
    if (page) {
      const script = document.createElement("script");
      script.id = STRUCTURED_DATA_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(createStructuredData(page));
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
}
