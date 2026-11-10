const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DIST = path.resolve(__dirname, "../dist");
const APP_SHELL = [
  "/index.html", "/manifest.json", "/favicon.ico",
  "/pwa-192.png", "/pwa-512.png",
];
const DEFERRED_DICTIONARIES = /^Def(?:Five|Seven)Letters-/;

function collectPrecacheUrls(dist = DIST) {
  const assets = fs.readdirSync(path.join(dist, "assets"))
    .filter((name) => /\.(?:js|css)$/.test(name))
    .filter((name) => !DEFERRED_DICTIONARIES.test(name))
    .sort()
    .map((name) => "/assets/" + name);
  return [...APP_SHELL, ...assets];
}

const WORKER_SOURCE = String.raw`/* Generated during the Vite build. Do not edit dist/sw.js. */
const PRECACHE = __PRECACHE__;
const CACHE_NAME = "gaufrle-precache-__REVISION__";
const RUNTIME_NAME = "gaufrle-runtime-__REVISION__";
const OWN_CACHE_PREFIX = "gaufrle-";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  // Wait for existing tabs to close; never interrupt a game in progress.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith(OWN_CACHE_PREFIX) &&
        key !== CACHE_NAME && key !== RUNTIME_NAME)
        .map((key) => caches.delete(key))
    )),
    self.clients.claim(),
  ]));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () => {
      const cached = await caches.match("/index.html");
      return cached || Response.error();
    }));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(RUNTIME_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })());
    return;
  }

  if (PRECACHE.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
`;

function generateWorker(urls, revision) {
  return WORKER_SOURCE
    .replace("__PRECACHE__", JSON.stringify(urls))
    .replaceAll("__REVISION__", revision);
}

function buildServiceWorker(dist = DIST) {
  const urls = collectPrecacheUrls(dist);
  for (const url of urls) {
    if (!fs.existsSync(path.join(dist, url.slice(1)))) {
      throw new Error("Missing offline asset: " + url);
    }
  }
  const revision = crypto.createHash("sha256")
    .update(urls.map((url) =>
      url + ":" + crypto.createHash("sha256")
        .update(fs.readFileSync(path.join(dist, url.slice(1))))
        .digest("hex")
    ).join("\n"))
    .digest("hex").slice(0, 12);

  fs.writeFileSync(path.join(dist, "sw.js"), generateWorker(urls, revision));
  console.log("PWA: precached " + urls.length + " files (" + revision + ")");
}

if (require.main === module) buildServiceWorker();
module.exports = { collectPrecacheUrls, generateWorker, buildServiceWorker };
