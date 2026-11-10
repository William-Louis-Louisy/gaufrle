import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import GameGrid from "./GameGrid";
import GameOver from "./GameOver";
import GridTitle from "./GridTitle";
import GridUnavailable from "./GridUnavailable";
import Loading from "./Navigation/Loading";
import SeeSolution from "./SeeSolution";
import Victory from "./Victory";
import WordDefinitions from "./WordDefinitions";
import { useGameSession } from "../hooks/useGameSession";
import { usePublicationDate } from "../hooks/usePublicationDate";
import type { IGridData } from "../types/GameGrid";
import { gridMetadata } from "../utils/CellStatus";
import type { GameMode } from "../utils/GameSession";
import { selectScheduledGrid } from "../utils/GridSchedule";

interface GamePageProps {
  mode: GameMode;
  grids: readonly IGridData[];
}

const GRID_SIZES: Readonly<Record<GameMode, number>> = {
  normal: 5,
  medium: 7,
  hard: 7,
};

/**
 * Shared presentation for all three modes. Keep each catalog imported from
 * its route wrapper so Vite only downloads the selected difficulty.
 */
export default function GamePage({ mode, grids }: GamePageProps) {
  const publicationDate = usePublicationDate();
  const { grid: todayGrid, periodStart } = selectScheduledGrid(
    mode,
    grids,
    publicationDate
  );
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
  } = useGameSession(mode, todayGrid, periodStart);

  if (!todayGrid) return <GridUnavailable weekly={mode === "hard"} />;
  if (!isReady) return <Loading />;

  const weekly = mode === "hard";
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return (
    <DndProvider
      backend={isTouchDevice ? TouchBackend : HTML5Backend}
      options={{ enableTouchEvents: true }}
    >
      <div className="gap-4 md:gap-6 relative col-view pt-16 w-full">
        <GridTitle gridType={mode} periodStart={periodStart} />
        <GameGrid
          letters={gridLetters}
          cellStatus={cellStatus}
          onCellMove={handleCellMove}
          canCellMove={canCellMove}
          isGridSolved={isGridSolved}
          indexValue={GRID_SIZES[mode]}
          nonPlayableCells={gridMetadata[mode].nonPlayableCells}
          isGameIsOver={isGameIsOver}
        />
        <span className="font-semibold uppercase text-lg">
          Mouvements restants :{" "}
          <span className="text-xl font-bold ml-1">{remainingMoves}</span>
        </span>

        {isGridSolved && victoryScore && (
          <Victory score={victoryScore} weekly={weekly} />
        )}

        {isGameIsOver && (
          <>
            <GameOver weekly={weekly} />
            <SeeSolution correctGrid={correctGrid} />
          </>
        )}

        {(isGridSolved || isGameIsOver) && (
          <WordDefinitions words={todayGrid.words} />
        )}
      </div>
    </DndProvider>
  );
}
