import normalCatalog from "../jsons/NormalGridList.json";
import GamePage from "../components/GamePage";
import type { IGridData } from "../types/GameGrid";

// The catalog stays inside the lazily loaded route bundle.
export default function NormalGamepage() {
  return <GamePage mode="normal" grids={normalCatalog as IGridData[]} />;
}
