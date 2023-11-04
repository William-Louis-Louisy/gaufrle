import { IGridData } from "../types/GameGrid";
import { findMinimumMoves } from "./CalculateMoves";
import { verifyCellStatus } from "./CellStatus";
import { generateCorrectGrid2D, generateNormalGrid2D } from "./GridsGeneration";
import {
  generateCorrectHardGrid2D,
  generateHardGrid2D,
} from "./HardGridsGeneration";
import {
  generateCorrectMediumGrid2D,
  generateMediumGrid2D,
} from "./MediumGridsGeneration";

const MOVE_FACTOR = 1.25;

type InitializeGameProps = {
  todayGrid: IGridData;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setRemainingMoves: React.Dispatch<React.SetStateAction<number>>;
  setCellStatus: React.Dispatch<React.SetStateAction<string[][]>>;
  setGridLetters: React.Dispatch<React.SetStateAction<string[][]>>;
  setCorrectGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  setIsGameIsOver?: React.Dispatch<React.SetStateAction<boolean>>;
  previousGrid?: any;
  setMinMoves: React.Dispatch<React.SetStateAction<number>>;
};

// INITIALIZE NORMAL GAME
export const initializeNormalGame = async ({
  todayGrid,
  setLoading,
  setRemainingMoves,
  setCellStatus,
  setGridLetters,
  setCorrectGrid,
  previousGrid,
  setIsGameIsOver,
  setMinMoves,
}: InitializeGameProps) => {
  if (!todayGrid) return;

  try {
    const generatedCorrectGrid = generateCorrectGrid2D(todayGrid.words);
    const generatedGrid = generateNormalGrid2D(todayGrid.words);

    if (previousGrid) {
      const previousGridLetters = previousGrid.gridLetters;

      setCorrectGrid(generatedCorrectGrid);
      setGridLetters(previousGridLetters);
      setRemainingMoves(previousGrid.remainingMoves);
      verifyCellStatus(
        previousGridLetters,
        setCellStatus,
        generatedCorrectGrid,
        "normal"
      );
    } else {
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
      setMinMoves(minMoves);
      setRemainingMoves(maxMoves);

      setIsGameIsOver && setIsGameIsOver(false);

      setLoading((prevLoading) => {
        if (generatedCorrectGrid && generatedGrid && maxMoves) {
          return false;
        }
        return prevLoading;
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// INITIALIZE MEDIUM GAME
export const initializeMediumGame = async ({
  todayGrid,
  setLoading,
  setRemainingMoves,
  setCellStatus,
  setGridLetters,
  setCorrectGrid,
  previousGrid,
  setIsGameIsOver,
  setMinMoves,
}: InitializeGameProps) => {
  // IF NO GRID DATA RETURN
  if (!todayGrid) return;

  try {
    const generatedCorrectGrid = generateCorrectMediumGrid2D(todayGrid.words);
    const generatedGrid = generateMediumGrid2D(todayGrid.words);

    if (previousGrid) {
      const previousGridLetters = previousGrid.gridLetters;

      setCorrectGrid(generatedCorrectGrid);
      setGridLetters(previousGridLetters);
      setRemainingMoves(previousGrid.remainingMoves);
      verifyCellStatus(
        previousGridLetters,
        setCellStatus,
        generatedCorrectGrid,
        "medium"
      );
    } else {
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
      setMinMoves(minMoves);
      setRemainingMoves(maxMoves);

      setIsGameIsOver && setIsGameIsOver(false);

      setLoading((prevLoading) => {
        if (generatedCorrectGrid && generatedGrid && maxMoves) {
          return false;
        }
        return prevLoading;
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// INITIALIZE HARD GAME
export const initializeHardGame = async ({
  todayGrid,
  setLoading,
  setRemainingMoves,
  setCellStatus,
  setGridLetters,
  setCorrectGrid,
  previousGrid,
  setIsGameIsOver,
  setMinMoves,
}: InitializeGameProps) => {
  // IF NO GRID DATA RETURN
  if (!todayGrid) return;

  try {
    const generatedCorrectGrid = generateCorrectHardGrid2D(todayGrid.words);
    const generatedGrid = generateHardGrid2D(todayGrid.words);

    if (previousGrid) {
      const previousGridLetters = previousGrid.gridLetters;

      setCorrectGrid(generatedCorrectGrid);
      setGridLetters(previousGridLetters);
      setRemainingMoves(previousGrid.remainingMoves);
      verifyCellStatus(
        previousGridLetters,
        setCellStatus,
        generatedCorrectGrid,
        "hard"
      );
    } else {
      setCorrectGrid(generatedCorrectGrid);
      setGridLetters(generatedGrid);
      verifyCellStatus(
        generatedGrid,
        setCellStatus,
        generatedCorrectGrid,
        "hard"
      );

      // Calculate minimum moves
      const minMoves = findMinimumMoves(
        generatedCorrectGrid,
        generatedGrid,
        7,
        7
      );
      const maxMoves = Math.ceil(minMoves * MOVE_FACTOR);
      setMinMoves(minMoves);
      setRemainingMoves(maxMoves);

      setIsGameIsOver && setIsGameIsOver(false);

      setLoading((prevLoading) => {
        if (generatedCorrectGrid && generatedGrid && maxMoves) {
          return false;
        }
        return prevLoading;
      });
    }
  } catch (error) {
    console.error(error);
  }
};
