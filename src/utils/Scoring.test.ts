import hardCatalog from "../jsons/HardGridList.json";
import mediumCatalog from "../jsons/MediumGridList.json";
import normalCatalog from "../jsons/NormalGridList.json";
import type { GameMode, GameSession } from "./GameSession";
import { createInitialGame, decodeGameSession, getCorrectGrid } from "./GameSession";
import type { IGridData } from "../types/GameGrid";
import { calculateVictoryScore } from "./Scoring";

const session = (
  moveLimit: number,
  remainingMoves: number,
  status: GameSession["status"] = "won"
): Pick<GameSession, "moveLimit" | "remainingMoves" | "status"> => ({
  moveLimit,
  remainingMoves,
  status,
});

describe("P1.2 victory scoring boundaries", () => {
  test.each([
    { remaining: 20, stars: 3, used: 0 },
    { remaining: 11, stars: 3, used: 9 },
    { remaining: 10, stars: 3, used: 10 },
    { remaining: 9, stars: 2, used: 11 },
    { remaining: 5, stars: 2, used: 15 },
    { remaining: 4, stars: 1, used: 16 },
    { remaining: 1, stars: 1, used: 19 },
    { remaining: 0, stars: 1, used: 20 },
  ])("returns $stars stars for $used/20 moves consumed", ({ remaining, stars, used }) => {
    expect(calculateVictoryScore(session(20, remaining))).toEqual({
      stars,
      movesUsed: used,
      moveLimit: 20,
    });
  });

  test.each([
    [1, 1, 0, 3],
    [1, 0, 1, 1],
    [3, 2, 1, 3],
    [3, 1, 2, 2],
    [3, 0, 3, 1],
    [5, 3, 2, 3],
    [5, 2, 3, 2],
    [5, 1, 4, 1],
    [7, 4, 3, 3],
    [7, 3, 4, 2],
    [7, 1, 6, 1],
  ])("handles small budgets: limit=%d remaining=%d => used=%d stars=%d", (limit, remaining, used, stars) => {
    expect(calculateVictoryScore(session(limit, remaining))).toEqual({
      stars,
      movesUsed: used,
      moveLimit: limit,
    });
  });

  test.each(["playing", "lost"] as GameSession["status"][])(
    "does not award stars when the game is %s",
    (status) => {
      expect(calculateVictoryScore(session(20, 10, status))).toBeNull();
    }
  );

  test.each([
    [0, 0],
    [-1, 0],
    [20, -1],
    [20, 21],
    [20.5, 10],
    [20, 10.5],
    [Number.NaN, 5],
    [Number.POSITIVE_INFINITY, 5],
  ])("rejects invalid budgets: limit=%s remaining=%s", (limit, remaining) => {
    expect(calculateVictoryScore(session(limit, remaining))).toBeNull();
  });

  test("higher move usage never improves the rating for any positive move limit", () => {
    for (let limit = 1; limit <= 100; limit += 1) {
      let previousStars = 3;
      for (let used = 0; used <= limit; used += 1) {
        const score = calculateVictoryScore(session(limit, limit - used));
        expect(score).not.toBeNull();
        expect(score!.stars).toBeLessThanOrEqual(previousStars);
        previousStars = score!.stars;
      }
    }
  });
});

describe("scoring is consistent with persisted game budgets", () => {
  const modeFactors: Record<GameMode, number> = {
    normal: 1.33,
    medium: 1.5,
    hard: 1.75,
  };
  const fixtures: Record<GameMode, IGridData> = {
    normal: normalCatalog[0],
    medium: mediumCatalog[4],
    hard: hardCatalog[0],
  };

  test.each(["normal", "medium", "hard"] as GameMode[])(
    "preserves the existing %s mode budget and produces the same rating after restoration",
    (mode) => {
      const grid = fixtures[mode];
      const original = createInitialGame(mode, grid, grid.date);
      const correctGrid = getCorrectGrid(mode, grid.words);
      const budget = Math.max(1, Math.ceil(original.minMoves * modeFactors[mode]));

      expect(original.moveLimit).toBe(budget);
      expect(original.remainingMoves).toBe(budget);

      const winningSession: GameSession = {
        ...original,
        gridLetters: correctGrid.map((row) =>
          row.map((cell) => (cell === "❌" ? "" : cell))
        ),
        status: "won",
        remainingMoves: Math.max(0, Math.floor(budget / 4)),
      };

      const scoreBefore = calculateVictoryScore(winningSession);
      const restored = decodeGameSession(
        JSON.stringify(winningSession),
        original.identity,
        correctGrid
      );
      expect(restored).toEqual(winningSession);
      expect(calculateVictoryScore(restored!)).toEqual(scoreBefore);
      expect(scoreBefore).not.toBeNull();
    }
  );
});
