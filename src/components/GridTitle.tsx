import React from "react";
import { getMonday, getSunday } from "../utils/WeeklyGrid";

function GridTitle({ gridType }: { gridType: "normal" | "medium" | "hard" }) {
  const today = new Date();
  // Dates du lundi et du dimanche de la semaine actuelle
  const currentMonday = getMonday(today);
  const currentSunday = getSunday(today);

  // Handle grid title
  const handleGridType = (gridType: "normal" | "medium" | "hard") => {
    switch (gridType) {
      case "normal":
        return "Gaufrette du jour";
      case "medium":
        return "Gauf' au suc' du jour";
      case "hard":
        return "Gaufre salée de la semaine";
    }
  };

  // Handle date display
  const handleDate = (gridType: "normal" | "medium" | "hard") => {
    if (gridType === "normal" || gridType === "medium") {
      return `du ${today.toLocaleDateString("fr-FR")}`;
    } else {
      return `du ${currentMonday.toLocaleDateString(
        "fr-FR"
      )} au ${currentSunday.toLocaleDateString("fr-FR")}`;
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:gap-4 theme-text-accent">
      <span className="font-semibold uppercase text-lg">
        {handleGridType(gridType)}
      </span>
      <span>{handleDate(gridType)}</span>
    </div>
  );
}

export default GridTitle;
