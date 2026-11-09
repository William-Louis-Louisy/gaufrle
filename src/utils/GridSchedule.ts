import { IGridData } from "../types/GameGrid";
import { GameMode } from "./GameSession";
import { getPublicationDate, getPublicationMidnight } from "./PublicationClock";

const DAY_MS = 24 * 60 * 60 * 1000;

export const HARD_FIRST_WEEK = "2025-03-10";
export const HARD_CYCLE_LENGTH = 130;

interface GridCycleConfig {
  firstDate: string;
  cadenceDays: 1 | 7;
  cycleLength: number;
  wordCount: number;
}

/**
 * Fixed cycle lengths preserve historical puzzle assignments. Future catalog
 * extensions must update this configuration deliberately, not silently change
 * the modulo (and therefore the puzzle shown on any given date).
 */
export const GRID_CYCLES: Readonly<Record<GameMode, Readonly<GridCycleConfig>>> = {
  normal: {
    firstDate: "2023-11-02",
    cadenceDays: 1,
    cycleLength: 8701,
    wordCount: 6,
  },
  medium: {
    firstDate: "2023-11-02",
    cadenceDays: 1,
    cycleLength: 2893,
    wordCount: 6,
  },
  hard: {
    firstDate: HARD_FIRST_WEEK,
    cadenceDays: 7,
    cycleLength: HARD_CYCLE_LENGTH,
    wordCount: 8,
  },
};

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

// Calendar-only computations use UTC arithmetic to avoid any local DST drift.
// Publication instants are resolved separately by PublicationClock.

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
 * The period identifies a specific play session, independent of the original
 * publication date of its puzzle. All three modes cycle through their fixed
 * catalog in order, with a distinct session identity at every recurrence.
 *
 * Known content limitation: hard has 130 published entries but only 65
 * distinct puzzles; positions 65..129 duplicate 0..64. Preserve the existing
 * 130-entry schedule until the catalog is explicitly curated.
 */
export function selectScheduledGrid(
  mode: GameMode,
  grids: readonly IGridData[],
  todayUtc: string
): ScheduledGrid {
  const todayTimestamp = parseUtcDate(todayUtc);
  const config = GRID_CYCLES[mode];
  const periodStart = config.cadenceDays === 7
    ? getUtcMonday(todayUtc)
    : todayUtc;

  const elapsedPeriods = Math.floor(
    (parseUtcDate(periodStart) - parseUtcDate(config.firstDate)) /
      (config.cadenceDays * DAY_MS)
  );

  if (
    todayTimestamp < parseUtcDate(config.firstDate) ||
    elapsedPeriods < 0 ||
    !Array.isArray(grids) ||
    grids.length < config.cycleLength ||
    grids[0]?.date !== config.firstDate
  ) {
    return { periodStart, grid: undefined };
  }

  const index = elapsedPeriods % config.cycleLength;
  const grid: IGridData | undefined = grids[index];

  // Four pre-existing medium catalog records (indices 0..3) are mislabeled
  // "normal" despite containing medium puzzles. Keep them playable without
  // changing the historical content or their existing session identities.
  const compatibleType =
    grid?.type === mode ||
    (mode === "medium" && index < 4 && grid?.type === "normal");

  // Avoid serving a wrong puzzle if a catalog is truncated, reordered or
  // unexpectedly modified. These checks are cheap and run on one entry only.
  if (
    !grid ||
    !compatibleType ||
    typeof grid.id !== "string" ||
    !grid.id ||
    grid.date !== addUtcDays(config.firstDate, index * config.cadenceDays) ||
    !Array.isArray(grid.words) ||
    grid.words.length !== config.wordCount ||
    !grid.words.every((word) => typeof word === "string" && word.length > 0)
  ) {
    return { periodStart, grid: undefined };
  }

  return { periodStart, grid };
}

/**
 * Real instant of the next publication: 00:00 Europe/Paris (Monday if weekly).
 * ISO calendar arithmetic deliberately stays independent of device timezone.
 */
export function getNextGridChange(now: Date, weekly: boolean): Date {
  const publicationDate = getPublicationDate(now);
  const nextDate = weekly
    ? addUtcDays(getUtcMonday(publicationDate), 7)
    : addUtcDays(publicationDate, 1);

  return getPublicationMidnight(nextDate);
}

export function getSecondsUntilNextGrid(now: Date, weekly: boolean): number {
  return Math.max(
    0,
    Math.ceil((getNextGridChange(now, weekly).getTime() - now.getTime()) / 1000)
  );
}
