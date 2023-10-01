import React from "react";
import GameCell from "./GameCell";

interface GameGridProps {
  letters: string[][];
  cellStatus: string[][];
  onCellMove: (
    sourceRow: number,
    sourceCol: number,
    destRow: number,
    destCol: number
  ) => void;
}

function GameGrid({ letters, cellStatus, onCellMove }: GameGridProps) {
  return (
    <div className="grid-container">
      {letters.map((row, i) => (
        <div className="grid-row" key={i}>
          {row.map((letter, j) => (
            <GameCell
              key={`${i}-${j}`}
              row={i}
              col={j}
              letter={letter}
              onMove={onCellMove}
              status={cellStatus[i][j]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default GameGrid;
