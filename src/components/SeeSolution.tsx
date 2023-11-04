import { useState } from "react";

function SeeSolution({ correctGrid }: { correctGrid: string[][] }) {
  const [isDisplayed, setIsDisplayed] = useState<boolean>(false);
  return (
    <div className="w-full md:w-4/5 2xl:w-[70%] p-4 theme-lmnt col-view gap-4 md:rounded-md">
      {/* BUTTON */}
      <button
        className={`uppercase theme-text px-3 py-2 rounded-md font-bold ${
          isDisplayed ? "theme-bg" : "bg-valid"
        }`}
        onClick={() => setIsDisplayed(!isDisplayed)}
      >
        {isDisplayed ? "Cacher la solution" : "Voir la solution"}
      </button>

      {/* SOLUTION */}
      {isDisplayed && (
        <div className="flex flex-col">
          {correctGrid?.map((row, i) => {
            return (
              <div className="flex flex-row" key={i}>
                {row.map((letter, j) => {
                  const nonPlayableCells = letter.includes("❌");
                  return (
                    <div
                      key={`R${j}-C${i}`}
                      className={`solution-cell ${
                        nonPlayableCells ? "" : "bg-valid"
                      }`}
                    >
                      {nonPlayableCells ? "" : letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SeeSolution;
