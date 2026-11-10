import React from "react";
import CountDown from "./CountDown";

function GameOver({ weekly = false }: { weekly?: boolean }) {
  return (
    <div className="w-full md:w-4/5 2xl:w-[70%] p-4 theme-lmnt grid grid-cols-3 gap-4 md:rounded-md">
      <div className="flex flex-col items-center gap-4 max-h-24 md:max-h-32">
        <img
          className="max-h-full"
          src="/images/defeat.webp"
          alt="Une gaufre triste"
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3 className="uppercase md:text-lg text-center mb-1">GAME OVER</h3>
        <span className="text-center text-sm md:text-base">
          Vous ferez mieux ma prochaine fois
        </span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <CountDown weekly={weekly} />
      </div>
    </div>
  );
}

export default GameOver;
