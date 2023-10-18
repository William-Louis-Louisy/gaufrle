export type Grid = string[][];

// Calcule le nombre minimum de mouvements pour résoudre la grille
export function findMinimumMoves(
  startGrid: Grid,
  targetGrid: Grid,
  row: number,
  col: number
): number {
  let minMoves = 0;
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      const letter = startGrid[i][j];
      if (letter === "❌") continue; // Skip non-playable cells

      // Check if this letter is at its target position
      if (targetGrid[i][j] !== letter) {
        minMoves++;
      }
    }
  }
  return minMoves;
}
