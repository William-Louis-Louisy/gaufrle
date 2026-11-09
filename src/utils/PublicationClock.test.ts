import {
  PUBLICATION_TIME_ZONE,
  getPublicationDate,
  getPublicationMidnight,
} from "./PublicationClock";
import { getNextGridChange, getSecondsUntilNextGrid, selectScheduledGrid } from "./GridSchedule";
import { IGridData } from "../types/GameGrid";

const hardGrids: IGridData[] = require("../jsons/HardGridList.json");
const normalGrids: IGridData[] = require("../jsons/NormalGridList.json");
const mediumGrids: IGridData[] = require("../jsons/MediumGridList.json");

describe("publication clock is always Europe/Paris", () => {
  test("explicitly uses the IANA time zone, not the visitor's locale", () => {
    expect(PUBLICATION_TIME_ZONE).toBe("Europe/Paris");

    expect(getPublicationDate(new Date("2026-11-09T22:59:59.000Z")))
      .toBe("2026-11-09");
    expect(getPublicationDate(new Date("2026-11-09T23:00:00.000Z")))
      .toBe("2026-11-10");
    expect(getPublicationDate(new Date("2026-07-09T21:59:59.000Z")))
      .toBe("2026-07-09");
    expect(getPublicationDate(new Date("2026-07-09T22:00:00.000Z")))
      .toBe("2026-07-10");
  });

  test.each([
    ["2026-01-10", "2026-01-09T23:00:00.000Z"],
    ["2026-07-10", "2026-07-09T22:00:00.000Z"],
    ["2026-03-29", "2026-03-28T23:00:00.000Z"],
    ["2026-03-30", "2026-03-29T22:00:00.000Z"],
    ["2026-10-25", "2026-10-24T22:00:00.000Z"],
    ["2026-10-26", "2026-10-25T23:00:00.000Z"],
    ["2027-09-06", "2027-09-05T22:00:00.000Z"],
  ])("resolves Paris midnight on %s to %s", (date, expectedInstant) => {
    const instant = getPublicationMidnight(date);
    expect(instant.toISOString()).toBe(expectedInstant);
    expect(getPublicationDate(instant)).toBe(date);
  });

  test("rejects invalid dates and invalid instants", () => {
    expect(() => getPublicationMidnight("2026-02-30")).toThrow(
      "Invalid ISO calendar date"
    );
    expect(() => getPublicationMidnight("2026/02/03")).toThrow(
      "Expected an ISO calendar date"
    );
    expect(() => getPublicationDate(new Date(NaN))).toThrow("Invalid instant");
  });

  test.each([
    {
      date: "2026-03-28T22:59:59.000Z",
      next: "2026-03-28T23:00:00.000Z",
      remaining: 1,
    },
    {
      date: "2026-03-29T21:59:59.000Z",
      next: "2026-03-29T22:00:00.000Z",
      remaining: 1,
    },
    {
      date: "2026-10-24T21:59:59.000Z",
      next: "2026-10-24T22:00:00.000Z",
      remaining: 1,
    },
    {
      date: "2026-10-25T22:59:59.000Z",
      next: "2026-10-25T23:00:00.000Z",
      remaining: 1,
    },
  ])("publishes daily at Paris midnight across DST boundary $date", ({ date, next, remaining }) => {
    const now = new Date(date);
    expect(getNextGridChange(now, false).toISOString()).toBe(next);
    expect(getSecondsUntilNextGrid(now, false)).toBe(remaining);
  });

  test("a day lasts 23 or 25 hours through DST, not always 24h", () => {
    expect(getSecondsUntilNextGrid(new Date("2026-03-28T23:00:00.000Z"), false))
      .toBe(23 * 3600);
    expect(getSecondsUntilNextGrid(new Date("2026-10-24T22:00:00.000Z"), false))
      .toBe(25 * 3600);
  });

  test("the weekly countdown can last 167 or 169 hours across DST", () => {
    expect(getNextGridChange(new Date("2026-03-22T23:00:00.000Z"), true).toISOString())
      .toBe("2026-03-29T22:00:00.000Z");
    expect(getSecondsUntilNextGrid(new Date("2026-03-22T23:00:00.000Z"), true))
      .toBe(167 * 3600);

    expect(getNextGridChange(new Date("2026-10-18T22:00:00.000Z"), true).toISOString())
      .toBe("2026-10-25T23:00:00.000Z");
    expect(getSecondsUntilNextGrid(new Date("2026-10-18T22:00:00.000Z"), true))
      .toBe(169 * 3600);
  });

  test("weekly renewal is Monday midnight in Paris, even for a UTC-Sunday instant", () => {
    const before = new Date("2027-09-05T21:59:59.000Z");
    const after = new Date("2027-09-05T22:00:00.000Z");

    expect(getNextGridChange(before, true).toISOString())
      .toBe("2027-09-05T22:00:00.000Z");
    expect(getSecondsUntilNextGrid(before, true)).toBe(1);

    const beforeSelection = selectScheduledGrid(
      "hard",
      hardGrids,
      getPublicationDate(before)
    );
    const afterSelection = selectScheduledGrid(
      "hard",
      hardGrids,
      getPublicationDate(after)
    );

    expect(beforeSelection.periodStart).toBe("2027-08-30");
    expect(beforeSelection.grid).toBe(hardGrids[129]);
    expect(afterSelection.periodStart).toBe("2027-09-06");
    expect(afterSelection.grid).toBe(hardGrids[0]);
  });

  test.each([
    { mode: "normal" as const, grids: normalGrids },
    { mode: "medium" as const, grids: mediumGrids },
  ])("daily $mode mode changes at Paris midnight, not UTC midnight", ({ mode, grids }) => {
    const before = selectScheduledGrid(
      mode,
      grids,
      getPublicationDate(new Date("2026-11-09T22:59:59.000Z"))
    );
    const after = selectScheduledGrid(
      mode,
      grids,
      getPublicationDate(new Date("2026-11-09T23:00:00.000Z"))
    );

    expect(before.periodStart).toBe("2026-11-09");
    expect(after.periodStart).toBe("2026-11-10");
    expect(before.grid?.id).not.toBe(after.grid?.id);
  });
});
