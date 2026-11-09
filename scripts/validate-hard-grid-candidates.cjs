"use strict";

const fs = require("node:fs");
const path = require("node:path");

function gridSignature(words) {
  return [...words].sort().join("|");
}

/**
 * Validate unpublished hard grid proposals against their source dictionary
 * and the frozen historical catalog, without changing publication dates.
 */
function validateHardCandidates(candidates, dictionary, existing, medium) {
  const errors = [];
  const knownWords = new Set(
    dictionary
      .filter((item) =>
        typeof item.word === "string" &&
        /^[a-z]{7}$/.test(item.word) &&
        Array.isArray(item.definition) &&
        item.definition.some((s) => typeof s === "string" && s.trim().length >= 25)
      )
      .map((item) => item.word)
  );
  const mediumWords = new Set(medium.flatMap((item) => item.words));
  const historicWords = new Set(existing.flatMap((item) => item.words));
  const originalSignatures = new Set(existing.map((item) => gridSignature(item.words)));
  const candidatesSeen = new Set();
  const ids = new Set();
  const wordUsage = new Map();
  const reviewedCounts = { pending: 0, approved: 0, rejected: 0 };

  if (!Array.isArray(candidates) || candidates.length !== 65) {
    errors.push("Expected exactly 65 unpublished grid candidates");
    if (!Array.isArray(candidates)) return { errors, reviewedCounts };
  }

  candidates.forEach((item, index) => {
    const id = "hard-candidate-" + String(index + 1).padStart(3, "0");
    if (!item || typeof item !== "object") {
      errors.push("Candidate #" + (index + 1) + " is missing or malformed");
      return;
    }
    if (item.id !== id || ids.has(item.id)) errors.push("Invalid or repeated candidate id at #" + (index + 1));
    ids.add(item.id);
    if (!Object.prototype.hasOwnProperty.call(reviewedCounts,item.reviewStatus)) {
      errors.push(id + " has an unknown review status");
    } else {
      reviewedCounts[item.reviewStatus]++;
    }
    if (!Array.isArray(item.words) || item.words.length !== 8) {
      errors.push(id + " must have four horizontal and four vertical words");
      return;
    }

    const words = item.words;
    if (new Set(words).size !== 8) errors.push(id + " repeats a word within its grid");

    words.forEach((word) => {
      if (typeof word !== "string" || !/^[a-z]{7}$/.test(word)) {
        errors.push(id + " has a malformed seven-letter word: " + String(word));
        return;
      }
      if (!knownWords.has(word)) errors.push(id + " has no substantive dictionary definition: " + word);
      wordUsage.set(word, (wordUsage.get(word) || 0) + 1);
    });

    const signature = gridSignature(words);
    if (candidatesSeen.has(signature) || originalSignatures.has(signature)) {
      errors.push(id + " repeats a candidate or published puzzle");
    }
    candidatesSeen.add(signature);

    const mediumCount = words.filter((word) => mediumWords.has(word)).length;
    if (mediumCount < 3) errors.push(id + " has fewer than three medium-catalog words");
    const historicCount = words.filter((word) => historicWords.has(word)).length;
    if (historicCount > 2) errors.push(id + " reuses more than two historical hard-grid words");

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        if (
          typeof words[row] !== "string" ||
          typeof words[4 + col] !== "string" ||
          words[row][col * 2] !== words[4 + col][row * 2]
        ) {
          errors.push(id + " has an invalid intersection at " + row + "," + col);
        }
      }
    }
  });

  for (const [word, uses] of wordUsage) {
    if (uses > 2) errors.push("Word appears in more than two proposed grids: " + word);
  }

  return {
    errors,
    reviewedCounts,
    distinctCandidateWords: wordUsage.size,
    distinctCandidateGrids: candidatesSeen.size,
  };
}

function validateFromRepository(root = path.resolve(__dirname, "..")) {
  const load = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  return validateHardCandidates(
    load("data/hard-grid-candidates.json"),
    load("src/jsons/DefSevenLetters.json"),
    load("src/jsons/HardGridList.json"),
    load("src/jsons/MediumGridList.json")
  );
}

if (require.main === module) {
  const result = validateFromRepository();
  if (result.errors.length) {
    for (const error of result.errors) process.stderr.write("FAIL " + error + String.fromCharCode(10));
    process.exitCode = 1;
  } else {
    process.stdout.write(
      "Validated " + result.distinctCandidateGrids +
      " distinct unpublished hard puzzles (" + result.distinctCandidateWords +
      " distinct words); review statuses: " + JSON.stringify(result.reviewedCounts) +
      String.fromCharCode(10)
    );
  }
}

module.exports = { gridSignature, validateHardCandidates, validateFromRepository };
