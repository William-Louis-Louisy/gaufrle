import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { IGameCell } from "../types/GameCell";

const ItemType = "CELL";

function GameCell({
  row,
  col,
  letter,
  onMove,
  status,
  isGridSolved,
  nonPlayableCells,
  indexValue,
}: IGameCell) {
  const index = row * indexValue + col;
  const isNonPlayable = nonPlayableCells.includes(index);

  const [, ref] = useDrop({
    accept: ItemType,
    drop: (item: { row: number; col: number }) => {
      if (!isNonPlayable) {
        onMove(item.row, item.col, row, col);
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { row, col },
    canDrag: !isNonPlayable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getCellClass = () => {
    switch (status) {
      case "correct":
        return "correct-cell";
      case "lineOrColumn":
        return "line-or-column-cell";
      case "default":
        return isNonPlayable ? "disabled-cell" : "normal-cell";
    }
  };

  return (
    <div
      className={`${getCellClass()} ${isGridSolved ? "blink-cell" : ""}`}
      ref={isNonPlayable ? undefined : (node) => drag(ref(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        animationDelay: isGridSolved ? `${index * 0.2}s` : "0s", // Ajouter un délai basé sur l'index
      }}
    >
      {letter}
    </div>
  );
}
export default GameCell;
