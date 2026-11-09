import { IGridData } from "../types/GameGrid";
import { isLegacyPeriodCompatible } from "./LegacySaveCompatibility";
import { findMinimumMoves } from "./CalculateMoves";
import { checkIfGridIsSolved } from "./CellStatus";
import { generateCorrectGrid2D, generateNormalGrid2D } from "./GridsGeneration";
import {
  generateCorrectMediumGrid2D,
  generateMediumGrid2D,
} from "./MediumGridsGeneration";
import {
  generateCorrectHardGrid2D,
  generateHardGrid2D,
} from "./HardGridsGeneration";

export type GameMode = "normal" | "medium" | "hard";
export type GameStatus = "playing" | "won" | "lost";

export interface GameIdentity {
  mode: GameMode;
  periodStart: string;
  gridId: string;
}

export interface GameSession {
  version: 2;
  identity: GameIdentity;
  gridLetters: string[][];
  minMoves: number;
  moveLimit: number;
  remainingMoves: number;
  status: GameStatus;
}

const MOVE_FACTORS: Record<GameMode, number> = {
  normal: 1.33,
  medium: 1.5,
  hard: 1.75,
};

const STORAGE_KEYS: Record<GameMode, string> = {
  normal: "currentNormalGrid",
  medium: "currentMediumGrid",
  hard: "currentHardGrid",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

/**
 * A puzzle can recur in another period (P0.2, weekly cycling).
 * The period, mode and immutable puzzle ID must ALL match to resume.
 */
export function sameGameIdentity(
  left: GameIdentity,
  right: GameIdentity
): boolean {
  return (
    left.mode === right.mode &&
    left.gridId === right.gridId &&
    left.periodStart === right.periodStart
  );
}

export function getCorrectGrid(
  mode: GameMode,
  words: string[]
): string[][] {
  switch (mode) {
    case "normal":
      return generateCorrectGrid2D(words);
    case "medium":
      return generateCorrectMediumGrid2D(words);
    case "hard":
      return generateCorrectHardGrid2D(words);
  }
}

function getStartingGrid(mode: GameMode, words: string[]): string[][] {
  switch (mode) {
    case "normal":
      return generateNormalGrid2D(words);
    case "medium":
      return generateMediumGrid2D(words);
    case "hard":
      return generateHardGrid2D(words);
  }
}

export function createGameIdentity(
  mode: GameMode,
  periodStart: string,
  grid: Pick<IGridData, "id">
): GameIdentity {
  return { mode, periodStart, gridId: grid.id };
}

export function createInitialGame(
  mode: GameMode,
  grid: IGridData,
  periodStart: string
): GameSession {
  const correctGrid = getCorrectGrid(mode, grid.words);
  const gridLetters = getStartingGrid(mode, grid.words);
  const size = correctGrid.length;
  const minMoves = findMinimumMoves(
    correctGrid,
    gridLetters,
    size,
    size
  );
  const moveLimit = Math.max(1, Math.ceil(minMoves * MOVE_FACTORS[mode]));

  return {
    version: 2,
    identity: createGameIdentity(mode, periodStart, grid),
    gridLetters,
    minMoves,
    moveLimit,
    remainingMoves: moveLimit,
    status: checkIfGridIsSolved(gridLetters, correctGrid) ? "won" : "playing",
  };
}

function hasValidLetters(gridLetters: unknown, correctGrid: string[][]): gridLetters is string[][] {
  if (
    !Array.isArray(gridLetters) ||
    !correctGrid.length ||
    gridLetters.length !== correctGrid.length
  ) {
    return false;
  }

  const actualLetters: string[] = [];
  const solutionLetters: string[] = [];

  for (let row = 0; row < correctGrid.length; row += 1) {
    const lettersRow: unknown = gridLetters[row];
    if (
      !Array.isArray(lettersRow) ||
      lettersRow.length !== correctGrid[row].length
    ) {
      return false;
    }

    for (let col = 0; col < correctGrid[row].length; col += 1) {
      const solution = correctGrid[row][col];
      const actual: unknown = lettersRow[col];

      if (solution === "❌") {
        if (actual !== "") return false;
      } else {
        if (typeof actual !== "string" || actual.length !== 1) return false;
        actualLetters.push(actual);
        solutionLetters.push(solution);
      }
    }
  }

  // A saved game must contain exactly the same letters as its puzzle.
  return (
    actualLetters.sort().join("|") === solutionLetters.sort().join("|")
  );
}

/**
 * Old saves carry no grid ID. Only migrate them if a comparison with the
 * original pre-P0.1 catalog proves that this period had the same puzzle.
 * Legacy status flags and cell statuses were stale; derive them afresh.
 */
export function decodeGameSession(
  raw: string | null,
  expectedIdentity: GameIdentity,
  correctGrid: string[][],
  initialSession?: GameSession
): GameSession | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    if (!("version" in parsed)) {
      if (
        !initialSession ||
        !sameGameIdentity(initialSession.identity, expectedIdentity) ||
        !isLegacyPeriodCompatible(expectedIdentity.mode, expectedIdentity.periodStart) ||
        !hasValidLetters(parsed.gridLetters, correctGrid) ||
        !isNonNegativeInteger(parsed.remainingMoves) ||
        parsed.remainingMoves > initialSession.moveLimit ||
        typeof parsed.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
      ) {
        return null;
      }

      const periodStart = expectedIdentity.periodStart;
      const periodEnd = expectedIdentity.mode === "hard"
        ? new Date(Date.parse(periodStart + "T00:00:00Z") + 6 * 86400000)
            .toISOString()
            .slice(0, 10)
        : periodStart;

      if (parsed.date < periodStart || parsed.date > periodEnd) return null;

      const gridLetters = parsed.gridLetters.map((row) => [...row]);
      const solved = checkIfGridIsSolved(gridLetters, correctGrid);
      return {
        ...initialSession,
        gridLetters,
        remainingMoves: parsed.remainingMoves,
        status: solved ? "won" : parsed.remainingMoves === 0 ? "lost" : "playing",
      };
    }

    if (parsed.version !== 2 || !isRecord(parsed.identity)) return null;

    const savedIdentity = parsed.identity;
    if (
      savedIdentity.mode !== expectedIdentity.mode ||
      savedIdentity.periodStart !== expectedIdentity.periodStart ||
      savedIdentity.gridId !== expectedIdentity.gridId
    ) {
      return null;
    }

    if (!hasValidLetters(parsed.gridLetters, correctGrid)) return null;

    const maxPlayableCells = correctGrid
      .flat()
      .filter((letter) => letter !== "❌").length;

    if (
      !isNonNegativeInteger(parsed.minMoves) ||
      parsed.minMoves > maxPlayableCells ||
      !isNonNegativeInteger(parsed.moveLimit) ||
      parsed.moveLimit < 1 ||
      parsed.moveLimit > maxPlayableCells * 4 ||
      !isNonNegativeInteger(parsed.remainingMoves) ||
      parsed.remainingMoves > parsed.moveLimit
    ) {
      return null;
    }

    const solved = checkIfGridIsSolved(parsed.gridLetters, correctGrid);
    const expectedStatus: GameStatus = solved
      ? "won"
      : parsed.remainingMoves === 0
        ? "lost"
        : "playing";

    if (parsed.status !== expectedStatus) return null;

    return {
      version: 2,
      identity: { ...expectedIdentity },
      gridLetters: parsed.gridLetters.map((row) => [...row]),
      minMoves: parsed.minMoves,
      moveLimit: parsed.moveLimit,
      remainingMoves: parsed.remainingMoves,
      status: expectedStatus,
    };
  } catch {
    // Invalid or partially written localStorage JSON is treated as no save.
    return null;
  }
}

export function applyGameMove(
  session: GameSession,
  correctGrid: string[][],
  sourceRow: number,
  sourceCol: number,
  destRow: number,
  destCol: number
): GameSession {
  if (
    session.status !== "playing" ||
    session.remainingMoves <= 0 ||
    ![sourceRow, sourceCol, destRow, destCol].every(Number.isInteger) ||
    (sourceRow === destRow && sourceCol === destCol)
  ) {
    return session;
  }

  const sourceSolution = correctGrid[sourceRow]?.[sourceCol];
  const destSolution = correctGrid[destRow]?.[destCol];
  const sourceLetter = session.gridLetters[sourceRow]?.[sourceCol];
  const destLetter = session.gridLetters[destRow]?.[destCol];

  if (
    sourceSolution === undefined ||
    destSolution === undefined ||
    sourceSolution === "❌" ||
    destSolution === "❌" ||
    sourceLetter === undefined ||
    destLetter === undefined ||
    sourceSolution === sourceLetter ||
    destSolution === destLetter
  ) {
    return session;
  }

  const gridLetters = session.gridLetters.map((row) => [...row]);
  gridLetters[sourceRow][sourceCol] = destLetter;
  gridLetters[destRow][destCol] = sourceLetter;

  const remainingMoves = session.remainingMoves - 1;
  const status: GameStatus = checkIfGridIsSolved(gridLetters, correctGrid)
    ? "won"
    : remainingMoves === 0
      ? "lost"
      : "playing";

  return { ...session, gridLetters, remainingMoves, status };
}

export function loadGameSession(
  expectedIdentity: GameIdentity,
  correctGrid: string[][],
  initialSession: GameSession
): GameSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS[expectedIdentity.mode]);
    return decodeGameSession(raw, expectedIdentity, correctGrid, initialSession);
  } catch {
    // Browsers can block storage access (privacy mode / quota / permissions).
    return null;
  }
}

export function saveGameSession(session: GameSession): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS[session.identity.mode],
      JSON.stringify(session)
    );
  } catch {
    // Keep playing in memory even when persistence is unavailable.
  }
}
