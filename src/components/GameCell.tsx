import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { IGameCell } from "../types/GameCell";

const ItemType = "CELL";

function GameCell({ row, col, letter, onMove, status }: IGameCell) {
  const index = row * 5 + col; // Transform 2D index to 1D
  const isNonPlayable = [6, 8, 16, 18].includes(index);

  const [, ref] = useDrop({
    accept: ItemType,
    drop: (item: { row: number; col: number }) => {
      if (!isNonPlayable) {
        onMove(item.row, item.col, row, col);
      }
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
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
      className={getCellClass()}
      ref={isNonPlayable ? undefined : (node) => drag(ref(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {letter}
    </div>
  );
}
export default GameCell;
