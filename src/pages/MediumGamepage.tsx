import { DndProvider } from "react-dnd";
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
import { useCurrentUtcDate } from "../hooks/useCurrentUtcDate";
import { selectScheduledGrid } from "../utils/GridSchedule";
import GridUnavailable from "../components/GridUnavailable";

function MediumGamepage() {
  const todayUtc = useCurrentUtcDate();
  const grids: IGridData[] = require("../jsons/MediumGridList.json");
  const { grid: todayGrid, periodStart } = selectScheduledGrid(
    "medium",
    grids,
    todayUtc
  );

  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

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
  } = useGameSession("medium", todayGrid, periodStart);

  if (!todayGrid) return <GridUnavailable />;
  if (!isReady) return <Loading />;

  return (
    <DndProvider
      backend={isTouchDevice() ? TouchBackend : HTML5Backend}
      options={{ enableTouchEvents: true }}
    >
      <div className="gap-4 md:gap-6 relative col-view pt-16 w-full">
        {todayGrid && <GridTitle gridType="medium" periodStart={periodStart} />}
        <GameGrid
          letters={gridLetters}
          cellStatus={cellStatus}
          onCellMove={handleCellMove}
          isGridSolved={isGridSolved}
          indexValue={7}
          nonPlayableCells={[
            0, 1, 2, 4, 5, 6, 7, 13, 14, 16, 18, 20, 28, 30, 32, 34, 35, 41, 42,
            43, 44, 46, 47, 48,
          ]}
          isGameIsOver={isGameIsOver}
        />
        <span className="font-semibold uppercase text-lg">
          Mouvements restants :{" "}
          <span className="text-xl font-bold ml-1">{remainingMoves}</span>
        </span>

        {isGridSolved && (
          <Victory minMoves={minMoves} remainingMoves={remainingMoves} />
        )}

        {todayGrid && isGameIsOver && (
          <>
            <GameOver /> <SeeSolution correctGrid={correctGrid} />
          </>
        )}

        {todayGrid && (isGridSolved || isGameIsOver) && (
          <WordDefinitions words={todayGrid.words} />
        )}
      </div>
    </DndProvider>
  );
}

export default MediumGamepage;
