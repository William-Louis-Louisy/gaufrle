import { type } from "os";
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
  type: string;
  words: string[];
}
