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
}
