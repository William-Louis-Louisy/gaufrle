import { IGameCell } from "./GameCell";

export interface IGameGrid {
  rows: number;
  columns: number;
  cells: IGameCell[];
  words: string[];
}
