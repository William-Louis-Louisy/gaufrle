import { useState, useEffect } from "react";
import { checkIfGridIsSolved, verifyCellStatus } from "../utils/CellStatus";
import { findMinimumMoves } from "../utils/CalculateMoves";
import Loading from "../components/Navigation/Loading";
import {
  generateCorrectMediumGrid2D,
  generateMediumGrid2D,
} from "../utils/MediumGridsGeneration";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GameGrid from "../components/GameGrid";

const MOVE_FACTOR = 1.25;
const gameGrid = {
  id: "6512adb8a09028c409178998",
  date: "2023-09-25",
  type: "normal",
  words: ["cajou", "perceur", "eleve", "chene", "ejecter", "usure"],
};

function MediumGamepage() {
  // STATES
  const [loading, setLoading] = useState<boolean>(true);
  const [remainingMoves, setRemainingMoves] = useState<number>(0);
  const [correctGrid, setCorrectGrid] = useState<string[][]>([]);
  const [gridLetters, setGridLetters] = useState<string[][]>([]);
  const [isGridSolved, setIsGridSolved] = useState<boolean>(false);
  const [cellStatus, setCellStatus] = useState<string[][]>(
    Array.from({ length: 7 }, () => Array(7).fill("default"))
  );

  // INITIALIZE GAME
  const initializeGame = async () => {
    try {
      const generatedCorrectGrid = generateCorrectMediumGrid2D(gameGrid.words);
      const generatedGrid = generateMediumGrid2D(gameGrid.words);
      setCorrectGrid(generatedCorrectGrid);
      setGridLetters(generatedGrid);
      verifyCellStatus(
        generatedGrid,
        setCellStatus,
        generatedCorrectGrid,
        "medium"
      );

      // Calculate minimum moves
      const minMoves = findMinimumMoves(
        generatedCorrectGrid,
        generatedGrid,
        7,
        7
      );
      const maxMoves = Math.ceil(minMoves * MOVE_FACTOR);
      setRemainingMoves(maxMoves);
      if (generatedCorrectGrid && generatedGrid) {
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
    verifyCellStatus(newGridLetters, setCellStatus, correctGrid, "medium");

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
          indexValue={7}
          nonPlayableCells={[
            0, 1, 2, 4, 5, 6, 7, 13, 14, 16, 18, 20, 28, 30, 32, 34, 35, 41, 42,
            43, 44, 46, 47, 48,
          ]}
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

export default MediumGamepage;
