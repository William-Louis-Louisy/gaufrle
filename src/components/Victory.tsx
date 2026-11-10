import CountDown from "./CountDown";
import { HiStar } from "react-icons/hi2";
import type { StarRating, VictoryScore } from "../utils/Scoring";

interface VictoryProps {
  score: VictoryScore;
  weekly?: boolean;
}

const VICTORY_MESSAGES: Record<StarRating, { message: string; messageAlt: string }> = {
  3: {
    message: "WOW !!!",
    messageAlt: "Ton point faible : trop fort !",
  },
  2: {
    message: "Pas mal !",
    messageAlt: "Tu peux mieux faire",
  },
  1: {
    message: "Piouu !",
    messageAlt: "C'était limite !",
  },
};

/**
 * Presentation only: the rating is derived from the authoritative session
 * state in useGameSession, not recalculated with a different move factor.
 */
export default function Victory({ score, weekly = false }: VictoryProps) {
  const { message, messageAlt } = VICTORY_MESSAGES[score.stars];

  return (
    <div className="w-full md:w-4/5 2xl:w-[70%] p-4 theme-lmnt grid grid-cols-3 gap-4 md:rounded-md">
      <div className="flex flex-col items-center gap-4 max-h-24 md:max-h-32">
        <img
          className="max-h-full animate-bounce"
          src="/images/victory.webp"
          alt="Une gaufre joyeuse"
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3 className="uppercase theme-text-accent md:text-lg text-center mb-1">
          {message}
        </h3>
        <span className="text-center text-sm mb-1">
          {messageAlt}
        </span>
        <span className="text-center text-xs mb-1">
          {score.movesUsed} / {score.moveLimit} mouvements
        </span>
        <span
          className="flex items-center justify-center text-3xl text-almostValid"
          role="img"
          aria-label={`${score.stars} étoile${score.stars > 1 ? "s" : ""} sur 3`}
        >
          {Array.from({ length: score.stars }, (_, index) => (
            <HiStar key={index} aria-hidden="true" />
          ))}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <CountDown weekly={weekly} />
      </div>
    </div>
  );
}
