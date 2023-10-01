import React, { useState, useEffect, useCallback } from "react";

interface WordFilterProps {
  words: string[];
  setWords: React.Dispatch<React.SetStateAction<string[]>>;
}

const WordFilter: React.FC<WordFilterProps> = ({ words, setWords }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Cette fonction est appelée lorsque l'utilisateur appuie sur une touche
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (currentIndex >= words.length) return;

      // Supprimer le mot en cours si la touche "Espace" est enfoncée
      if (event.code === "Space") {
        setWords((prevWords) =>
          prevWords.filter((_, index) => index !== currentIndex)
        );
      }

      // Passer au mot suivant
      setCurrentIndex((prevIndex) => prevIndex + 1);
    },
    [currentIndex, words.length]
  );

  // Ajouter et supprimer l'écouteur d'événement
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div>
      <h1>Word Filter</h1>
      <p>
        Current Word:{" "}
        <span className="text-4xl font-bold">{words[currentIndex]}</span>
      </p>
      <p>Words Left: {words.length - currentIndex}</p>
    </div>
  );
};

export default WordFilter;
