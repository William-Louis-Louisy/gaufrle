import { generateCorrectGrid2D } from "./GridsGeneration";

// COUNT LETTER OCCURRENCES
const countLetterOccurrences = (arr: string[], letter: string) => {
  return arr.filter((l) => l === letter).length;
};

// VERIFY CELL STATUS
export const verifyCellStatus = (
  newGridLetters: string[][],
  setCellStatus: any,
  correctGrid: string[][],
  indexValue: number
) => {
  const newCellStatus = Array.from({ length: indexValue }, () =>
    Array(indexValue).fill("default")
  );

  for (let i = 0; i < indexValue; i++) {
    for (let j = 0; j < indexValue; j++) {
      const letter = newGridLetters[i][j];

      if (correctGrid[i][j] === "❌") {
        continue;
      }

      if (correctGrid[i][j] === letter) {
        newCellStatus[i][j] = "correct";
        continue;
      }

      const isFalseRow = correctGrid[i].includes("❌");
      const isFalseCol = correctGrid.some((row) => row[j] === "❌");

      const rowOccurrences = countLetterOccurrences(correctGrid[i], letter);
      const colOccurrences = countLetterOccurrences(
        correctGrid.map((row) => row[j]),
        letter
      );

      const actualRowOccurrences = countLetterOccurrences(
        newGridLetters[i],
        letter
      );
      const actualColOccurrences = countLetterOccurrences(
        newGridLetters.map((row) => row[j]),
        letter
      );

      const isInCorrectRow =
        !isFalseRow &&
        rowOccurrences >= actualRowOccurrences &&
        correctGrid[i].includes(letter);
      const isInCorrectCol =
        !isFalseCol &&
        colOccurrences >= actualColOccurrences &&
        correctGrid.some((row) => row[j] === letter);

      if (isInCorrectRow) {
        newCellStatus[i][j] = "lineOrColumn";
      } else if (isInCorrectCol) {
        newCellStatus[i][j] = "lineOrColumn";
      }
    }
  }

  setCellStatus(newCellStatus);
};

// CHECK IF GRID IS SOLVED
export const checkIfGridIsSolved = (
  currentGrid: string[][],
  correctGrid: string[][]
) => {
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
