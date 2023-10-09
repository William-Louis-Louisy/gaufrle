import React from "react";
import "../../styles/loader.css";

function Loading() {
  return (
    <div className="flex-1 flex w-full justify-center items-center">
      <div className="flex flex-col gap-2 items-center uppercase font-bold">
        <div className="w-fit">
          <div className="waffle">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="square"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        Chargement...
      </div>
    </div>
  );
}

export default Loading;
