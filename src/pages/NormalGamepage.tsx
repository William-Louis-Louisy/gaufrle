/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  generateCorrectGrid2D,
  generateNormalGrid2D,
} from "../utils/GridsGeneration";
import { DndProvider } from "react-dnd";
import { useEffect, useState } from "react";
import GameGrid from "../components/GameGrid";
import { HTML5Backend } from "react-dnd-html5-backend";
import { checkIfGridIsSolved, verifyCellStatus } from "../utils/CellStatus";
import { findMinimumMoves } from "../utils/CalculateMoves";
import Loading from "../components/Navigation/Loading";

const MOVE_FACTOR = 1.25;
const gameGrid = {
  id: "6512adb8a09028c409178998",
  date: "2023-09-25",
  type: "normal",
  words: ["aubes", "cucul", "niees", "aucun", "bache", "sales"],
};

export default function NormalGamepage() {
  // STATES
  const [loading, setLoading] = useState<boolean>(true);
  const [remainingMoves, setRemainingMoves] = useState<number>(0);
  const [correctGrid, setCorrectGrid] = useState<string[][]>([]);
  const [gridLetters, setGridLetters] = useState<string[][]>([]);
  const [isGridSolved, setIsGridSolved] = useState<boolean>(false);
  const [cellStatus, setCellStatus] = useState<string[][]>(
    Array.from({ length: 5 }, () => Array(5).fill("default"))
  );

  // INITIALIZE GAME
  const initializeGame = async () => {
    try {
      const generatedCorrectGrid = generateCorrectGrid2D(gameGrid.words);
      const generatedGrid = generateNormalGrid2D(gameGrid.words);
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

      if (generatedCorrectGrid && generatedGrid && maxMoves) {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
    initializeGame();
  }, []);

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
        <span className="font-bold">
          Mouvements restants : {remainingMoves}
        </span>
        {isGridSolved && (
          <span className="font-bold uppercase text-lg theme-text-accent">
            Félicitations !!!
          </span>
        )}
      </div>
    </DndProvider>
  );
}
