"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  DAY_MS,
  GRID_CALENDARS,
  parseUtcDate,
  addDaysUtc,
  validateCalendar,
} = require("./grid-calendar.cjs");

// Treat the existing array order (not its dates) as the puzzle publication order.
// The default is a dry run; --write is required to update the files.
function prepareCalendar(filePath, config) {
  const source = fs.readFileSync(filePath, "utf8");
  const grids = JSON.parse(source);
  if (!Array.isArray(grids) || grids.length === 0) {
    throw new Error(`Empty or invalid calendar: ${filePath}`);
  }

  for (let index = 0; index < grids.length; index += 1) {
    const actual = grids[index]?.date;
    const expected = addDaysUtc(config.start, index * config.cadenceDays);
    const skewDays = (parseUtcDate(expected) - parseUtcDate(actual)) / DAY_MS;

    if (skewDays < 0 || skewDays > 2) {
      throw new Error(
        `Unexpected puzzle order/date at #${index + 1} in ${filePath}: ${actual} vs ${expected}`
      );
    }
    if (index > 0 && grids[index - 1].date > actual) {
      throw new Error(`Dates out of order at #${index + 1} in ${filePath}`);
    }
  }

  let index = 0;
  let changed = 0;
  const updated = source.replace(
    /("date"\s*:\s*")(\d{4}-\d{2}-\d{2})(")/g,
    (_, prefix, oldDate, suffix) => {
      if (grids[index]?.date !== oldDate) {
        throw new Error(`Unexpected date field at #${index + 1} in ${filePath}`);
      }
      const expected = addDaysUtc(config.start, index * config.cadenceDays);
      index += 1;
      if (expected !== oldDate) changed += 1;
      return `${prefix}${expected}${suffix}`;
    }
  );

  if (index !== grids.length) {
    throw new Error(`Expected ${grids.length} date fields, found ${index} in ${filePath}`);
  }

  const errors = validateCalendar(JSON.parse(updated), config);
  if (errors.length > 0) {
    throw new Error(`Reindexed calendar is invalid: ${errors.slice(0, 5).join("; ")}`);
  }

  return { filePath, content: updated, changed, count: grids.length };
}

function main(args = process.argv.slice(2)) {
  if (args.some((arg) => arg !== "--write")) {
    throw new Error("Usage: node scripts/reindex-grid-dates.cjs [--write]");
  }

  const root = path.resolve(__dirname, "..");
  // Validate every calendar before modifying any of them.
  const prepared = Object.values(GRID_CALENDARS).map((config) =>
    prepareCalendar(path.join(root, config.file), config)
  );

  if (args.includes("--write")) {
    for (const item of prepared) {
      if (item.changed > 0) fs.writeFileSync(item.filePath, item.content, "utf8");
    }
  }

  for (const item of prepared) {
    console.log(
      `${args.includes("--write") ? "Updated" : "Would update"} ${path.relative(root, item.filePath)}: ${item.changed}/${item.count} dates`
    );
  }
  if (!args.includes("--write")) console.log("Dry run only. Pass --write to apply.");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { prepareCalendar };
