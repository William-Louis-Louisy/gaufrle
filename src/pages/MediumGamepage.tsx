import { DndProvider } from "react-dnd";
import { useState, useEffect } from "react";
import Victory from "../components/Victory";
import GameGrid from "../components/GameGrid";
import { IGridData } from "../types/GameGrid";
import GameOver from "../components/GameOver";
import GridTitle from "../components/GridTitle";
import SeeSolution from "../components/SeeSolution";
import Loading from "../components/Navigation/Loading";
import { HTML5Backend } from "react-dnd-html5-backend";
import WordDefinitions from "../components/WordDefinitions";
import { initializeMediumGame } from "../utils/InitializeGame";
import { checkIfGridIsSolved, verifyCellStatus } from "../utils/CellStatus";
import { TouchBackend } from "react-dnd-touch-backend";

function MediumGamepage() {
  // STATES
  const [loading, setLoading] = useState<boolean>(true);
  const [previousGrid, setPreviousGrid] = useState<any>();
  const [todayGrid, setTodayGrid] = useState<IGridData>();
  const [minMoves, setMinMoves] = useState<number>(0);
  const [remainingMoves, setRemainingMoves] = useState<number>(0);
  const [correctGrid, setCorrectGrid] = useState<string[][]>([]);
  const [gridLetters, setGridLetters] = useState<string[][]>([]);
  const [isGridSolved, setIsGridSolved] = useState<boolean>(false);
  const [isGameIsOver, setIsGameIsOver] = useState<boolean>(true);
  const [cellStatus, setCellStatus] = useState<string[][]>(
    Array.from({ length: 7 }, () => Array(7).fill("default"))
  );

  function isTouchDevice() {
    if ("ontouchstart" in window || navigator.maxTouchPoints) {
      return true;
    }
    return false;
  }

  // GET TODAY'S GRID
  useEffect(() => {
    // Load json file
    const mediumGridListData = require("../jsons/MediumGridList.json");
    // Get today's grid
    const today = new Date().toISOString().slice(0, 10);
    const todayGridData = mediumGridListData.find(
      (grid: any) => grid.date === today
    );
    if (todayGridData) {
      setTodayGrid(todayGridData);
    }
  }, []);

  // GET SAVED GRID FROM LOCAL STORAGE IF ANY AND IF DATE IS TODAY
  useEffect(() => {
    const savedGrid = localStorage.getItem("currentMediumGrid");
    if (savedGrid) {
      const savedGridData = JSON.parse(savedGrid);
      const savedGridDate = savedGridData.date;
      const today = new Date().toISOString().slice(0, 10);
      if (savedGridDate === today) {
        setPreviousGrid(savedGridData);
        setLoading(false);
      }
    }
  }, []);

  // INITIALIZE GAME
  useEffect(() => {
    if (todayGrid && todayGrid.words.length > 0) {
      initializeMediumGame({
        todayGrid,
        setLoading,
        setRemainingMoves,
        setCellStatus,
        setCorrectGrid,
        setGridLetters,
        previousGrid,
        setIsGameIsOver,
        setMinMoves,
      });
    }
  }, [todayGrid]);

  // HANDLE CELL MOVE
  const handleCellMove = (
    sourceRow: number,
    sourceCol: number,
    destRow: number,
    destCol: number
  ) => {
    // Check if we can still make a move
    if (remainingMoves <= 0) return;

    const newGridLetters = [...gridLetters.map((row) => [...row])];
    [newGridLetters[sourceRow][sourceCol], newGridLetters[destRow][destCol]] = [
      newGridLetters[destRow][destCol],
      newGridLetters[sourceRow][sourceCol],
    ];
    setGridLetters(newGridLetters);
    verifyCellStatus(newGridLetters, setCellStatus, correctGrid, "medium");

    // Update remaining moves
    setRemainingMoves((prev) => prev - 1);

    const dateTime = new Date().toISOString().slice(0, 10);

    // Save current grid to local storage
    localStorage.setItem(
      "currentMediumGrid",
      JSON.stringify({
        date: dateTime,
        gridLetters: newGridLetters,
        cellStatus: cellStatus,
        remainingMoves: remainingMoves - 1,
        isGameIsOver: isGameIsOver,
        isGridSolved: isGridSolved,
      })
    );
  };

  useEffect(() => {
    if (!loading) {
      const isSolved = checkIfGridIsSolved(gridLetters, correctGrid);
      setIsGridSolved(isSolved);
    }
  }, [gridLetters, correctGrid, loading]);

  useEffect(() => {
    if (isGridSolved) {
      setIsGameIsOver(false);
    } else if (remainingMoves === 0) {
      setIsGameIsOver(true);
    }
  }, [remainingMoves, isGridSolved]);

  if (loading) {
    return <Loading />;
  }

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
