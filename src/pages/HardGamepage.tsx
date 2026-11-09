import hardCatalog from "../jsons/HardGridList.json";
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
import { usePublicationDate } from "../hooks/usePublicationDate";
import { selectScheduledGrid } from "../utils/GridSchedule";
import GridUnavailable from "../components/GridUnavailable";
import { gridMetadata } from "../utils/CellStatus";

function HardGamepage() {
  const publicationDate = usePublicationDate();
  const grids: IGridData[] = hardCatalog as IGridData[];
  const { grid: todayGrid, periodStart } = selectScheduledGrid(
    "hard",
    grids,
    publicationDate
  );

  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  const {
    isReady,
    victoryScore,
    remainingMoves,
    correctGrid,
    gridLetters,
    cellStatus,
    isGridSolved,
    isGameIsOver,
    handleCellMove,
    canCellMove,
  } = useGameSession("hard", todayGrid, periodStart);

  if (!todayGrid) return <GridUnavailable weekly />;
  if (!isReady) return <Loading />;

  return (
    <DndProvider
      backend={isTouchDevice() ? TouchBackend : HTML5Backend}
      options={{ enableTouchEvents: true }}
    >
      <div className="gap-4 md:gap-6 relative col-view pt-16 w-full">
        {todayGrid && <GridTitle gridType="hard" periodStart={periodStart} />}
        <GameGrid
          letters={gridLetters}
          cellStatus={cellStatus}
          onCellMove={handleCellMove}
          canCellMove={canCellMove}
          isGridSolved={isGridSolved}
          indexValue={7}
          nonPlayableCells={gridMetadata.hard.nonPlayableCells}
          isGameIsOver={isGameIsOver}
        />
        <span className="font-semibold uppercase text-lg">
          Mouvements restants :{" "}
          <span className="text-xl font-bold ml-1">{remainingMoves}</span>
        </span>

        {isGridSolved && victoryScore && (
          <Victory score={victoryScore} weekly />
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
