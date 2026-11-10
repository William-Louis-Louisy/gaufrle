export interface WordDefinition {
  word: string;
  definition: string[];
}

/**
 * Data access only. Keep dictionaries behind dynamic imports so they are
 * never bundled into the home page or loaded before a completed game.
 */
export async function loadDefinitions(words: readonly string[]): Promise<WordDefinition[]> {
  const needsFive = words.some((word) => word.length === 5);
  const needsSeven = words.some((word) => word.length === 7);

  const [five, seven] = await Promise.all([
    needsFive
      ? import("../jsons/DefFiveLetters.json").then((module) => module.default as WordDefinition[])
      : Promise.resolve([] as WordDefinition[]),
    needsSeven
      ? import("../jsons/DefSevenLetters.json").then((module) => module.default as WordDefinition[])
      : Promise.resolve([] as WordDefinition[]),
  ]);

  // Preserve the puzzle word order; unavailable definitions are omitted.
  const byFive = new Map(five.map((entry) => [entry.word, entry]));
  const bySeven = new Map(seven.map((entry) => [entry.word, entry]));
  return words
    .map((word) => (word.length === 5 ? byFive : bySeven).get(word))
    .filter((entry): entry is WordDefinition => entry !== undefined);
}
