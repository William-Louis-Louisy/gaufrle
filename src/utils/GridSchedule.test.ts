import hardCatalog from "../jsons/HardGridList.json";
import mediumCatalog from "../jsons/MediumGridList.json";
import normalCatalog from "../jsons/NormalGridList.json";
import type { IGridData } from "../types/GameGrid";
import { createGameIdentity, sameGameIdentity } from "./GameSession";
import {
  GRID_CYCLES,
  HARD_CYCLE_LENGTH,
  HARD_FIRST_WEEK,
  addUtcDays,
  getNextGridChange,
  getSecondsUntilNextGrid,
  getUtcMonday,
  selectScheduledGrid,
} from "./GridSchedule";

const hardGrids: IGridData[] = hardCatalog;
const normalGrids: IGridData[] = normalCatalog;
const mediumGrids: IGridData[] = mediumCatalog;

describe("the 130-week difficult puzzle cycle", () => {
  test("keeps all 130 scheduled entries without silently claiming 130 unique puzzles", () => {
    expect(hardGrids).toHaveLength(HARD_CYCLE_LENGTH);
    // Known content issue: entries 66–130 reuse exactly the 65 first puzzles.
    expect(new Set(hardGrids.map((grid) => grid.id)).size).toBe(65);
    expect(new Set(hardGrids.map((grid) => JSON.stringify(grid.words))).size).toBe(65);
    for (let index = 0; index < 65; index += 1) {
      expect(hardGrids[index + 65].id).toBe(hardGrids[index].id);
      expect(hardGrids[index + 65].words).toEqual(hardGrids[index].words);
    }
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

  test("never shows the same puzzle in two consecutive weeks", () => {
    for (let week = 0; week <= HARD_CYCLE_LENGTH; week += 1) {
      const today = addUtcDays(HARD_FIRST_WEEK, week * 7);
      const next = addUtcDays(today, 7);
      const currentGrid = selectScheduledGrid("hard", hardGrids, today).grid;
      const followingGrid = selectScheduledGrid("hard", hardGrids, next).grid;
      expect(currentGrid?.id).toBeDefined();
      expect(currentGrid?.id).not.toBe(followingGrid?.id);
    }
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

describe("Europe/Paris publication dates", () => {
  test("handles daylight saving changes without skipping or doubling weeks", () => {
    expect(getUtcMonday("2026-03-29")).toBe("2026-03-23");
    expect(getUtcMonday("2026-03-30")).toBe("2026-03-30");
    expect(getUtcMonday("2026-10-25")).toBe("2026-10-19");
    expect(getUtcMonday("2026-10-26")).toBe("2026-10-26");
    expect(getUtcMonday("2027-01-03")).toBe("2026-12-28");
    expect(getUtcMonday("2027-01-04")).toBe("2027-01-04");
  });

  test("rolls over on Monday at midnight Europe/Paris in summer", () => {
    const sunday = new Date("2027-09-05T21:59:59.000Z");
    const monday = new Date("2027-09-05T22:00:00.000Z");

    expect(getNextGridChange(sunday, true).toISOString())
      .toBe("2027-09-05T22:00:00.000Z");
    expect(getSecondsUntilNextGrid(sunday, true)).toBe(1);
    expect(getSecondsUntilNextGrid(monday, true)).toBe(7 * 24 * 3600);
    expect(getSecondsUntilNextGrid(monday, false)).toBe(24 * 3600);
  });

  test("recognizes the next day at midnight Europe/Paris in winter", () => {
    const before = new Date("2026-11-09T22:59:59.000Z");
    expect(getNextGridChange(before, false).toISOString())
      .toBe("2026-11-09T23:00:00.000Z");
    expect(getSecondsUntilNextGrid(before, false)).toBe(1);
  });

  test("recognizes the next day at midnight Europe/Paris in summer", () => {
    const before = new Date("2026-07-09T21:59:59.000Z");
    expect(getNextGridChange(before, false).toISOString())
      .toBe("2026-07-09T22:00:00.000Z");
    expect(getSecondsUntilNextGrid(before, false)).toBe(1);
  });
});

describe("daily grid rotation", () => {
  const cases = [
    {
      mode: "normal" as const,
      grids: normalGrids,
      finalDate: "2047-08-28",
      restartDate: "2047-08-29",
      unique: 8697,
    },
    {
      mode: "medium" as const,
      grids: mediumGrids,
      finalDate: "2031-10-03",
      restartDate: "2031-10-04",
      unique: 2890,
    },
  ];

  test.each(cases)(
    "cycles $mode after the last entry without losing any day",
    ({ mode, grids, finalDate, restartDate, unique }) => {
      const config = GRID_CYCLES[mode];
      expect(config.cadenceDays).toBe(1);
      expect(grids).toHaveLength(config.cycleLength);
      expect(new Set(grids.map((grid) => grid.id)).size).toBe(unique);

      const first = selectScheduledGrid(mode, grids, "2023-11-02");
      const last = selectScheduledGrid(mode, grids, finalDate);
      const restarted = selectScheduledGrid(mode, grids, restartDate);
      const second = selectScheduledGrid(mode, grids, addUtcDays(restartDate, 1));

      expect(first.grid).toBe(grids[0]);
      expect(last.grid).toBe(grids[grids.length - 1]);
      expect(restarted.grid).toBe(grids[0]);
      expect(second.grid).toBe(grids[1]);
      expect(restarted.periodStart).toBe(restartDate);
      expect(second.periodStart).toBe(addUtcDays(restartDate, 1));

      const originalIdentity = createGameIdentity(
        mode, first.periodStart, first.grid!
      );
      const repeatedIdentity = createGameIdentity(
        mode, restarted.periodStart, restarted.grid!
      );
      expect(sameGameIdentity(originalIdentity, repeatedIdentity)).toBe(false);
    }
  );

  test.each(cases)(
    "repeats $mode on subsequent complete cycles without date drift",
    ({ mode, grids }) => {
      const config = GRID_CYCLES[mode];
      const first = selectScheduledGrid(mode, grids, config.firstDate);
      for (const cycles of [1, 2, 5]) {
        const repeatDate = addUtcDays(
          config.firstDate,
          config.cycleLength * cycles
        );
        const replay = selectScheduledGrid(mode, grids, repeatDate);
        expect(replay.grid).toBe(first.grid);
        expect(replay.periodStart).toBe(repeatDate);
        expect(replay.periodStart).not.toBe(first.periodStart);
      }
    }
  );

  test("preserves the already published normal and medium assignments", () => {
    for (const day of ["2023-11-02", "2026-03-29", "2026-10-25", "2026-11-09"]) {
      expect(selectScheduledGrid("normal", normalGrids, day).grid)
        .toBe(normalGrids.find((grid) => grid.date === day));
      expect(selectScheduledGrid("medium", mediumGrids, day).grid)
        .toBe(mediumGrids.find((grid) => grid.date === day));
    }
  });

  test("keeps four historically mislabeled medium records playable", () => {
    for (let index = 0; index < 4; index += 1) {
      const day = addUtcDays("2023-11-02", index);
      expect(mediumGrids[index].type).toBe("normal");
      expect(selectScheduledGrid("medium", mediumGrids, day).grid)
        .toBe(mediumGrids[index]);
      const replayDate = addUtcDays(day, mediumGrids.length);
      expect(selectScheduledGrid("medium", mediumGrids, replayDate).grid)
        .toBe(mediumGrids[index]);
    }
  });

  test("does not serve a puzzle before the first publication date", () => {
    for (const { mode, grids } of cases) {
      expect(selectScheduledGrid(mode, grids, "2023-11-01")).toEqual({
        periodStart: "2023-11-01",
        grid: undefined,
      });
    }
  });

  test("rejects missing, truncated or corrupted daily catalogs", () => {
    expect(selectScheduledGrid("normal", [], "2047-08-29").grid).toBeUndefined();
    expect(
      selectScheduledGrid("normal", normalGrids.slice(0, -1), "2047-08-29").grid
    ).toBeUndefined();

    const missingWords = [...normalGrids];
    missingWords[0] = { ...missingWords[0], words: [] };
    expect(selectScheduledGrid("normal", missingWords, "2047-08-29").grid)
      .toBeUndefined();

    const corruptedDate = [...mediumGrids];
    corruptedDate[0] = { ...corruptedDate[0], date: "2023-11-03" };
    expect(selectScheduledGrid("medium", corruptedDate, "2031-10-04").grid)
      .toBeUndefined();
  });
});

describe("explicitly unavailable grids", () => {

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
