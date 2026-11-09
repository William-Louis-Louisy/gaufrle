import type { IGridData } from "../types/GameGrid";
import { calculateCellStatus, checkIfGridIsSolved, gridMetadata } from "./CellStatus";
import {
  GameMode,
  GameSession,
  applyGameMove,
  canSwapGameCells,
  createGameIdentity,
  decodeGameSession,
  getCorrectGrid,
  loadGameSession,
  saveGameSession,
} from "./GameSession";
import { calculateVictoryScore } from "./Scoring";

const fixtures: Record<GameMode, IGridData> = {
  normal: require("../jsons/NormalGridList.json")[0],
  medium: require("../jsons/MediumGridList.json")[4],
  hard: require("../jsons/HardGridList.json")[0],
};

type Cell = { row: number; col: number };

function findDifferentLetters(board: string[][]): [Cell, Cell] {
  const playable: Cell[] = [];
  board.forEach((row, rowIndex) =>
    row.forEach((letter, colIndex) => {
      if (letter !== "❌") playable.push({ row: rowIndex, col: colIndex });
    })
  );

  for (const first of playable) {
    for (const second of playable) {
      if (board[first.row][first.col] !== board[second.row][second.col]) {
        return [first, second];
      }
    }
  }
  throw new Error("Fixture requires at least two different playable letters");
}

function solvedLetters(solution: string[][]): string[][] {
  return solution.map((row) => row.map((letter) => letter === "❌" ? "" : letter));
}

describe.each(["normal", "medium", "hard"] as GameMode[])(
  "P1.3 engine regression: %s",
  (mode) => {
    const puzzle = fixtures[mode];
    const solution = getCorrectGrid(mode, puzzle.words);
    const solved = solvedLetters(solution);
    const [first, second] = findDifferentLetters(solution);

    const almostSolved = solvedLetters(solution);
    [almostSolved[first.row][first.col], almostSolved[second.row][second.col]] = [
      almostSolved[second.row][second.col],
      almostSolved[first.row][first.col],
    ];

    const identity = createGameIdentity(mode, puzzle.date, puzzle);
    const finalMoveSession: GameSession = {
      version: 2,
      identity,
      gridLetters: almostSolved,
      minMoves: 2,
      moveLimit: 2,
      remainingMoves: 1,
      status: "playing",
    };

    test("one permitted swap wins on the final move without mutating the previous state", () => {
      expect(checkIfGridIsSolved(almostSolved, solution)).toBe(false);
      expect(canSwapGameCells(
        finalMoveSession, solution, first.row, first.col, second.row, second.col
      )).toBe(true);

      const before = JSON.stringify(finalMoveSession);
      const won = applyGameMove(
        finalMoveSession, solution, first.row, first.col, second.row, second.col
      );

      expect(JSON.stringify(finalMoveSession)).toBe(before);
      expect(won).not.toBe(finalMoveSession);
      expect(won.gridLetters).toEqual(solved);
      expect(won.remainingMoves).toBe(0);
      expect(won.status).toBe("won");
      expect(calculateVictoryScore(won)).toEqual({
        stars: 3,
        movesUsed: 2,
        moveLimit: 2,
      });
      expect(applyGameMove(
        won, solution, first.row, first.col, second.row, second.col
      )).toBe(won);
    });

    test("winning session survives serialization and cannot leak to another period", () => {
      const won = applyGameMove(
        finalMoveSession, solution, first.row, first.col, second.row, second.col
      );
      const restored = decodeGameSession(JSON.stringify(won), identity, solution);

      expect(restored).toEqual(won);
      expect(restored?.gridLetters).not.toBe(won.gridLetters);
      expect(restored?.gridLetters[0]).not.toBe(won.gridLetters[0]);
      expect(calculateVictoryScore(restored!)).toEqual(calculateVictoryScore(won));
      expect(decodeGameSession(
        JSON.stringify(won),
        { ...identity, periodStart: "2099-01-01" },
        solution
      )).toBeNull();
    });

    test("a solved board has only correct playable cells and untouched blockers", () => {
      const snapshot = JSON.stringify(solved);
      const status = calculateCellStatus(solved, solution, mode);
      expect(status).toHaveLength(solution.length);

      solution.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
          expect(status[rowIndex][colIndex]).toBe(
            letter === "❌" ? "default" : "correct"
          );
        });
      });

      expect(gridMetadata[mode].nonPlayableCells).toHaveLength(
        solution.flat().filter((cell) => cell === "❌").length
      );
      expect(checkIfGridIsSolved(solved, solution)).toBe(true);
      expect(JSON.stringify(solved)).toBe(snapshot);
      expect(calculateCellStatus(solved, solution, mode)).toEqual(status);
    });
  }
);

describe("P1.3 persisted state boundaries", () => {
  const mode: GameMode = "normal";
  const puzzle = fixtures.normal;
  const solution = getCorrectGrid(mode, puzzle.words);
  const identity = createGameIdentity(mode, puzzle.date, puzzle);
  const [first, second] = findDifferentLetters(solution);
  const board = solvedLetters(solution);
  [board[first.row][first.col], board[second.row][second.col]] = [
    board[second.row][second.col],
    board[first.row][first.col],
  ];
  const session: GameSession = {
    version: 2, identity, gridLetters: board,
    minMoves: 2, moveLimit: 3, remainingMoves: 2, status: "playing",
  };

  afterEach(() => window.localStorage.clear());

  test("load returns null when the save is corrupt, without changing the current game", () => {
    const before = JSON.stringify(session);
    window.localStorage.setItem("currentNormalGrid", "{broken");
    expect(loadGameSession(identity, solution, session)).toBeNull();

    window.localStorage.setItem("currentNormalGrid", JSON.stringify({
      ...session, gridLetters: [[]],
    }));
    expect(loadGameSession(identity, solution, session)).toBeNull();
    expect(JSON.stringify(session)).toBe(before);
  });

  test.each([
    { minMoves: -1 },
    { minMoves: 1.5 },
    { moveLimit: 0 },
    { remainingMoves: -1 },
    { remainingMoves: 4 },
    { remainingMoves: 0 },
    { status: "won" },
    { version: 999 },
  ])("rejects an inconsistent persisted session: %p", (changes) => {
    expect(decodeGameSession(
      JSON.stringify({ ...session, ...changes }), identity, solution
    )).toBeNull();
  });

  test("save/load uses the mode's key and rejects a replay under a new identity", () => {
    saveGameSession(session);
    expect(loadGameSession(identity, solution, session)).toEqual(session);
    expect(loadGameSession(
      { ...identity, gridId: "another-puzzle" },
      solution,
      session
    )).toBeNull();
  });
});
