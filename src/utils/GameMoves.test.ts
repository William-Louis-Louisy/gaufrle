import { gridMetadata } from "./CellStatus";
import {
  GameMode,
  GameSession,
  applyGameMove,
  canSwapGameCells,
  createInitialGame,
  getCorrectGrid,
} from "./GameSession";
import { IGridData } from "../types/GameGrid";

const fixtures: Record<GameMode, IGridData> = {
  normal: require("../jsons/NormalGridList.json")[0],
  medium: require("../jsons/MediumGridList.json")[4],
  hard: require("../jsons/HardGridList.json")[0],
};

type Position = { row: number; col: number };

function findMovePair(session: GameSession, correctGrid: string[][]): [Position, Position] {
  const candidates: Position[] = [];
  for (let row = 0; row < correctGrid.length; row += 1) {
    for (let col = 0; col < correctGrid[row].length; col += 1) {
      const current = session.gridLetters[row][col];
      if (correctGrid[row][col] !== "❌" && current !== correctGrid[row][col]) {
        candidates.push({ row, col });
      }
    }
  }

  for (const source of candidates) {
    for (const target of candidates) {
      if (
        (source.row !== target.row || source.col !== target.col) &&
        session.gridLetters[source.row][source.col] !==
          session.gridLetters[target.row][target.col]
      ) {
        return [source, target];
      }
    }
  }

  throw new Error("Fixture has no swappable incorrect letter pair");
}

function swap(
  session: GameSession,
  correct: string[][],
  from: Position,
  to: Position
): GameSession {
  return applyGameMove(session, correct, from.row, from.col, to.row, to.col);
}

describe.each(["normal", "medium", "hard"] as GameMode[])(
  "P0.4 move validation in %s mode",
  (mode) => {
    const puzzle = fixtures[mode];
    const correctGrid = getCorrectGrid(mode, puzzle.words);
    const base = createInitialGame(mode, puzzle, puzzle.date);
    const [from, to] = findMovePair(base, correctGrid);

    test("accepts a swap between two unsolved playable cells, anywhere", () => {
      expect(canSwapGameCells(base, correctGrid, from.row, from.col, to.row, to.col))
        .toBe(true);

      const after = swap(base, correctGrid, from, to);
      expect(after).not.toBe(base);
      expect(after.remainingMoves).toBe(base.remainingMoves - 1);
      expect(after.gridLetters[from.row][from.col])
        .toBe(base.gridLetters[to.row][to.col]);
      expect(after.gridLetters[to.row][to.col])
        .toBe(base.gridLetters[from.row][from.col]);
      expect(base.gridLetters[from.row][from.col])
        .not.toBe(after.gridLetters[from.row][from.col]);
    });

    test("refuses to swap with a non-playable cell in either direction", () => {
      const index = gridMetadata[mode].nonPlayableCells[0];
      const blocked = { row: Math.floor(index / correctGrid.length), col: index % correctGrid.length };
      expect(correctGrid[blocked.row][blocked.col]).toBe("❌");

      expect(swap(base, correctGrid, from, blocked)).toBe(base);
      expect(swap(base, correctGrid, blocked, to)).toBe(base);
      expect(canSwapGameCells(base, correctGrid, from.row, from.col, blocked.row, blocked.col))
        .toBe(false);
    });

    test("does not move a correctly positioned letter, from or to it", () => {
      const nowCorrect: GameSession = {
        ...base,
        gridLetters: base.gridLetters.map((row) => [...row]),
      };
      nowCorrect.gridLetters[from.row][from.col] = correctGrid[from.row][from.col];

      expect(swap(nowCorrect, correctGrid, from, to)).toBe(nowCorrect);
      expect(swap(nowCorrect, correctGrid, to, from)).toBe(nowCorrect);
    });

    test("rejects out-of-range, fractional and identical coordinates", () => {
      expect(swap(base, correctGrid, from, from)).toBe(base);
      expect(swap(base, correctGrid, { row: -1, col: 0 }, to)).toBe(base);
      expect(swap(base, correctGrid, from, { row: 0, col: 99 })).toBe(base);
      expect(swap(base, correctGrid, { row: 0.5, col: 0 }, to)).toBe(base);
      expect(swap(base, correctGrid, { row: NaN, col: 0 }, to)).toBe(base);
    });

    test("rejects same-letter swaps without spending a move", () => {
      const withSameLetters: GameSession = {
        ...base,
        gridLetters: base.gridLetters.map((row) => [...row]),
      };
      withSameLetters.gridLetters[to.row][to.col] =
        withSameLetters.gridLetters[from.row][from.col];

      expect(swap(withSameLetters, correctGrid, from, to)).toBe(withSameLetters);
      expect(withSameLetters.remainingMoves).toBe(base.remainingMoves);
      expect(canSwapGameCells(
        withSameLetters, correctGrid, from.row, from.col, to.row, to.col
      )).toBe(false);
    });

    test("rejects moves after victory, defeat or exhaustion of moves", () => {
      for (const state of [
        { ...base, status: "won" as const },
        { ...base, status: "lost" as const },
        { ...base, remainingMoves: 0 },
      ]) {
        expect(swap(state, correctGrid, from, to)).toBe(state);
      }
    });
  }
);

test("two identical misplaced letters are a true no-op, even when neither is locked", () => {
  const solution = [["a", "a", "b", "b"]];
  const session: GameSession = {
    version: 2,
    identity: { mode: "normal", periodStart: "2026-11-09", gridId: "same-letter" },
    gridLetters: [["b", "b", "a", "a"]],
    minMoves: 4,
    moveLimit: 6,
    remainingMoves: 3,
    status: "playing",
  };

  expect(session.gridLetters[0][0]).not.toBe(solution[0][0]);
  expect(session.gridLetters[0][1]).not.toBe(solution[0][1]);
  expect(canSwapGameCells(session, solution, 0, 0, 0, 1)).toBe(false);
  expect(applyGameMove(session, solution, 0, 0, 0, 1)).toBe(session);
  expect(session.remainingMoves).toBe(3);
});

describe("last move and state consistency", () => {
  const correctGrid = [["a", "b"], ["c", "d"]];
  const base: GameSession = {
    version: 2,
    identity: { mode: "normal", periodStart: "2026-11-09", gridId: "test" },
    gridLetters: [["b", "a"], ["c", "d"]],
    minMoves: 2,
    moveLimit: 2,
    remainingMoves: 1,
    status: "playing",
  };

  test("can win with the last move without marking the game lost", () => {
    const updated = applyGameMove(base, correctGrid, 0, 0, 0, 1);
    expect(updated.status).toBe("won");
    expect(updated.remainingMoves).toBe(0);
    expect(updated.gridLetters).toEqual(correctGrid);
  });

  test("can lose with the last move without allowing a subsequent swap", () => {
    const changed: GameSession = {
      ...base,
      gridLetters: [["b", "c"], ["a", "d"]],
    };
    const lost = applyGameMove(changed, correctGrid, 0, 0, 1, 0);
    expect(lost.status).toBe("lost");
    expect(lost.remainingMoves).toBe(0);
    expect(applyGameMove(lost, correctGrid, 0, 0, 1, 0)).toBe(lost);
  });
});
