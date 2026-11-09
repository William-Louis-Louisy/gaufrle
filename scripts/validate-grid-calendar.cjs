"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { GRID_CALENDARS, validateCalendar } = require("./grid-calendar.cjs");

function validateAllCalendars(root = path.resolve(__dirname, "..")) {
  let failed = false;

  for (const [mode, config] of Object.entries(GRID_CALENDARS)) {
    try {
      const grids = JSON.parse(
        fs.readFileSync(path.join(root, config.file), "utf8")
      );
      const errors = validateCalendar(grids, config);

      if (errors.length > 0) {
        failed = true;
        console.error(
          `FAIL ${mode}: ${errors.length} calendar issue(s):\n` +
            errors.slice(0, 20).map((error) => `  - ${error}`).join("\n")
        );
        if (errors.length > 20) console.error("  ... additional errors omitted");
      } else {
        console.log(
          `OK ${mode}: ${grids.length} grids, ${config.start} to ${config.end}, every ${config.cadenceDays} day(s)`
        );
      }
    } catch (error) {
      failed = true;
      console.error(`FAIL ${mode}: ${error.message}`);
    }
  }

  return failed ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = validateAllCalendars();
}

module.exports = { validateAllCalendars };
