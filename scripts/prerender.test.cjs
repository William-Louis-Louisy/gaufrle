"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");
const { renderDocument } = require("./prerender.cjs");

const template = `<!doctype html><html lang="fr"><head>
  <title>Gaufrle</title>
  <meta name="description" content="old description">
  <meta property="og:url" content="https://gaufrle.vercel.app/">
  <script type="module" crossorigin src="/assets/index-123.js"></script>
</head><body><div id="root"></div></body></html>`;

function snapshot(pathname) {
  const page = {
    pathname,
    title: pathname === "/" ? "Gaufrle — Jeu de lettres" : "Gaufre salée — Défi hebdomadaire",
    description: "Un jeu de lettres quotidien en français et trois niveaux de difficulté.",
    url: "https://gaufrle.vercel.app" + pathname,
  };
  const html = renderDocument(template, page, "<main><h1>Un titre visible</h1></main>",
    { "@context": "https://schema.org", "@type": "WebPage", name: page.title },
    "https://gaufrle.vercel.app/social.png");
  return new JSDOM(html).window.document;
}

test("prerendered pages expose route-specific SEO before JavaScript execution", () => {
  const doc = snapshot("/hard-game");
  assert.equal(doc.title, "Gaufre salée — Défi hebdomadaire");
  assert.equal(doc.querySelector('meta[name="description"]').content,
    "Un jeu de lettres quotidien en français et trois niveaux de difficulté.");
  assert.equal(doc.querySelector('link[rel="canonical"]').href,
    "https://gaufrle.vercel.app/hard-game");
  assert.equal(doc.querySelector('meta[property="og:url"]').content,
    "https://gaufrle.vercel.app/hard-game");
  assert.equal(doc.querySelector('meta[name="twitter:url"]').content,
    "https://gaufrle.vercel.app/hard-game");
  assert.equal(doc.querySelector('meta[name="robots"]').content, "index,follow");
  assert.equal(doc.querySelector("#root main h1").textContent, "Un titre visible");
});

test("generated document has exactly one canonical and one structured-data block", () => {
  const doc = snapshot("/");
  assert.equal(doc.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(doc.querySelectorAll('script[type="application/ld+json"]').length, 1);
  assert.equal(doc.querySelectorAll('meta[property="og:url"]').length, 1);
  assert.equal(doc.querySelectorAll('meta[name="description"]').length, 1);
  assert.equal(doc.querySelectorAll('script[type="module"]').length, 1);
  assert.equal(JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)["@type"],
    "WebPage");
});

test("prerender JSON-LD is script-safe and does not inject HTML", () => {
  const page = {
    pathname: "/", title: "Test", description: "Test",
    url: "https://gaufrle.vercel.app/",
  };
  const html = renderDocument(template, page, "<main>Safe</main>",
    { description: "</script><script>bad()</script>" }, "https://gaufrle.vercel.app/image.png");
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('script[type="application/ld+json"]').length, 1);
  assert.equal(doc.querySelectorAll("script:not([type])").length, 0);
  assert.equal(JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent).description,
    "</script><script>bad()</script>");
});
