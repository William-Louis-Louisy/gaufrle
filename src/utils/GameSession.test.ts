import { IGridData } from "../types/GameGrid";
import { checkIfGridIsSolved } from "./CellStatus";
import {
  GameSession,
  applyGameMove,
  createInitialGame,
  decodeGameSession,
  getCorrectGrid,
  loadGameSession,
  saveGameSession,
} from "./GameSession";
import { isLegacyPeriodCompatible } from "./LegacySaveCompatibility";

const sampleGrid = (date: string = "2026-11-09"): IGridData => ({
  id: "example-puzzle-01",
  date,
  type: "normal",
  words: ["abcde", "fghij", "klmno", "apfqk", "crhsm", "etjwo"],
});

const initial = (date: string = "2026-11-09") =>
  createInitialGame("normal", sampleGrid(date), date);

describe("GameSession v2 persistence", () => {
  test("restores the right board, move budget, score and status", () => {
    const original = initial();
    const restored = decodeGameSession(
      JSON.stringify(original),
      original.identity,
      getCorrectGrid("normal", sampleGrid().words)
    );

    expect(restored).toEqual(original);
    expect(restored?.minMoves).toBe(original.minMoves);
    expect(restored?.moveLimit).toBe(original.moveLimit);
  });

  test("refuses to resume a puzzle in a different publication period", () => {
    const original = initial();
    const nextPeriod = { ...original.identity, periodStart: "2026-11-10" };
    const nextGrid = { ...original.identity, gridId: "another-puzzle" };
    const solution = getCorrectGrid("normal", sampleGrid().words);

    expect(decodeGameSession(JSON.stringify(original), nextPeriod, solution))
      .toBeNull();
    expect(decodeGameSession(JSON.stringify(original), nextGrid, solution))
      .toBeNull();
  });

  test("handles malformed JSON and rejects invalid grids or forged outcomes", () => {
    const original = initial();
    const solution = getCorrectGrid("normal", sampleGrid().words);

    expect(decodeGameSession("{broken", original.identity, solution)).toBeNull();
    expect(decodeGameSession("[]", original.identity, solution)).toBeNull();

    const forgedBoard: GameSession = {
      ...original,
      gridLetters: original.gridLetters.map((row) => [...row]),
    };
    forgedBoard.gridLetters[0][0] = "!";
    expect(decodeGameSession(JSON.stringify(forgedBoard), original.identity, solution))
      .toBeNull();

    expect(
      decodeGameSession(
        JSON.stringify({ ...original, status: "won" }),
        original.identity,
        solution
      )
    ).toBeNull();
  });

  test("restores terminal states including a victory with no remaining moves", () => {
    const original = initial();
    const solution = getCorrectGrid("normal", sampleGrid().words);
    const solvedBoard = solution.map((row) =>
      row.map((letter) => letter === "❌" ? "" : letter)
    );

    const winner: GameSession = {
      ...original,
      gridLetters: solvedBoard,
      remainingMoves: 0,
      status: "won",
    };
    const loser: GameSession = {
      ...original,
      remainingMoves: 0,
      status: "lost",
    };

    expect(checkIfGridIsSolved(solvedBoard, solution)).toBe(true);
    expect(decodeGameSession(JSON.stringify(winner), winner.identity, solution))
      .toEqual(winner);
    expect(decodeGameSession(JSON.stringify(loser), loser.identity, solution))
      .toEqual(loser);
  });

  test("stores and reads v2 data using the existing per-mode key", () => {
    const original = initial();
    const correctGrid = getCorrectGrid("normal", sampleGrid().words);

    window.localStorage.clear();
    saveGameSession(original);
    expect(window.localStorage.getItem("currentNormalGrid")).toContain(
      '"version":2'
    );
    expect(loadGameSession(original.identity, correctGrid, original))
      .toEqual(original);
    window.localStorage.clear();
  });
});

describe("gameplay state transitions", () => {
  const correctGrid = [["a", "b"], ["c", "d"]];
  const base: GameSession = {
    version: 2,
    identity: { mode: "normal", periodStart: "2026-11-09", gridId: "sample" },
    gridLetters: [["b", "a"], ["c", "d"]],
    minMoves: 2,
    moveLimit: 3,
    remainingMoves: 1,
    status: "playing",
  };

  test("calculates victory and remaining moves atomically", () => {
    const result = applyGameMove(base, correctGrid, 0, 0, 0, 1);
    expect(result.gridLetters).toEqual(correctGrid);
    expect(result.status).toBe("won");
    expect(result.remainingMoves).toBe(0);
    expect(base.gridLetters).toEqual([["b", "a"], ["c", "d"]]);
  });

  test("calculates defeat on the last incorrect move", () => {
    const current: GameSession = {
      ...base,
      gridLetters: [["b", "c"], ["a", "d"]],
    };
    const result = applyGameMove(current, correctGrid, 0, 0, 1, 0);
    expect(result.status).toBe("lost");
    expect(result.remainingMoves).toBe(0);
  });

  test("rejects invalid coordinates, unchanged cells and finished games", () => {
    expect(applyGameMove(base, correctGrid, 0, 0, 0, 0)).toBe(base);
    expect(applyGameMove(base, correctGrid, 7, 0, 0, 1)).toBe(base);
    expect(applyGameMove(base, correctGrid, 1, 0, 0, 1)).toBe(base);
    expect(applyGameMove({ ...base, status: "won" }, correctGrid, 0, 0, 0, 1))
      .toEqual({ ...base, status: "won" });
    expect(applyGameMove({ ...base, status: "lost" }, correctGrid, 0, 0, 0, 1))
      .toEqual({ ...base, status: "lost" });
  });
});

describe("safe migration from unversioned saves", () => {
  test("only permits periods with unchanged historical puzzle identity", () => {
    expect(isLegacyPeriodCompatible("normal", "2026-11-09")).toBe(true);
    expect(isLegacyPeriodCompatible("medium", "2026-11-09")).toBe(true);
    expect(isLegacyPeriodCompatible("normal", "2026-07-09")).toBe(false);
    expect(isLegacyPeriodCompatible("hard", "2025-11-03")).toBe(true);
    expect(isLegacyPeriodCompatible("hard", "2026-11-09")).toBe(false);
  });

  test("migrates compatible legacy saves and recomputes stale outcome flags", () => {
    const original = initial();
    const solution = getCorrectGrid("normal", sampleGrid().words);
    const legacy = {
      date: "2026-11-09",
      gridLetters: original.gridLetters,
      remainingMoves: original.remainingMoves - 1,
      cellStatus: [],
      isGameIsOver: true,
      isGridSolved: true,
    };

    const migrated = decodeGameSession(
      JSON.stringify(legacy),
      original.identity,
      solution,
      original
    );
    expect(migrated).toEqual({
      ...original,
      remainingMoves: original.remainingMoves - 1,
      status: "playing",
    });
  });

  test("rejects legacy data when its date was reassigned by P0.1", () => {
    const original = initial("2026-07-09");
    const solution = getCorrectGrid("normal", sampleGrid().words);
    const legacy = {
      date: "2026-07-09",
      gridLetters: original.gridLetters,
      remainingMoves: original.remainingMoves,
    };

    expect(
      decodeGameSession(
        JSON.stringify(legacy),
        original.identity,
        solution,
        original
      )
    ).toBeNull();
  });

  test("rejects an older weekly save outside its publication week", () => {
    const grid = {
      ...sampleGrid("2025-11-03"),
      type: "hard" as const,
      id: "weekly-01",
    };
    const original = createInitialGame("normal", sampleGrid("2025-11-03"), "2025-11-03");
    const identity = { mode: "hard" as const, gridId: grid.id, periodStart: "2025-11-03" };
    const saved = { ...original, identity };
    const solution = getCorrectGrid("normal", sampleGrid().words);
    const legacy = {
      date: "2025-11-10",
      gridLetters: original.gridLetters,
      remainingMoves: original.remainingMoves,
    };

    expect(decodeGameSession(JSON.stringify(legacy), identity, solution, saved))
      .toBeNull();
  });
});

test("an empty board is never considered a solved puzzle", () => {
  expect(checkIfGridIsSolved([], [])).toBe(false);
});
