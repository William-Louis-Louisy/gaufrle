import React, { useEffect, useState } from "react";

function CountDown() {
  const [timeUntilNextGrid, setTimeUntilNextGrid] = useState<number>(0);

  useEffect(() => {
    // Obtenez la date et l'heure actuelles
    const now = new Date();

    // Définissez l'heure à laquelle la prochaine grille sera disponible
    // Par exemple, tous les jours à minuit
    const nextGridDate = new Date(now);
    nextGridDate.setDate(nextGridDate.getDate() + 1);
    nextGridDate.setHours(0, 0, 0, 0);

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
  }, []);

  const hours = Math.floor(timeUntilNextGrid / 3600);
  const minutes = Math.floor((timeUntilNextGrid % 3600) / 60);
  const seconds = timeUntilNextGrid % 60;

  return (
    <div>
      <div className="italic">
        Prochaine gaufre dans :{" "}
        <span className="not-italic">
          {hours}h {minutes}m {seconds}s
        </span>
      </div>
    </div>
  );
}

export default CountDown;
