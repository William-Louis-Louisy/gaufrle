export interface IGameCell {
  row: number;
  col: number;
  letter: string;
  onMove: (
    sourceRow: number,
    sourceCol: number,
    destRow: number,
    destCol: number
  ) => void;
  status: string;
  isGridSolved: boolean;
  nonPlayableCells: ReadonlyArray<number>;
  isGameIsOver: boolean;
  canCellMove: (
    sourceRow: number,
    sourceCol: number,
    destRow: number,
    destCol: number
  ) => boolean;
  indexValue: number;
  isSelected?: boolean;
  onSelect?: (row: number, col: number) => void;
}
