import { DndProvider } from "react-dnd";
import { useEffect, useState } from "react";
import Victory from "../components/Victory";
import GameGrid from "../components/GameGrid";
import { IGridData } from "../types/GameGrid";
import GameOver from "../components/GameOver";
import GridTitle from "../components/GridTitle";
import SeeSolution from "../components/SeeSolution";
import Loading from "../components/Navigation/Loading";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import WordDefinitions from "../components/WordDefinitions";
import { useGameSession } from "../hooks/useGameSession";
import { getMonday, getSunday } from "../utils/WeeklyGrid";

function HardGamepage() {
  const [todayGrid, setTodayGrid] = useState<IGridData>();

  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  useEffect(() => {
    const grids: IGridData[] = require("../jsons/HardGridList.json");
    const today = new Date().toISOString().slice(0, 10);
    const monday = getMonday(today);
    const sunday = getSunday(today);
    const weeklyGrid = grids.find((grid) => {
      const gridDate = new Date(grid.date);
      return gridDate >= monday && gridDate <= sunday;
    });
    setTodayGrid(weeklyGrid);
  }, []);

  const {
    isReady,
    minMoves,
    remainingMoves,
    correctGrid,
    gridLetters,
    cellStatus,
    isGridSolved,
    isGameIsOver,
    handleCellMove,
  } = useGameSession("hard", todayGrid);

  if (!isReady) return <Loading />;

  return (
    <DndProvider
      backend={isTouchDevice() ? TouchBackend : HTML5Backend}
      options={{ enableTouchEvents: true }}
    >
      <div className="gap-4 md:gap-6 relative col-view pt-16 w-full">
        {todayGrid && <GridTitle gridType={todayGrid.type} />}
        <GameGrid
          letters={gridLetters}
          cellStatus={cellStatus}
          onCellMove={handleCellMove}
          isGridSolved={isGridSolved}
          indexValue={7}
          nonPlayableCells={[8, 10, 12, 22, 24, 26, 36, 38, 40]}
          isGameIsOver={isGameIsOver}
        />
        <span className="font-semibold uppercase text-lg">
          Mouvements restants :{" "}
          <span className="text-xl font-bold ml-1">{remainingMoves}</span>
        </span>

        {isGridSolved && (
          <Victory
            minMoves={minMoves}
            weekly={true}
            remainingMoves={remainingMoves}
          />
        )}

        {todayGrid && isGameIsOver && (
          <>
            <GameOver weekly={true} /> <SeeSolution correctGrid={correctGrid} />
          </>
        )}

        {todayGrid && (isGridSolved || isGameIsOver) && (
          <WordDefinitions words={todayGrid.words} />
        )}
      </div>
    </DndProvider>
  );
}

export default HardGamepage;
