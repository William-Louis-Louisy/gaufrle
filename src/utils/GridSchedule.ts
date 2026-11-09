import { IGridData } from "../types/GameGrid";
import { GameMode } from "./GameSession";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export const HARD_FIRST_WEEK = "2025-03-10";
export const HARD_CYCLE_LENGTH = 130;

export interface ScheduledGrid {
  periodStart: string;
  grid: IGridData | undefined;
}

function parseUtcDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Expected a YYYY-MM-DD UTC date");
  }

  const timestamp = Date.parse(value + "T00:00:00.000Z");
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new Error("Invalid calendar date");
  }
  return timestamp;
}

export function getUtcDate(now: Date): string {
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid clock date");
  return now.toISOString().slice(0, 10);
}

export function getUtcMonday(date: string): string {
  const timestamp = parseUtcDate(date);
  const day = new Date(timestamp).getUTCDay();
  const daysSinceMonday = (day + 6) % 7;

  return new Date(timestamp - daysSinceMonday * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function addUtcDays(date: string, days: number): string {
  if (!Number.isInteger(days)) throw new Error("Expected whole days");
  return new Date(parseUtcDate(date) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * The published date identifies a period, not the puzzle itself.
 * Normal/medium keep the original date catalog; hard cycles through the
 * FIRST 130 entries in their published order, starting 2025-03-10.
 * Data warning: these 130 entries contain only 65 unique puzzles (the second
 * half duplicates the first). Keep the requested 130-week schedule unchanged
 * until the content catalog is explicitly expanded or revised.
 */
export function selectScheduledGrid(
  mode: GameMode,
  grids: readonly IGridData[],
  todayUtc: string
): ScheduledGrid {
  parseUtcDate(todayUtc);
  const periodStart = mode === "hard" ? getUtcMonday(todayUtc) : todayUtc;

  if (!Array.isArray(grids) || grids.length === 0) {
    return { periodStart, grid: undefined };
  }

  if (mode !== "hard") {
    const grid = grids.find((candidate) => candidate?.date === periodStart);
    return {
      periodStart,
      grid:
        grid &&
        typeof grid.id === "string" &&
        Array.isArray(grid.words) &&
        grid.words.length === 6
          ? grid
          : undefined,
    };
  }

  const weekIndex = Math.floor(
    (parseUtcDate(periodStart) - parseUtcDate(HARD_FIRST_WEEK)) / WEEK_MS
  );
  if (
    weekIndex < 0 ||
    grids.length < HARD_CYCLE_LENGTH ||
    grids[0]?.date !== HARD_FIRST_WEEK
  ) {
    return { periodStart, grid: undefined };
  }

  const grid = grids[weekIndex % HARD_CYCLE_LENGTH];
  if (
    !grid ||
    typeof grid.id !== "string" ||
    grid.type !== "hard" ||
    !Array.isArray(grid.words) ||
    grid.words.length !== 8
  ) {
    return { periodStart, grid: undefined };
  }

  return { periodStart, grid };
}

export function getNextGridChangeUtc(now: Date, weekly: boolean): Date {
  const todayUtc = getUtcDate(now);
  const nextDate = weekly
    ? addUtcDays(getUtcMonday(todayUtc), 7)
    : addUtcDays(todayUtc, 1);

  return new Date(parseUtcDate(nextDate));
}

export function getSecondsUntilNextGrid(now: Date, weekly: boolean): number {
  return Math.max(
    0,
    Math.ceil((getNextGridChangeUtc(now, weekly).getTime() - now.getTime()) / 1000)
  );
}
