import { IGameCell } from "./GameCell";

export interface IGameGrid {
  rows: number;
  columns: number;
  cells: IGameCell[];
  words: string[];
}

export interface IGridData {
  id: string;
  date: string;
  type: "normal" | "medium" | "hard";
  words: string[];
}
