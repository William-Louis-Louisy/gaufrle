import { useEffect, useState } from "react";

import { loadDefinitions, type WordDefinition } from "../utils/WordDefinitionsRepository";

type WordDefinitionsProps = {
  words: string[];
};

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
