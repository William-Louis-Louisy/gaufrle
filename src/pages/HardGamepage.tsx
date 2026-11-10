import hardCatalog from "../jsons/HardGridList.json";
import GamePage from "../components/GamePage";
import type { IGridData } from "../types/GameGrid";

// The catalog stays inside the lazily loaded route bundle.
export default function HardGamepage() {
  return <GamePage mode="hard" grids={hardCatalog as IGridData[]} />;
}
