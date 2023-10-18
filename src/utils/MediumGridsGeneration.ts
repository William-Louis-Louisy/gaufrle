// GENERATE THE CORRECT MEDIUM GRID
export const generateCorrectMediumGrid2D = (words: string[]): string[][] => {
  // Initialize a 7x7 grid
  const grid: string[][] = Array.from({ length: 7 }, () => Array(7).fill(""));

  // Mark non-playable cells
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 4],
    [0, 5],
    [0, 6],
    [1, 0],
    [1, 6],
    [2, 0],
    [2, 2],
    [2, 4],
    [2, 6],
    [4, 0],
    [4, 2],
    [4, 4],
    [4, 6],
    [5, 0],
    [5, 6],
    [6, 0],
    [6, 1],
    [6, 2],
    [6, 4],
    [6, 5],
    [6, 6],
  ].forEach(([row, col]) => {
    grid[row][col] = "❌";
  });

  // First three words go into rows at indices 1, 3, 5, first and last words starts at col[1], second word starts at col[0]
  words.slice(0, 3).forEach((word, i) => {
    Array.from(word).forEach((letter, j) => {
      i === 1
        ? (grid[i * 2 + 1][j] = letter)
        : (grid[i * 2 + 1][j + 1] = letter);
    });
  });

  // Last three words go into columns at indices 2, 4, 6, first and last words starts at row[1], second word starts at row[0]
  words.slice(3).forEach((word, i) => {
    // Extract letters at indices 1 and 3 from first and last word, and 0, 2, 4 and 6 from second word
    const filteredLetters =
      i === 1 ? [word[0], word[2], word[4], word[6]] : [word[1], word[3]];

    // Insert these letters into the grid
    filteredLetters.forEach((letter, j) => {
      i === 1
        ? (grid[j * 2][i * 2 + 1] = letter)
        : (grid[j * 2 + 2][i * 2 + 1] = letter);
    });
  });

  return grid;
};

// GENERATE SHUFFLED MEDIUM GRID
export const generateMediumGrid2D = (words: string[]) => {
  // Initialize a 2D array with 7 rows and 7 columns
  let grid = Array.from({ length: 7 }, () => Array(7).fill(""));

  // Extract all the letters from the rows
  let lettersFromRows = words.slice(0, 3).join("").split("");

  // Extract only the non-intersecting letters from the columns
  let lettersFromCols = words
    .slice(3)
    .map((word, i) => {
      return word
        .split("")
        .filter((_, index) =>
          i === 1 ? [0, 2, 4, 6].includes(index) : [1, 3].includes(index)
        );
    })
    .flat();

  let allLetters = [...lettersFromRows, ...lettersFromCols].sort();

  // Set the non-playable cells as empty
  const nonPlayableIndices = [
    0, 1, 2, 4, 5, 6, 7, 13, 14, 16, 18, 20, 28, 30, 32, 34, 35, 41, 42, 43, 44,
    46, 47, 48,
  ];
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
