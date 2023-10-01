export const transpose = (matrix: string[][]): string[][] => {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
};

// GENERATE THE CORRECT GRID
export const generateCorrectGrid2D = (words: string[]): string[][] => {
  // Initialize a 5x5 grid
  const grid: string[][] = Array.from({ length: 5 }, () => Array(5).fill(""));

  // First three words go into rows 1, 3, 5
  words.slice(0, 3).forEach((word, i) => {
    Array.from(word).forEach((letter, j) => {
      grid[i * 2][j] = letter;
    });
  });

  // Last three words go into columns 2, 4 (but not all letters)
  words.slice(3).forEach((word, i) => {
    // Extract letters at positions 1 and 3 (0-indexed) from each word
    const filteredLetters = [word[1], word[3]];

    // Insert these letters into the grid
    filteredLetters.forEach((letter, j) => {
      grid[j * 2 + 1][i * 2] = letter;
    });
  });

  // Mark non-playable cells
  [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ].forEach(([row, col]) => {
    grid[row][col] = "❌";
  });

  return transpose(grid);
};

// GENERATE SHUFFLED GRID
export const generateNormalGrid2D = (words: string[]) => {
  // Initialize a 2D array with 5 rows and 5 columns
  let grid = Array.from({ length: 5 }, () => Array(5).fill(""));

  // Extract all the letters from the rows
  let lettersFromRows = words.slice(0, 3).join("").split("");

  // Extract only the non-intersecting letters from the columns
  let lettersFromCols = words
    .slice(3)
    .map((word) => {
      return word.split("").filter((_, index) => ![0, 2, 4].includes(index));
    })
    .flat();

  let allLetters = [...lettersFromRows, ...lettersFromCols].sort();

  // Set the non-playable cells as empty
  const nonPlayableIndices = [6, 8, 16, 18];
  for (const index of nonPlayableIndices) {
    const row = Math.floor(index / 5);
    const col = index % 5;
    grid[row][col] = "";
  }

  // Fill the remaining empty cells with the leftover letters
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const flatIndex = i * 5 + j;
      if (grid[i][j] === "" && !nonPlayableIndices.includes(flatIndex)) {
        grid[i][j] = allLetters.pop() || "";
      }
    }
  }

  return grid;
};
