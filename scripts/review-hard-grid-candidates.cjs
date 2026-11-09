"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * Editorial review sheet: prints all eight words and their definitions for
 * each unpublished candidate. Pipe to a local file to review before approval.
 */
const root = path.resolve(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const candidates = read("data/hard-grid-candidates.json");
const definitions = new Map(
  read("src/jsons/DefSevenLetters.json").map((x) => [
    x.word,
    (x.definition || []).find((s) => typeof s === "string" && s.trim()) || "Définition manquante",
  ])
);
const headings = ["Horizontal 1", "Horizontal 2", "Horizontal 3", "Horizontal 4",
  "Vertical 1", "Vertical 2", "Vertical 3", "Vertical 4"];

process.stdout.write("# Relecture du catalogue difficile — propositions non publiées\n\n");
process.stdout.write("Aucune proposition n'est publiée automatiquement. Vérifier chaque mot, sa définition et les huit mots de la grille.\n\n");
for (const candidate of candidates) {
  process.stdout.write("## " + candidate.id + " — " + candidate.reviewStatus + "\n\n");
  candidate.words.forEach((word, index) => {
    process.stdout.write("- **" + headings[index] + " — " + word + "** : " +
      String(definitions.get(word) || "Définition manquante").replace(/\s+/g, " ").trim() + "\n");
  });
  process.stdout.write("\n");
}
