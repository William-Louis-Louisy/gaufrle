// GENERATE THE CORRECT HARD GRID
export const generateCorrectHardGrid2D = (words: string[]): string[][] => {
  // Initialize a 7x7 grid
  const grid: string[][] = Array.from({ length: 7 }, () => Array(7).fill(""));

  // First four words go into rows 1, 3, 5, 7
  words.slice(0, 4).forEach((word, i) => {
    Array.from(word).forEach((letter, j) => {
      grid[i * 2][j] = letter;
    });
  });

  // Last four words go into columns 2, 4, 6
  words.slice(4).forEach((word, i) => {
    // Extract letters at positions 1, 3 and 5 (0-indexed) from each word
    const filteredLetters = [word[1], word[3], word[5]];

    // Insert these letters into the grid
    filteredLetters.forEach((letter, j) => {
      grid[j * 2 + 1][i * 2] = letter;
    });

    // Mark non-playable cells
    [
      [1, 1],
      [1, 3],
      [1, 5],
      [3, 1],
      [3, 3],
      [3, 5],
      [5, 1],
      [5, 3],
      [5, 5],
    ].forEach(([row, col]) => {
      grid[row][col] = "❌";
    });
  });

  return grid;
};

// GENERATE SHUFFLED HARD GRID
export const generateHardGrid2D = (words: string[]) => {
  // Initialize a 2D array with 7 rows and 7 columns
  let grid = Array.from({ length: 7 }, () => Array(7).fill(""));

  // Extract all the letters from the rows
  let lettersFromRows = words.slice(0, 4).join("").split("");

  // Extract only the non-intersecting letters from the columns
  let lettersFromCols = words
    .slice(4)
    .map((word) => {
      return word.split("").filter((_, index) => ![0, 2, 4, 6].includes(index));
    })
    .flat();

  let allLetters = [...lettersFromRows, ...lettersFromCols].sort();

  // Set the non-playable cells as empty
  const nonPlayableIndices = [8, 10, 12, 22, 24, 26, 36, 38, 40];
  for (const index of nonPlayableIndices) {
    const row = Math.floor(index / 7);
    const col = index % 7;
    grid[row][col] = "";
  }

  // Fill the remaining cells with letters
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const flatIndex = i * 7 + j;
      if (grid[i][j] === "" && !nonPlayableIndices.includes(flatIndex)) {
        grid[i][j] = allLetters.pop() || "";
      }
    }
  }

  return grid;
};
