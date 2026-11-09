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
  isGameIsOver,
  canCellMove,
}: IGameCell) {
  const index = row * indexValue + col;
  const isNonPlayable = nonPlayableCells.includes(index);

  const isLocked =
    isNonPlayable || status === "correct" || isGridSolved || isGameIsOver;

  const [, ref] = useDrop({
    accept: ItemType,
    canDrop: (item: { row: number; col: number }) =>
      !isLocked && canCellMove(item.row, item.col, row, col),
    drop: (item: { row: number; col: number }) => {
      if (!isLocked && canCellMove(item.row, item.col, row, col)) {
        onMove(item.row, item.col, row, col);
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { row, col },
    canDrag: !isLocked,
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
