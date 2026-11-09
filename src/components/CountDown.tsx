import { useEffect, useState } from "react";
import { getSecondsUntilNextGrid } from "../utils/GridSchedule";

function CountDown({ weekly = false }: { weekly?: boolean }) {
  const [timeUntilNextGrid, setTimeUntilNextGrid] = useState(() =>
    getSecondsUntilNextGrid(new Date(), weekly)
  );

  useEffect(() => {
    const update = () => {
      setTimeUntilNextGrid(getSecondsUntilNextGrid(new Date(), weekly));
    };

    update();
    const intervalId = window.setInterval(update, 1000);

    return () => window.clearInterval(intervalId);
  }, [weekly]);

  const hours = Math.floor(timeUntilNextGrid / 3600);
  const minutes = Math.floor((timeUntilNextGrid % 3600) / 60);
  const seconds = timeUntilNextGrid % 60;

  return (
    <div className="flex flex-col">
      <div className="italic text-sm md:text-base">Prochaine gaufre dans :</div>
      <span className="not-italic font-semibold md:text-xl">
        {hours}h {minutes}m {seconds}s
      </span>
    </div>
  );
}

export default CountDown;
