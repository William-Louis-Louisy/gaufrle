import { generateCorrectGrid2D } from "./GridsGeneration";

// Vérifie si une cellule est adjacente à une cellule "non-jouable"
const isAdjacentToNonPlayable = (
  i: number,
  j: number,
  correctGrid: string[][]
) => {
  return (
    correctGrid[i].includes("❌") || correctGrid.some((row) => row[j] === "❌")
  );
};

export const verifyCellStatus = (
  newGridLetters: string[][],
  gameGrid: any,
  setCellStatus: any
) => {
  const newCellStatus = Array.from({ length: 5 }, () =>
    Array(5).fill("default")
  );

  // Grille correcte
  const correctGrid = generateCorrectGrid2D(gameGrid.words);

  // Utilisé pour suivre les lettres qui ont déjà obtenu le statut "lineOrColumn"
  const rowStatus: Record<string, boolean>[] = Array.from(
    { length: 5 },
    () => ({})
  );
  const colStatus: Record<string, boolean>[] = Array.from(
    { length: 5 },
    () => ({})
  );

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const letter = newGridLetters[i][j];

      // Ignore les cellules "non-jouables"
      if (correctGrid[i][j] === "❌") {
        continue;
      }

      // Règle 1 : Si la lettre est à sa place correcte
      if (correctGrid[i][j] === letter) {
        newCellStatus[i][j] = "correct";
        continue;
      }

      // Règle 3 : Si la cellule est adjacente à une cellule "non-jouable", ne pas vérifier dans cette direction
      const isAdjacent = isAdjacentToNonPlayable(i, j, correctGrid);

      // Règle 2 : Si la lettre est dans la bonne ligne ou colonne, mais pas à la bonne place
      const isInCorrectRow =
        !isAdjacent && correctGrid[i].includes(letter) && !rowStatus[i][letter];
      const isInCorrectCol =
        !isAdjacent &&
        correctGrid.some((row) => row[j] === letter) &&
        !colStatus[j][letter];

      if (isInCorrectRow) {
        newCellStatus[i][j] = "lineOrColumn";
        rowStatus[i][letter] = true;
      } else if (isInCorrectCol) {
        newCellStatus[i][j] = "lineOrColumn";
        colStatus[j][letter] = true;
      }
    }
  }

  setCellStatus(newCellStatus);
};
