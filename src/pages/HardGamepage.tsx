import { DndProvider } from "react-dnd";
import { useState, useEffect } from "react";
import Victory from "../components/Victory";
import GameGrid from "../components/GameGrid";
import { IGridData } from "../types/GameGrid";
import GameOver from "../components/GameOver";
import SeeSolution from "../components/SeeSolution";
import { HTML5Backend } from "react-dnd-html5-backend";
import Loading from "../components/Navigation/Loading";
import WordDefinitions from "../components/WordDefinitions";
import { initializeHardGame } from "../utils/InitializeGame";
import { checkIfGridIsSolved, verifyCellStatus } from "../utils/CellStatus";
import { getMonday, getSunday } from "../utils/WeeklyGrid";
import GridTitle from "../components/GridTitle";

function HardGamepage() {
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
  // Get this week's grid
  const today = new Date().toISOString().slice(0, 10);
  // Dates du lundi et du dimanche de la semaine actuelle
  const currentMonday = getMonday(today);
  const currentSunday = getSunday(today);
  // GET THIS WEEK'S GRID
  useEffect(() => {
    // Load json file
    const hardGridListData = require("../jsons/HardGridList.json");

    // Find the grid with the same week number as today
    const todayGridData = hardGridListData.find((grid: any) => {
      const gridDate = new Date(grid.date);

      return gridDate >= currentMonday && gridDate <= currentSunday;
    });
    if (todayGridData) {
      setTodayGrid(todayGridData);
    }
  }, []);

  // GET SAVED GRID FROM LOCAL STORAGE IF ANY AND IF DATE IS IN THE SAME WEEK
  useEffect(() => {
    const savedGrid = localStorage.getItem("currentHardGrid");
    if (savedGrid) {
      const savedGridData = JSON.parse(savedGrid);
      const gridDate = new Date(savedGridData.date);
      if (gridDate >= currentMonday && gridDate <= currentSunday) {
        setPreviousGrid(savedGridData);
        setLoading(false);
      }
    }
  }, []);

  // INITIALIZE GAME
  useEffect(() => {
    if (todayGrid && todayGrid.words.length > 0) {
      initializeHardGame({
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
    verifyCellStatus(newGridLetters, setCellStatus, correctGrid, "hard");

    // Update remaining moves
    setRemainingMoves((prev) => prev - 1);

    const dateTime = new Date().toISOString().slice(0, 10);

    // Save current grid to local storage
    localStorage.setItem(
      "currentHardGrid",
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
    <DndProvider backend={HTML5Backend}>
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
