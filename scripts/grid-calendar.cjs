"use strict";

const DAY_MS = 24 * 60 * 60 * 1000;

// The first puzzle and expected horizon are intentionally explicit.
// Update "end" when new puzzles are appended to a calendar.
const GRID_CALENDARS = Object.freeze({
  normal: Object.freeze({
    file: "src/jsons/NormalGridList.json",
    start: "2023-11-02",
    end: "2047-08-28",
    cadenceDays: 1,
  }),
  medium: Object.freeze({
    file: "src/jsons/MediumGridList.json",
    start: "2023-11-02",
    end: "2031-10-03",
    cadenceDays: 1,
  }),
  hard: Object.freeze({
    file: "src/jsons/HardGridList.json",
    start: "2025-03-10",
    end: "2027-08-30",
    cadenceDays: 7,
  }),
});

function parseUtcDate(isoDate) {
  if (typeof isoDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new Error(`Invalid ISO date: ${String(isoDate)}`);
  }

  const timestamp = Date.parse(`${isoDate}T00:00:00.000Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== isoDate
  ) {
    throw new Error(`Nonexistent calendar date: ${isoDate}`);
  }

  return timestamp;
}

// Always calculate calendar dates in UTC, never by adding days to local time.
function addDaysUtc(isoDate, days) {
  if (!Number.isInteger(days)) {
    throw new Error("The number of days must be an integer");
  }

  return new Date(parseUtcDate(isoDate) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function validateCalendar(grids, { start, end, cadenceDays }) {
  if (!Array.isArray(grids) || grids.length === 0) {
    return ["The calendar must contain at least one grid"];
  }

  const errors = [];
  const seen = new Map();

  for (let index = 0; index < grids.length; index += 1) {
    const date = grids[index]?.date;

    try {
      const timestamp = parseUtcDate(date);
      const expected = addDaysUtc(start, index * cadenceDays);

      if (seen.has(date)) {
        errors.push(
          `Duplicate date ${date} at #${index + 1} (already at #${seen.get(date) + 1})`
        );
      }
      seen.set(date, index);

      if (date !== expected) {
        errors.push(`Grid #${index + 1}: expected ${expected}, received ${date}`);
      }

      if (cadenceDays === 7 && new Date(timestamp).getUTCDay() !== 1) {
        errors.push(`Grid #${index + 1}: weekly date ${date} must be a Monday`);
      }
    } catch (error) {
      errors.push(`Grid #${index + 1}: ${error.message}`);
    }
  }

  const lastExpected = addDaysUtc(start, (grids.length - 1) * cadenceDays);
  if (lastExpected !== end) {
    errors.push(
      `Unexpected calendar coverage: ${grids.length} grids end on ${lastExpected}, expected ${end}`
    );
  }

  return errors;
}

module.exports = { DAY_MS, GRID_CALENDARS, parseUtcDate, addDaysUtc, validateCalendar };
