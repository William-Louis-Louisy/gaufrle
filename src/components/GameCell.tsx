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
      if (!isNonPlayable && status !== "correct") {
        onMove(item.row, item.col, row, col);
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { row, col },
    canDrag: !isNonPlayable && status !== "correct",
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
      className={`${getCellClass()} ${
        isGridSolved && !isNonPlayable ? "blink-cell" : ""
      }`}
      ref={isNonPlayable ? undefined : (node) => drag(ref(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        animationDelay: isGridSolved ? `${index * 0.05}s` : "0s",
      }}
    >
      {letter}
    </div>
  );
}
export default GameCell;
