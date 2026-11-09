// Metadonnées pour chaque type de grille
export const gridMetadata = {
  normal: {
    nonPlayableCells: [6, 8, 16, 18],
    words: [
      [0, 1, 2, 3, 4],
      [10, 11, 12, 13, 14],
      [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20],
      [2, 7, 12, 17, 22],
      [4, 9, 14, 19, 24],
    ],
  },
  medium: {
    nonPlayableCells: [
      0, 1, 2, 4, 5, 6, 7, 13, 14, 16, 18, 20, 28, 30, 32, 34, 35, 41, 42, 43,
      44, 46, 47, 48,
    ],
    words: [
      [8, 9, 10, 11, 12],
      [21, 22, 23, 24, 25, 26, 27],
      [36, 37, 38, 39, 40],
      [8, 15, 22, 29, 36],
      [3, 10, 17, 24, 31, 38, 45],
      [12, 19, 26, 33, 40],
    ],
  },
  hard: {
    nonPlayableCells: [8, 10, 12, 22, 24, 26, 36, 38, 40],
    words: [
      [0, 1, 2, 3, 4, 5, 6],
      [14, 15, 16, 17, 18, 19, 20],
      [28, 29, 30, 31, 32, 33, 34],
      [42, 43, 44, 45, 46, 47, 48],
      [0, 7, 14, 21, 28, 35, 42],
      [2, 9, 16, 23, 30, 37, 44],
      [4, 11, 18, 25, 32, 39, 46],
      [6, 13, 20, 27, 34, 41, 48],
    ],
  },
};

// Fonction pour compter le nombre d'occurrences d'une lettre dans un mot
const countOccurrences = (
  letter: string,
  wordIndices: number[],
  correctGrid: string[][]
) => {
  return wordIndices.reduce(
    (count, index) =>
      correctGrid[Math.floor(index / correctGrid.length)][
        index % correctGrid.length
      ] === letter
        ? count + 1
        : count,
    0
  );
};

// Fonction principale pour vérifier le statut de chaque cellule
export const calculateCellStatus = (
  newGridLetters: string[][],
  correctGrid: string[][],
  gridType: "normal" | "medium" | "hard"
): string[][] => {
  // Initialisation du statut des cellules à 'default'
  const newCellStatus = Array.from({ length: correctGrid.length }, () =>
    Array(correctGrid[0].length).fill("default")
  );

  // Récupération des métadonnées pour le type de grille actuel
  const metadata = gridMetadata[gridType];

  // Initialisation des compteurs pour le nombre d'occurrences de chaque lettre dans chaque mot
  const letterCountInWords: Map<string, number> = new Map();
  const correctLetterCountInWords: Map<string, number> = new Map();

  // Première passe pour mettre à jour le nombre d'occurrences correctes de chaque lettre dans chaque mot
  for (let i = 0; i < correctGrid.length; i++) {
    for (let j = 0; j < correctGrid[i].length; j++) {
      const index = i * correctGrid.length + j;

      // Ignorer les cellules non jouables
      if (metadata.nonPlayableCells.includes(index)) {
        continue;
      }

      const actualLetter = newGridLetters[i][j];
      const correctLetter = correctGrid[i][j];

      // Si la lettre est correcte, mettre à jour le compteur d'occurrences correctes pour cette lettre
      if (actualLetter === correctLetter) {
        for (const word of metadata.words) {
          if (word.includes(index)) {
            const key = `${word.join(",")}-${actualLetter}`;
            const currentCorrectCount = correctLetterCountInWords.get(key) || 0;
            correctLetterCountInWords.set(key, currentCorrectCount + 1);
          }
        }
      }
    }
  }

  // Deuxième passe pour définir le statut de chaque cellule en fonction des compteurs mis à jour
  for (let i = 0; i < correctGrid.length; i++) {
    for (let j = 0; j < correctGrid[i].length; j++) {
      const index = i * correctGrid.length + j;

      // Ignorer les cellules non jouables
      if (metadata.nonPlayableCells.includes(index)) {
        continue;
      }

      const actualLetter = newGridLetters[i][j];
      const correctLetter = correctGrid[i][j];

      // Si la lettre est correcte, mettre à jour le statut de la cellule à 'correct'
      if (actualLetter === correctLetter) {
        newCellStatus[i][j] = "correct";
        continue;
      }

      // Vérifier chaque mot pour déterminer le statut de la cellule
      for (const word of metadata.words) {
        if (word.includes(index)) {
          const occurrencesInWord = countOccurrences(
            actualLetter,
            word,
            correctGrid
          );
          const key = `${word.join(",")}-${actualLetter}`;
          const currentCount = letterCountInWords.get(key) || 0;
          const correctCount = correctLetterCountInWords.get(key) || 0;

          // Calculer les occurrences disponibles pour cette lettre dans ce mot
          const availableOccurrences = occurrencesInWord - correctCount;

          // Si les occurrences disponibles sont supérieures au compteur actuel, mettre à jour le statut de la cellule à 'lineOrColumn'
          if (availableOccurrences > 0 && availableOccurrences > currentCount) {
            newCellStatus[i][j] = "lineOrColumn";
            letterCountInWords.set(key, currentCount + 1);
          }
        }
      }
    }
  }

  return newCellStatus;
};

// Backwards-compatible setter wrapper. New game sessions use the pure function.
export const verifyCellStatus = (
  newGridLetters: string[][],
  setCellStatus: (status: string[][]) => void,
  correctGrid: string[][],
  gridType: "normal" | "medium" | "hard"
): void => {
  setCellStatus(calculateCellStatus(newGridLetters, correctGrid, gridType));
};

// CHECK IF GRID IS SOLVED
export const checkIfGridIsSolved = (
  currentGrid: string[][],
  correctGrid: string[][]
): boolean => {
  if (
    correctGrid.length === 0 ||
    currentGrid.length !== correctGrid.length ||
    correctGrid.some(
      (row, index) =>
        row.length === 0 || currentGrid[index]?.length !== row.length
    )
  ) {
    return false;
  }

  for (let i = 0; i < currentGrid.length; i++) {
    for (let j = 0; j < currentGrid[i].length; j++) {
      if (correctGrid[i][j] === "❌" && currentGrid[i][j] === "") {
        continue; // Ignore non-playable cells
      }
      if (currentGrid[i][j] !== correctGrid[i][j]) {
        return false;
      }
    }
  }
  return true;
};
