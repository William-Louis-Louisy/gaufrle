import {
  generateCorrectGrid2D,
  generateNormalGrid2D,
} from "../utils/GridsGeneration";
import { DndProvider } from "react-dnd";
import { useEffect, useState } from "react";
import GameGrid from "../components/GameGrid";
import { IGridData } from "../types/GameGrid";
import { HTML5Backend } from "react-dnd-html5-backend";
import Loading from "../components/Navigation/Loading";
import { findMinimumMoves } from "../utils/CalculateMoves";
import { checkIfGridIsSolved, verifyCellStatus } from "../utils/CellStatus";
import CountDown from "../components/CountDown";
import WordDefinitions from "../components/WordDefinitions";

const MOVE_FACTOR = 1.25;

export default function NormalGamepage() {
  // STATES
  const [loading, setLoading] = useState<boolean>(true);
  const [todayGrid, setTodayGrid] = useState<IGridData>();
  const [remainingMoves, setRemainingMoves] = useState<number>(0);
  const [correctGrid, setCorrectGrid] = useState<string[][]>([]);
  const [gridLetters, setGridLetters] = useState<string[][]>([]);
  const [isGridSolved, setIsGridSolved] = useState<boolean>(false);
  const [cellStatus, setCellStatus] = useState<string[][]>(
    Array.from({ length: 5 }, () => Array(5).fill("default"))
  );

  // INITIALIZE GAME
  const initializeGame = async () => {
    if (!todayGrid) return;

    try {
      const generatedCorrectGrid = generateCorrectGrid2D(todayGrid.words);
      const generatedGrid = generateNormalGrid2D(todayGrid.words);
      setCorrectGrid(generatedCorrectGrid);
      setGridLetters(generatedGrid);
      verifyCellStatus(
        generatedGrid,
        setCellStatus,
        generatedCorrectGrid,
        "normal"
      );

      // Calculate minimum moves
      const minMoves = findMinimumMoves(
        generatedCorrectGrid,
        generatedGrid,
        5,
        5
      );
      const maxMoves = Math.ceil(minMoves * MOVE_FACTOR);
      setRemainingMoves(maxMoves);

      setLoading((prevLoading) => {
        if (generatedCorrectGrid && generatedGrid && maxMoves) {
          return false;
        }
        return prevLoading;
      });
    } catch (error) {
      console.error(error);
    }
  };

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

  useEffect(() => {
    if (todayGrid && todayGrid.words.length > 0) {
      initializeGame();
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
  };

  useEffect(() => {
    if (!loading) {
      const isSolved = checkIfGridIsSolved(gridLetters, correctGrid);
      setIsGridSolved(isSolved);
    }
  }, [gridLetters, correctGrid]);

  if (loading) {
    return <Loading />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="main-view gap-6 relative">
        <GameGrid
          letters={gridLetters}
          cellStatus={cellStatus}
          onCellMove={handleCellMove}
          isGridSolved={isGridSolved}
          indexValue={5}
          nonPlayableCells={[6, 8, 16, 18]}
        />
        <span className="font-semiboldbold uppercase text-lg">
          Mouvements restants :{" "}
          <span className="text-xl font-bold">{remainingMoves}</span>
        </span>
        {isGridSolved && (
          <span className="font-bold uppercase text-lg theme-text-accent">
            Félicitations !!!
          </span>
        )}

        <CountDown />

        {todayGrid && <WordDefinitions words={todayGrid.words} />}
      </div>
    </DndProvider>
  );
}
