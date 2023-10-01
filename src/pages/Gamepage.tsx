/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { DndProvider } from "react-dnd";
import GameGrid from "../components/GameGrid";
import { HTML5Backend } from "react-dnd-html5-backend";
import { verifyCellStatus } from "../utils/CellStatus";
import { generateNormalGrid2D } from "../utils/GridsGeneration";

const gameGrid = {
  id: "6512adb8a09028c409178998",
  date: "2023-09-25",
  type: "normal",
  words: ["aboye", "reera", "saris", "abris", "obeir", "ebats"],
};

export default function Gamepage() {
  const [gridLetters, setGridLetters] = React.useState<string[][]>([]);
  const [cellStatus, setCellStatus] = React.useState<string[][]>(
    Array.from({ length: 5 }, () => Array(5).fill("default"))
  );

  // HANDLE CELL MOVE
  const handleCellMove = (
    sourceRow: number,
    sourceCol: number,
    destRow: number,
    destCol: number
  ) => {
    const newGridLetters = [...gridLetters.map((row) => [...row])];
    [newGridLetters[sourceRow][sourceCol], newGridLetters[destRow][destCol]] = [
      newGridLetters[destRow][destCol],
      newGridLetters[sourceRow][sourceCol],
    ];
    setGridLetters(newGridLetters);
    verifyCellStatus(newGridLetters, gameGrid, setCellStatus);
  };

  React.useEffect(() => {
    const generatedGrid = generateNormalGrid2D(gameGrid.words);
    setGridLetters(generatedGrid);
    verifyCellStatus(generatedGrid, gameGrid, setCellStatus);
  }, []);
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full flex flex-col items-center justify-center h-full">
        <GameGrid
          letters={gridLetters}
          cellStatus={cellStatus}
          onCellMove={handleCellMove}
        />
      </div>
    </DndProvider>
  );
}
