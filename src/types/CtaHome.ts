import type { GameMode } from "../utils/GameSession";

export interface CtaHomeProps {
  mode: GameMode;
  title: string;
  description: string;
  cellsNumber: number;
  colsNumber: string;
  href: string;
}
