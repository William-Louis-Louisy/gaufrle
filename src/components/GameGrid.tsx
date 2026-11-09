import React, { useState } from "react";
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
  nonPlayableCells: ReadonlyArray<number>;
  isGameIsOver?: boolean;
  canCellMove: (
    sourceRow: number,
    sourceCol: number,
    destRow: number,
    destCol: number
  ) => boolean;
}

function GameGrid({
  letters,
  cellStatus,
  onCellMove,
  isGridSolved,
  nonPlayableCells,
  indexValue,
  isGameIsOver,
  canCellMove,
}: GameGridProps) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);

  const selectCell = (row: number, col: number) => {
    if (!selected) {
      setSelected({ row, col });
      return;
    }
    if (selected.row === row && selected.col === col) {
      setSelected(null);
      return;
    }
    if (canCellMove(selected.row, selected.col, row, col)) {
      onCellMove(selected.row, selected.col, row, col);
      setSelected(null);
    } else {
      setSelected({ row, col });
    }
  };

  return (
    <div className="flex flex-col relative" role="group" aria-label="Grille de lettres" onKeyDown={(event) => {
      if (event.key === "Escape") setSelected(null);
    }}>
      <p className="sr-only">Pour échanger deux lettres, sélectionnez une première case, puis une seconde avec Entrée ou Espace. Échap annule la sélection. Utilisez Tab pour passer d’une case à l’autre.</p>
      <span className="sr-only" role="status" aria-live="polite">{selected ? `Lettre sélectionnée, ligne ${selected.row + 1}, colonne ${selected.col + 1}.` : ""}</span>
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
                  isGameIsOver={Boolean(isGameIsOver)}
                  canCellMove={canCellMove}
                  isSelected={selected?.row === i && selected?.col === j}
                  onSelect={selectCell}
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
