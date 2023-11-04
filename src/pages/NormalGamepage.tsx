import { DndProvider } from "react-dnd";
import { useEffect, useState } from "react";
import GameGrid from "../components/GameGrid";
import { IGridData } from "../types/GameGrid";
import { HTML5Backend } from "react-dnd-html5-backend";
import Loading from "../components/Navigation/Loading";
import { checkIfGridIsSolved, verifyCellStatus } from "../utils/CellStatus";
import WordDefinitions from "../components/WordDefinitions";
import { initializeNormalGame } from "../utils/InitializeGame";
import GameOver from "../components/GameOver";
import SeeSolution from "../components/SeeSolution";
import Victory from "../components/Victory";
import GridTitle from "../components/GridTitle";

export default function NormalGamepage() {
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
    Array.from({ length: 5 }, () => Array(5).fill("default"))
  );

  useEffect(() => {
    // Load json file
    const normalGridListData = require("../jsons/NormalGridList.json");
    // Get today's grid
    const today = new Date().toISOString().slice(0, 10);
    const todayGridData = normalGridListData.find(
      (grid: any) => grid.date === today
    );
    if (todayGridData) {
      setTodayGrid(todayGridData);
    }
  }, []);

  // GET SAVED GRID FROM LOCAL STORAGE IF ANY AND IF DATE IS TODAY
  useEffect(() => {
    const savedGrid = localStorage.getItem("currentNormalGrid");
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

  useEffect(() => {
    if (todayGrid && todayGrid.words.length > 0) {
      initializeNormalGame({
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
    verifyCellStatus(newGridLetters, setCellStatus, correctGrid, "normal");

    // Update remaining moves
    setRemainingMoves((prev) => prev - 1);

    const dateTime = new Date().toISOString().slice(0, 10);

    // Save grid to local storage
    localStorage.setItem(
      "currentNormalGrid",
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
          indexValue={5}
          nonPlayableCells={[6, 8, 16, 18]}
          isGameIsOver={isGameIsOver}
        />
        <span className="font-semibold uppercase text-lg">
          Mouvements restants :
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
