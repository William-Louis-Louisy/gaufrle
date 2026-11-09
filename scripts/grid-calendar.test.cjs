"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { addDaysUtc, parseUtcDate, validateCalendar } = require("./grid-calendar.cjs");

test("dates are consecutive across the spring and autumn clock changes", () => {
  assert.deepEqual(
    Array.from({ length: 4 }, (_, index) => addDaysUtc("2026-03-28", index)),
    ["2026-03-28", "2026-03-29", "2026-03-30", "2026-03-31"]
  );
  assert.deepEqual(
    Array.from({ length: 4 }, (_, index) => addDaysUtc("2026-10-24", index)),
    ["2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27"]
  );
});

test("weekly dates use consecutive Mondays throughout DST", () => {
  const dates = Array.from({ length: 4 }, (_, index) =>
    addDaysUtc("2026-03-23", index * 7)
  );
  assert.deepEqual(dates, [
    "2026-03-23",
    "2026-03-30",
    "2026-04-06",
    "2026-04-13",
  ]);
  assert.deepEqual(
    validateCalendar(
      dates.map((date) => ({ date })),
      { start: "2026-03-23", end: "2026-04-13", cadenceDays: 7 }
    ),
    []
  );
});

test("detects duplicated and missing daily dates", () => {
  const errors = validateCalendar(
    ["2026-03-28", "2026-03-29", "2026-03-29", "2026-03-31"].map(
      (date) => ({ date })
    ),
    { start: "2026-03-28", end: "2026-03-31", cadenceDays: 1 }
  );

  assert.ok(errors.some((error) => error.includes("Duplicate date")));
  assert.ok(errors.some((error) => error.includes("expected 2026-03-30")));
});

test("detects missing weeks and weekly dates that are not Mondays", () => {
  const errors = validateCalendar(
    [{ date: "2025-10-13" }, { date: "2025-10-27" }, { date: "2025-11-02" }],
    { start: "2025-10-13", end: "2025-10-27", cadenceDays: 7 }
  );

  assert.ok(errors.some((error) => error.includes("expected 2025-10-20")));
  assert.ok(errors.some((error) => error.includes("must be a Monday")));
});

test("rejects nonexistent calendar dates and unexpected truncation", () => {
  assert.throws(() => parseUtcDate("2026-02-30"), /Nonexistent/);
  assert.throws(() => parseUtcDate("2026/02/28"), /Invalid ISO/);
  const errors = validateCalendar(
    [{ date: "2026-11-09" }],
    { start: "2026-11-09", end: "2026-11-10", cadenceDays: 1 }
  );
  assert.ok(errors.some((error) => error.includes("Unexpected calendar coverage")));
});
