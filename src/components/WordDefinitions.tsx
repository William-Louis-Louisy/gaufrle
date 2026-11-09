import { useEffect, useState } from "react";

type WordDefinition = {
  word: string;
  definition: string[];
};

type WordDefinitionsProps = {
  words: string[];
};

/**
 * Definitions are large dictionaries. Load each dictionary only after a
 * completed game needs it, and only for word lengths present in that puzzle.
 */
async function loadDefinitions(words: string[]): Promise<WordDefinition[]> {
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

  // Preserve the original puzzle word order and skip missing definitions.
  const byFive = new Map(five.map((entry) => [entry.word, entry]));
  const bySeven = new Map(seven.map((entry) => [entry.word, entry]));
  return words
    .map((word) => (word.length === 5 ? byFive : bySeven).get(word))
    .filter((entry): entry is WordDefinition => entry !== undefined);
}

function WordDefinitions({ words }: WordDefinitionsProps) {
  const [definitions, setDefinitions] = useState<WordDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setHasError(false);
    setDefinitions([]);

    loadDefinitions(words)
      .then((result) => {
        if (active) setDefinitions(result);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [words]);

  return (
    <div className="theme-lmnt md:w-4/5 2xl:w-[70%] py-6 px-8 md:px-16 mb-8 md:rounded-md">
      <h3 className="mb-4 uppercase text-lg text-center">Définitions des mots</h3>
      {isLoading && <p role="status">Chargement des définitions…</p>}
      {hasError && <p role="alert">Impossible de charger les définitions pour le moment.</p>}
      {!isLoading && !hasError && (
        <ul className="flex flex-col gap-4">
          {definitions.map((def) => (
            <li key={def.word} className="flex flex-col">
              <span className="font-bold text-base md:text-lg">{def.word}:</span>
              {def.definition.map((definition, index) => (
                <p key={index} className="mx-4 italic text-sm md:text-base">
                  {definition}
                </p>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WordDefinitions;
