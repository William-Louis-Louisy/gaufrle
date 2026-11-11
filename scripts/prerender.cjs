"use strict";

const fs = require("node:fs");
const path = require("node:path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { MemoryRouter } = require("react-router-dom");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

function setMeta(document, attribute, key, value) {
  const selector = `meta[${attribute}="${key}"]`;
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.setAttribute("content", value);
}

function setLink(document, rel, href) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", rel);
    document.head.appendChild(node);
  }
  node.setAttribute("href", href);
}

function renderDocument(template, page, content, structuredData, socialImage) {
  const dom = new JSDOM(template);
  const { document } = dom.window;
  document.title = page.title;
  setMeta(document, "name", "description", page.description);
  setMeta(document, "name", "robots", page.url ? "index,follow" : "noindex,follow");
  if (page.url) setLink(document, "canonical", page.url);
  if (page.pathname === "/") {
    // Only the homepage displays this image above the fold. Preloading it
    // on puzzle routes would waste bandwidth and compete with game bundles.
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = "/images/banner.webp";
    preload.setAttribute("fetchpriority", "high");
    document.head.appendChild(preload);
  }
  setMeta(document, "property", "og:title", page.title);
  setMeta(document, "property", "og:description", page.description);
  if (page.url) setMeta(document, "property", "og:url", page.url);
  else document.head.querySelectorAll('meta[property="og:url"]').forEach((node) => node.remove());
  setMeta(document, "property", "og:site_name", "Gaufrle");
  setMeta(document, "property", "og:locale", "fr_FR");
  setMeta(document, "property", "og:type", "website");
  setMeta(document, "property", "og:image", socialImage);
  setMeta(document, "name", "twitter:title", page.title);
  setMeta(document, "name", "twitter:description", page.description);
  if (page.url) setMeta(document, "name", "twitter:url", page.url);
  else document.head.querySelectorAll('meta[name="twitter:url"]').forEach((node) => node.remove());
  setMeta(document, "name", "twitter:image", socialImage);
  setMeta(document, "name", "twitter:card", "summary_large_image");

  const existingData = document.head.querySelectorAll('script[type="application/ld+json"]');
  existingData.forEach((node) => node.remove());
  if (structuredData) {
    const script = document.createElement("script");
    script.id = "gaufrle-structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData).replace(/</g, "\\u003c");
    document.head.appendChild(script);
  }

  const root = document.getElementById("root");
  if (!root) throw new Error("Missing #root in built HTML");
  root.innerHTML = content;
  return dom.serialize();
}

/**
 * Snapshot the existing public React components, never the daily puzzle state.
 * React's client bootstrap takes over #root as it already did before P3.3.
 */
async function prerender(dist = DIST) {
  const { createServer } = await import("vite");
  const server = await createServer({
    root: ROOT,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });

  try {
    const { SEO_PAGES, SOCIAL_IMAGE, createStructuredData } =
      await server.ssrLoadModule("/src/utils/Seo.ts");
    const { default: Homepage } =
      await server.ssrLoadModule("/src/pages/Homepage.tsx");
    const { default: Supportpage } =
      await server.ssrLoadModule("/src/pages/Supportpage.tsx");
    const { default: Loading } =
      await server.ssrLoadModule("/src/components/Navigation/Loading.tsx");
    const { default: Errorpage } =
      await server.ssrLoadModule("/src/pages/Errorpage.tsx");

    // Use the original built document, including Vite's fingerprinted assets.
    const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

    for (const page of SEO_PAGES) {
      let body;
      if (page.pathname === "/") {
        body = React.createElement(
          MemoryRouter, { initialEntries: ["/"] }, React.createElement(Homepage)
        );
      } else if (page.pathname === "/support") {
        body = React.createElement(Supportpage);
      } else {
        // The game is date-specific and hydrated in the browser. Do not
        // bake a daily puzzle into a static deploy or change its identity.
        body = React.createElement(
          React.Fragment, null,
          React.createElement("h1", { className: "sr-only" }, page.title),
          React.createElement("p", { className: "sr-only" }, page.description),
          React.createElement(Loading)
        );
      }

      const markup = renderToStaticMarkup(
        React.createElement("main", { className: "main-view" }, body)
      );
      const html = renderDocument(
        template, page, markup, createStructuredData(page), SOCIAL_IMAGE
      );
      const target = page.pathname === "/"
        ? path.join(dist, "index.html")
        : path.join(dist, page.pathname.slice(1), "index.html");
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, html, "utf8");
      console.log("Prerendered " + page.pathname + " -> " + path.relative(dist, target));
    }

    // Unknown paths must not inherit the homepage SEO metadata or HTTP 200.
    // Vercel serves this as its static 404 response when no rewrite matches.
    const notFoundPage = {
      pathname: "/404",
      title: "Page introuvable | Gaufrle",
      description: "Cette page n'existe pas sur Gaufrle.",
      url: null,
    };
    const notFoundMarkup = renderToStaticMarkup(
      React.createElement("main", { className: "main-view" }, React.createElement(Errorpage))
    );
    const notFoundHtml = renderDocument(
      template, notFoundPage, notFoundMarkup, null, SOCIAL_IMAGE
    );
    fs.writeFileSync(path.join(dist, "404.html"), notFoundHtml, "utf8");
    console.log("Prerendered /404.html (noindex)");
  } finally {
    await server.close();
  }
}

if (require.main === module) {
  prerender().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { renderDocument, prerender };
