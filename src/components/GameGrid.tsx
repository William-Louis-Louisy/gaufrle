import React from "react";
import GameCell from "./GameCell";

interface GameGridProps {
  isGridSolved: boolean;
  letters: string[][];
  cellStatus: string[][];
  onCellMove: (
    sourceRow: number,
    sourceCol: number,
    destRow: number,
    destCol: number
  ) => void;
  indexValue: number;
  nonPlayableCells: any;
  isGameIsOver?: boolean;
}

function GameGrid({
  letters,
  cellStatus,
  onCellMove,
  isGridSolved,
  nonPlayableCells,
  indexValue,
  isGameIsOver,
}: GameGridProps) {
  return (
    <div className="flex flex-col relative">
      {letters.map((row, i) => {
        return (
          <div className="flex flex-row" key={i}>
            {row.map((letter, j) => {
              return (
                <GameCell
                  key={`R${j}-C${i}`}
                  row={i}
                  col={j}
                  letter={letter}
                  onMove={onCellMove}
                  status={cellStatus[i][j]}
                  isGridSolved={isGridSolved}
                  indexValue={indexValue}
                  nonPlayableCells={nonPlayableCells}
                />
              );
            })}
          </div>
        );
      })}

      {isGameIsOver && <div className="game-over-layer"></div>}
    </div>
  );
}

export default GameGrid;
