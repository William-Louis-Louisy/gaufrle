"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { generateFromRepository } = require("./generate-hard-grid-candidates.cjs");
const { validateHardCandidates, validateFromRepository } = require("./validate-hard-grid-candidates.cjs");

const root = path.resolve(__dirname, "..");
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const candidates = load("data/hard-grid-candidates.json");
const dictionary = load("src/jsons/DefSevenLetters.json");
const hard = load("src/jsons/HardGridList.json");
const medium = load("src/jsons/MediumGridList.json");

test("the published 130 weekly entries remain untouched (65 pairs of duplicates)", () => {
  assert.equal(hard.length, 130);
  assert.equal(new Set(hard.map((g) => [...g.words].sort().join("|"))).size, 65);
  for (let i = 0; i < 65; i += 1) {
    assert.equal(hard[i].id, hard[i + 65].id);
    assert.deepEqual(hard[i].words, hard[i + 65].words);
  }
});

test("the 65 candidates are all distinct, correctly crossed, defined and pending review", () => {
  const result = validateFromRepository(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.distinctCandidateGrids, 65);
  assert.ok(result.distinctCandidateWords >= 300);
  assert.deepEqual(result.reviewedCounts, { pending: 65, approved: 0, rejected: 0 });
});

test("the candidate catalog can be regenerated deterministically from the repository dictionary", () => {
  assert.deepEqual(generateFromRepository(root), candidates);
});

test("rejects a broken intersection rather than accepting a visually plausible grid", () => {
  const altered = structuredClone(candidates);
  altered[0].words[0] = "zzzzzzz";
  const result = validateHardCandidates(altered, dictionary, hard, medium);
  assert.ok(result.errors.some((error) => error.includes("invalid intersection")));
});

test("rejects a word without an adequate dictionary definition", () => {
  const altered = structuredClone(candidates);
  altered[0].words[1] = "xxxxxxx";
  const result = validateHardCandidates(altered, dictionary, hard, medium);
  assert.ok(result.errors.some((error) => error.includes("no substantive dictionary definition")));
});

test("rejects a repeated complete puzzle, even when word order changes", () => {
  const altered = structuredClone(candidates);
  altered[1].words = [...altered[0].words].reverse();
  const result = validateHardCandidates(altered, dictionary, hard, medium);
  assert.ok(result.errors.some((error) => error.includes("repeats a candidate")));
});

test("rejects unreviewed candidates being mislabeled with an unknown status", () => {
  const altered = structuredClone(candidates);
  altered[0].reviewStatus = "published";
  const result = validateHardCandidates(altered, dictionary, hard, medium);
  assert.ok(result.errors.some((error) => error.includes("unknown review status")));
});
