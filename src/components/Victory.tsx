import { useState, useEffect, useCallback } from "react";
import CountDown from "./CountDown";
import { HiStar } from "react-icons/hi2";

const MOVE_FACTOR = 1.25;

function Victory({
  minMoves,
  weekly = false,
  remainingMoves,
}: {
  minMoves: number;
  weekly?: boolean;
  remainingMoves: number;
}) {
  const maxMoves = Math.ceil(minMoves * MOVE_FACTOR);
  const [victoryMessage, setVictoryMessage] = useState<{
    message: string;
    messageAlt: string;
    stars: JSX.Element[];
  }>();

  // RETOURNER UN MESSAGE EN FONCTION DU NOMBRE DE COUPS RESTANTS
  const getVictoryMessage = useCallback(() => {
    if (remainingMoves > maxMoves - minMoves) {
      setVictoryMessage({
        message: "WOW !!!",
        messageAlt: "Ton point faible : trop fort !",
        stars: [<HiStar />, <HiStar />, <HiStar />],
      });
    } else if (remainingMoves < maxMoves - minMoves) {
      setVictoryMessage({
        message: "Pas mal !",
        messageAlt: "Tu peux mieux faire",
        stars: [<HiStar />, <HiStar />],
      });
    } else if (remainingMoves < (maxMoves - minMoves) / 2) {
      setVictoryMessage({
        message: "Piouu !",
        messageAlt: "C'était limite !",
        stars: [<HiStar />],
      });
    }
  }, [remainingMoves, maxMoves, minMoves]);

  useEffect(() => {
    getVictoryMessage();
  }, [getVictoryMessage]);

  return (
    <div className="w-full md:w-4/5 2xl:w-[70%] p-4 theme-lmnt grid grid-cols-3 gap-4 md:rounded-md">
      <div className="flex flex-col items-center gap-4 max-h-24 md:max-h-32">
        <img
          className="max-h-full animate-bounce"
          src="https://ucarecdn.com/5020ce0f-690e-4c79-9e5c-6e40ee9ac4e6/-/preview/500x500/-/quality/smart/-/format/auto/"
          alt="Une gaufre joyeuse"
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3 className="uppercase theme-text-accent md:text-lg text-center mb-1">
          {victoryMessage?.message}
        </h3>
        <span className="text-center text-sm mb-1">
          {victoryMessage?.messageAlt}
        </span>

        <span className="flex items-center justify-center text-3xl text-almostValid">
          {victoryMessage?.stars.map((star, index) => (
            <span key={index}>{star}</span>
          ))}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <CountDown weekly={weekly} />
      </div>
    </div>
  );
}

export default Victory;
