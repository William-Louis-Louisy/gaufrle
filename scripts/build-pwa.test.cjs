const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { afterEach, test } = require("node:test");
const { collectPrecacheUrls, buildServiceWorker } = require("./build-pwa.cjs");

const temporaryDirectories = [];
afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function fixture() {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "gaufrle-pwa-"));
  temporaryDirectories.push(dist);
  fs.mkdirSync(path.join(dist, "assets"));
  fs.mkdirSync(path.join(dist, "images"));
  for (const file of [
    "index.html", "manifest.json", "favicon.ico",
    "pwa-192.png", "pwa-512.png",
    "assets/index-a.js", "assets/index-b.css",
    "assets/NormalGamepage-c.js", "assets/HardGamepage-d.js",
    "assets/DefFiveLetters-big.js", "assets/DefSevenLetters-bigger.js",
    "images/banner.webp", "images/mascot.webp", "images/victory.webp",
  ]) {
    fs.writeFileSync(path.join(dist, file), file);
  }
  return dist;
}

test("precache contains the game routes, both dictionaries and all UI images", () => {
  const urls = collectPrecacheUrls(fixture());
  assert.ok(urls.includes("/index.html"));
  assert.ok(urls.includes("/manifest.json"));
  assert.ok(urls.includes("/pwa-192.png"));
  assert.ok(urls.includes("/pwa-512.png"));
  assert.ok(urls.includes("/assets/NormalGamepage-c.js"));
  assert.ok(urls.includes("/assets/HardGamepage-d.js"));
  assert.ok(urls.includes("/assets/index-b.css"));
  assert.ok(urls.includes("/assets/DefFiveLetters-big.js"));
  assert.ok(urls.includes("/assets/DefSevenLetters-bigger.js"));
  assert.ok(urls.includes("/images/banner.webp"));
  assert.ok(urls.includes("/images/mascot.webp"));
  assert.ok(urls.includes("/images/victory.webp"));
});

test("worker uses versioned caches and provides an offline SPA navigation fallback", () => {
  const dist = fixture();
  buildServiceWorker(dist);
  const source = fs.readFileSync(path.join(dist, "sw.js"), "utf8");
  assert.match(source, /gaufrle-precache-[a-f0-9]{12}/);
  assert.match(source, /request\.mode === "navigate"/);
  assert.match(source, /caches\.match\("\/index\.html"\)/);
  assert.doesNotMatch(source, /skipWaiting/);
  assert.match(source, /DefFiveLetters-big/);
  assert.match(source, /\/images\/banner.webp/);
});

test("updating the application changes the cache version", () => {
  const dist = fixture();
  buildServiceWorker(dist);
  const original = fs.readFileSync(path.join(dist, "sw.js"), "utf8");
  fs.writeFileSync(path.join(dist, "assets/index-a.js"), crypto.randomUUID());
  buildServiceWorker(dist);
  const updated = fs.readFileSync(path.join(dist, "sw.js"), "utf8");
  assert.notEqual(original, updated);
});

test("build fails when a required install icon is missing", () => {
  const dist = fixture();
  fs.rmSync(path.join(dist, "pwa-512.png"));
  assert.throws(() => buildServiceWorker(dist), /Missing offline asset: \/pwa-512.png/);
});
