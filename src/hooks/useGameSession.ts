import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IGridData } from "../types/GameGrid";
import { calculateCellStatus } from "../utils/CellStatus";
import {
  GameMode,
  GameSession,
  applyGameMove,
  canSwapGameCells,
  createGameIdentity,
  createInitialGame,
  getCorrectGrid,
  loadGameSession,
  sameGameIdentity,
  saveGameSession,
} from "../utils/GameSession";

/**
 * One atomic session is the source of truth for the board, remaining moves,
 * victory/defeat and score. Persist immediately after each accepted move.
 */
export function useGameSession(
  mode: GameMode,
  grid: IGridData | undefined,
  periodStart?: string
) {
  const [session, setSession] = useState<GameSession | null>(null);
  const sessionRef = useRef<GameSession | null>(null);

  const identity = useMemo(
    () => grid ? createGameIdentity(mode, periodStart ?? grid.date, grid) : null,
    [mode, grid, periodStart]
  );
  const correctGrid = useMemo(
    () => grid ? getCorrectGrid(mode, grid.words) : [],
    [mode, grid]
  );

  useEffect(() => {
    if (!grid || !identity) return;

    const initialSession = createInitialGame(mode, grid, identity.periodStart);
    const next =
      loadGameSession(identity, correctGrid, initialSession) ?? initialSession;

    sessionRef.current = next;
    setSession(next);
    saveGameSession(next);
  }, [mode, grid, identity, correctGrid]);

  const currentSession =
    session && identity && sameGameIdentity(session.identity, identity)
      ? session
      : null;

  const cellStatus = useMemo(
    () =>
      currentSession
        ? calculateCellStatus(currentSession.gridLetters, correctGrid, mode)
        : [],
    [currentSession, correctGrid, mode]
  );

  const canCellMove = useCallback(
    (
      sourceRow: number,
      sourceCol: number,
      destRow: number,
      destCol: number
    ): boolean => {
      const current = sessionRef.current;
      return Boolean(
        current &&
        identity &&
        sameGameIdentity(current.identity, identity) &&
        canSwapGameCells(
          current,
          correctGrid,
          sourceRow,
          sourceCol,
          destRow,
          destCol
        )
      );
    },
    [identity, correctGrid]
  );

  const handleCellMove = useCallback(
    (
      sourceRow: number,
      sourceCol: number,
      destRow: number,
      destCol: number
    ) => {
      const previous = sessionRef.current;
      if (!previous || !identity || !sameGameIdentity(previous.identity, identity)) {
        return;
      }

      const next = applyGameMove(
        previous,
        correctGrid,
        sourceRow,
        sourceCol,
        destRow,
        destCol
      );

      if (next === previous) return;

      sessionRef.current = next;
      setSession(next);
      saveGameSession(next);
    },
    [identity, correctGrid]
  );

  return {
    isReady: currentSession !== null,
    correctGrid,
    gridLetters: currentSession?.gridLetters ?? [],
    cellStatus,
    minMoves: currentSession?.minMoves ?? 0,
    remainingMoves: currentSession?.remainingMoves ?? 0,
    isGridSolved: currentSession?.status === "won",
    isGameIsOver: currentSession?.status === "lost",
    handleCellMove,
    canCellMove,
  };
}
