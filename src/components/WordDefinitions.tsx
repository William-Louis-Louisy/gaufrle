import React, { useEffect, useState } from "react";

type WordDefinitionsProps = {
  words: string[];
};

function WordDefinitions({ words }: WordDefinitionsProps) {
  const [definitions, setDefinitions] = useState<any[]>([]);

  useEffect(() => {
    // Charger les fichiers JSON contenant les définitions
    const definitions5 = require("../jsons/DefFiveLetters.json");
    const definitions7 = require("../jsons/DefSevenLetters.json");

    const relevantDefinitions: any[] = [];

    words.forEach((word) => {
      const defArray = word.length === 5 ? definitions5 : definitions7;
      const def = defArray.find((d: any) => d.word === word);
      if (def) {
        relevantDefinitions.push(def);
      }
    });

    setDefinitions(relevantDefinitions);
  }, [words]);

  return (
    <div className="theme-lmnt md:w-4/5 2xl:w-[70%] py-6 px-8 md:px-16 mb-8 md:rounded-md">
      <h3 className="mb-4 uppercase text-lg text-center">
        Définitions des mots
      </h3>
      <ul className="flex flex-col gap-4">
        {definitions.map((def, index) => (
          <li key={index} className="flex flex-col">
            <span className="font-bold text-base md:text-lg">{def.word}:</span>
            {def.definition.map((d: string, index: number) => (
              <p key={index} className="mx-4 italic text-sm md:text-base">
                {d}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WordDefinitions;
