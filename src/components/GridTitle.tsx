import { addUtcDays, getUtcMonday } from "../utils/GridSchedule";
import { getPublicationDate } from "../utils/PublicationClock";
import { GameMode } from "../utils/GameSession";

interface GridTitleProps {
  gridType: GameMode;
  periodStart?: string;
}

const formatDate = (date: string): string =>
  new Date(date + "T00:00:00.000Z").toLocaleDateString("fr-FR", {
    timeZone: "UTC",
  });

function GridTitle({ gridType, periodStart }: GridTitleProps) {
  const today = periodStart ?? getPublicationDate(new Date());
  const monday = getUtcMonday(today);
  const sunday = addUtcDays(monday, 6);

  const title =
    gridType === "normal"
      ? "Gaufrette du jour"
      : gridType === "medium"
        ? "Gauf' au suc' du jour"
        : "Gaufre salée de la semaine";

  const dates =
    gridType === "hard"
      ? `du ${formatDate(monday)} au ${formatDate(sunday)}`
      : `du ${formatDate(today)}`;

  return (
    <div className="flex flex-col md:flex-row items-center md:gap-4 theme-text-accent">
      <span className="font-semibold uppercase text-lg">{title}</span>
      <span>{dates}</span>
    </div>
  );
}

export default GridTitle;
