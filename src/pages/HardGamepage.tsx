import {
  generateHardGrid2D,
  generateCorrectHardGrid2D,
} from "../utils/HardGridsGeneration";
import { DndProvider } from "react-dnd";
import { useState, useEffect } from "react";
import GameGrid from "../components/GameGrid";
import { HTML5Backend } from "react-dnd-html5-backend";
import { findMinimumMoves } from "../utils/CalculateMoves";
import { checkIfGridIsSolved, verifyCellStatus } from "../utils/CellStatus";
import Loading from "../components/Navigation/Loading";

const MOVE_FACTOR = 1.25;
const gameGrid = {
  id: "6512ba72e1b7caeb9893f815",
  date: "2023-09-25",
  type: "hard",
  words: [
    "aborder",
    "lombric",
    "tisanes",
    "rosiere",
    "aplatir",
    "osmoses",
    "derange",
    "racisme",
  ],
};

function HardGamepage() {
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
      const generatedCorrectGrid = generateCorrectHardGrid2D(gameGrid.words);
      const generatedGrid = generateHardGrid2D(gameGrid.words);
      setCorrectGrid(generatedCorrectGrid);
      setGridLetters(generatedGrid);
      verifyCellStatus(generatedGrid, setCellStatus, generatedCorrectGrid, 7);

      // Calculate minimum moves
      const minMoves = findMinimumMoves(
        generatedCorrectGrid,
        generatedGrid,
        7,
        7
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
    verifyCellStatus(newGridLetters, setCellStatus, correctGrid, 7);

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

      // if (isSolved) {
      //   alert("Bravo, vous avez résolu la grille !");
      // }
    }
  }, [gridLetters, correctGrid]);

  if (loading) {
    return <Loading />;
  }

  console.log("CORRECT GRID : ", correctGrid);
  console.log("ACTUAL GRID : ", gridLetters);
  console.log("CELL STATUS : ", cellStatus);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="main-view gap-6 relative">
        <GameGrid
          letters={gridLetters}
          cellStatus={cellStatus}
          onCellMove={handleCellMove}
          isGridSolved={isGridSolved}
          indexValue={7}
          nonPlayableCells={[8, 10, 12, 22, 24, 26, 36, 38, 40]}
        />
        <h1 className="font-bold">Mouvements restants : {remainingMoves}</h1>
        {isGridSolved && (
          <h1 className="font-bold uppercase text-lg blink-text">
            Félicitations !!!
          </h1>
        )}
      </div>
    </DndProvider>
  );
}

export default HardGamepage;
