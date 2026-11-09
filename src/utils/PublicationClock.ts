/**
 * The app publishes exactly one daily puzzle at 00:00 Europe/Paris, or
 * one weekly puzzle on Monday at 00:00 Europe/Paris.
 *
 * Never use the visitor's system timezone or the UTC calendar day for
 * publication decisions. Intl supplies IANA daylight-saving rules.
 */
export const PUBLICATION_TIME_ZONE = "Europe/Paris";

const parisFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: PUBLICATION_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

interface PublicationDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getParisParts(instant: Date): PublicationDateTime {
  if (!Number.isFinite(instant.getTime())) {
    throw new Error("Invalid instant");
  }

  const parts = parisFormatter.formatToParts(instant);
  const read = (type: string): number => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) throw new Error("Missing time-zone date component: " + type);
    return Number(value);
  };

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

function isoDate({ year, month, day }: PublicationDateTime): string {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

/** Calendar day in France at the given actual instant (independent of device TZ). */
export function getPublicationDate(instant: Date): string {
  return isoDate(getParisParts(instant));
}

/** Get the time-zone offset at a real instant, in milliseconds. */
function getParisOffsetMs(instant: Date): number {
  const { year, month, day, hour, minute, second } = getParisParts(instant);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const instantWithoutMilliseconds = Math.floor(instant.getTime() / 1000) * 1000;

  return wallClockAsUtc - instantWithoutMilliseconds;
}

/**
 * Find the real UTC instant corresponding to 00:00 Europe/Paris on an ISO day.
 * Offset iteration is important: a midnight calculated using the offset at
 * UTC noon is wrong on days when DST starts or ends.
 *
 * Midnight in Paris is neither skipped nor ambiguous under modern DST rules.
 */
export function getPublicationMidnight(date: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Expected an ISO calendar date");
  }

  const midnightAsUtc = Date.parse(date + "T00:00:00.000Z");
  if (
    !Number.isFinite(midnightAsUtc) ||
    new Date(midnightAsUtc).toISOString().slice(0, 10) !== date
  ) {
    throw new Error("Invalid ISO calendar date");
  }

  let candidate = midnightAsUtc - 60 * 60 * 1000;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const corrected = midnightAsUtc - getParisOffsetMs(new Date(candidate));
    if (corrected === candidate) {
      const parts = getParisParts(new Date(candidate));
      if (
        isoDate(parts) === date &&
        parts.hour === 0 &&
        parts.minute === 0 &&
        parts.second === 0
      ) {
        return new Date(candidate);
      }
      break;
    }
    candidate = corrected;
  }

  throw new Error("Could not resolve midnight in Europe/Paris");
}
