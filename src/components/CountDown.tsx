import React, { useEffect, useState } from "react";

function CountDown({ weekly = false }: { weekly?: boolean }) {
  const [timeUntilNextGrid, setTimeUntilNextGrid] = useState<number>(0);

  useEffect(() => {
    // Obtenez la date et l'heure actuelles
    const now = new Date();

    const nextGridDate = new Date(now);
    if (!weekly) {
      nextGridDate.setDate(nextGridDate.getDate() + 1);
      nextGridDate.setHours(0, 0, 0, 0);
    } else {
      //calculez le temps jusqu'au prochain lundi
      const daysUntilNextMonday = 8 - now.getDay();
      nextGridDate.setDate(nextGridDate.getDate() + daysUntilNextMonday);
      nextGridDate.setHours(0, 0, 0, 0);
    }

    // Calculez le temps en secondes jusqu'à la prochaine grille
    const timeUntilNext = Math.floor(
      (nextGridDate.getTime() - now.getTime()) / 1000
    );

    setTimeUntilNextGrid(timeUntilNext);

    // Mettez à jour le décompte chaque seconde
    const intervalId = setInterval(() => {
      setTimeUntilNextGrid((prevTime) => prevTime - 1);
    }, 1000);

    // N'oubliez pas de nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(intervalId);
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
