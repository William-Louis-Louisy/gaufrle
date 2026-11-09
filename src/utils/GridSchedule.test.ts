import type { IGridData } from "../types/GameGrid";
import { createGameIdentity, sameGameIdentity } from "./GameSession";
import {
  HARD_CYCLE_LENGTH,
  HARD_FIRST_WEEK,
  addUtcDays,
  getNextGridChangeUtc,
  getSecondsUntilNextGrid,
  getUtcMonday,
  selectScheduledGrid,
} from "./GridSchedule";

const hardGrids: IGridData[] = require("../jsons/HardGridList.json");
const normalGrids: IGridData[] = require("../jsons/NormalGridList.json");
const mediumGrids: IGridData[] = require("../jsons/MediumGridList.json");

describe("the 130-week difficult puzzle cycle", () => {
  test("uses the existing 130 puzzles in their original order", () => {
    expect(hardGrids).toHaveLength(HARD_CYCLE_LENGTH);
    expect(new Set(hardGrids.map((grid) => grid.id)).size).toBe(HARD_CYCLE_LENGTH);
    expect(hardGrids[0].date).toBe(HARD_FIRST_WEEK);

    const first = selectScheduledGrid("hard", hardGrids, "2025-03-10");
    const last = selectScheduledGrid("hard", hardGrids, "2027-08-30");
    const restarted = selectScheduledGrid("hard", hardGrids, "2027-09-06");
    const second = selectScheduledGrid("hard", hardGrids, "2027-09-13");

    expect(first.grid).toBe(hardGrids[0]);
    expect(last.grid).toBe(hardGrids[129]);
    expect(restarted.grid).toBe(hardGrids[0]);
    expect(second.grid).toBe(hardGrids[1]);
    expect(last.periodStart).toBe("2027-08-30");
    expect(restarted.periodStart).toBe("2027-09-06");
  });

  test("keeps the same weekly puzzle from Monday through Sunday", () => {
    const monday = selectScheduledGrid("hard", hardGrids, "2027-08-30");
    const sunday = selectScheduledGrid("hard", hardGrids, "2027-09-05");

    expect(sunday.grid?.id).toBe(monday.grid?.id);
    expect(sunday.periodStart).toBe(monday.periodStart);
    expect(selectScheduledGrid("hard", hardGrids, "2027-09-06").grid?.id)
      .not.toBe(sunday.grid?.id);
  });

  test("assigns a fresh session identity to a repeated puzzle", () => {
    const first = selectScheduledGrid("hard", hardGrids, "2025-03-10");
    const replay = selectScheduledGrid("hard", hardGrids, "2027-09-06");

    expect(first.grid?.id).toBe(replay.grid?.id);
    const firstIdentity = createGameIdentity("hard", first.periodStart, first.grid!);
    const replayIdentity = createGameIdentity("hard", replay.periodStart, replay.grid!);
    expect(sameGameIdentity(firstIdentity, replayIdentity)).toBe(false);
  });

  test("is stable for multiple cycles without changing the 130-puzzle pool", () => {
    const first = selectScheduledGrid("hard", hardGrids, HARD_FIRST_WEEK);
    const replay = selectScheduledGrid(
      "hard", hardGrids, addUtcDays(HARD_FIRST_WEEK, HARD_CYCLE_LENGTH * 7 * 3)
    );
    expect(replay.grid?.id).toBe(first.grid?.id);
    expect(replay.periodStart).not.toBe(first.periodStart);
  });

  test("maintains the corrected current-week assignment", () => {
    const selected = selectScheduledGrid("hard", hardGrids, "2026-11-09");
    expect(selected.grid).toBe(hardGrids.find((grid) => grid.date === "2026-11-09"));
  });
});

describe("UTC publication dates", () => {
  test("handles daylight saving changes without skipping or doubling weeks", () => {
    expect(getUtcMonday("2026-03-29")).toBe("2026-03-23");
    expect(getUtcMonday("2026-03-30")).toBe("2026-03-30");
    expect(getUtcMonday("2026-10-25")).toBe("2026-10-19");
    expect(getUtcMonday("2026-10-26")).toBe("2026-10-26");
    expect(getUtcMonday("2027-01-03")).toBe("2026-12-28");
    expect(getUtcMonday("2027-01-04")).toBe("2027-01-04");
  });

  test("rolls over on Monday 00:00 UTC and never gives a negative countdown", () => {
    const sunday = new Date("2027-09-05T23:59:59.000Z");
    const monday = new Date("2027-09-06T00:00:00.000Z");

    expect(getNextGridChangeUtc(sunday, true).toISOString())
      .toBe("2027-09-06T00:00:00.000Z");
    expect(getSecondsUntilNextGrid(sunday, true)).toBe(1);
    expect(getSecondsUntilNextGrid(monday, true)).toBe(7 * 24 * 3600);
    expect(getSecondsUntilNextGrid(monday, false)).toBe(24 * 3600);
  });

  test("recognizes the next UTC day for daily publication", () => {
    const before = new Date("2026-11-09T23:59:59.000Z");
    expect(getNextGridChangeUtc(before, false).toISOString())
      .toBe("2026-11-10T00:00:00.000Z");
    expect(getSecondsUntilNextGrid(before, false)).toBe(1);
  });
});

describe("explicitly unavailable grids", () => {
  test("returns no puzzle when a daily catalog has reached its end", () => {
    expect(selectScheduledGrid("normal", normalGrids, "2047-08-29").grid)
      .toBeUndefined();
    expect(selectScheduledGrid("medium", mediumGrids, "2031-10-04").grid)
      .toBeUndefined();
  });

  test("returns no puzzle for an empty, incomplete or corrupted weekly catalog", () => {
    expect(selectScheduledGrid("hard", [], "2027-09-06").grid).toBeUndefined();
    expect(selectScheduledGrid("hard", hardGrids.slice(0, 129), "2027-09-06").grid)
      .toBeUndefined();

    const corrupted = [...hardGrids];
    corrupted[129] = { ...corrupted[129], words: [] };
    expect(selectScheduledGrid("hard", corrupted, "2027-08-30").grid)
      .toBeUndefined();
  });

  test("handles dates before the first weekly puzzle safely", () => {
    const result = selectScheduledGrid("hard", hardGrids, "2025-03-09");
    expect(result).toEqual({ periodStart: "2025-03-03", grid: undefined });
  });

  test("rejects invalid dates instead of calculating a spurious week", () => {
    expect(() => selectScheduledGrid("hard", hardGrids, "2026-02-30"))
      .toThrow("Invalid calendar date");
    expect(() => selectScheduledGrid("hard", hardGrids, "not-a-date"))
      .toThrow("Expected a YYYY-MM-DD UTC date");
  });
});
