import mediumCatalog from "../jsons/MediumGridList.json";
import GamePage from "../components/GamePage";
import type { IGridData } from "../types/GameGrid";

// The catalog stays inside the lazily loaded route bundle.
export default function MediumGamepage() {
  return <GamePage mode="medium" grids={mediumCatalog as IGridData[]} />;
}
