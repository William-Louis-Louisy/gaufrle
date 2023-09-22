export interface IGameCell {
  id: string;
  letter: string;
  status: "default" | "yellow" | "green";
}
