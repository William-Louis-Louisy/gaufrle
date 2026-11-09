import type { GameSession } from "./GameSession";

export type StarRating = 1 | 2 | 3;

export interface VictoryScore {
  stars: StarRating;
  movesUsed: number;
  moveLimit: number;
}

/**
 * Pure, deterministic rating derived from the saved game's real move budget.
 *
 * 3 stars: used at most half of the available moves.
 * 2 stars: used more than half but at most three quarters.
 * 1 star:  used more than three quarters, including the final move.
 *
 * "minMoves" in legacy sessions actually counts misplaced cells; it is NOT
 * the theoretical minimum number of swaps. Do not base the rating on it.
 *
 * No extra persisted score field is required: restored v2 sessions will
 * always show the same rating as before a page reload.
 */
export function calculateVictoryScore(
  session: Pick<GameSession, "status" | "moveLimit" | "remainingMoves">
): VictoryScore | null {
  const { status, moveLimit, remainingMoves } = session;

  if (
    status !== "won" ||
    !Number.isSafeInteger(moveLimit) ||
    moveLimit < 1 ||
    !Number.isSafeInteger(remainingMoves) ||
    remainingMoves < 0 ||
    remainingMoves > moveLimit
  ) {
    return null;
  }

  const movesUsed = moveLimit - remainingMoves;

  const stars: StarRating =
    movesUsed * 2 <= moveLimit
      ? 3
      : movesUsed * 4 <= moveLimit * 3
        ? 2
        : 1;

  return { stars, movesUsed, moveLimit };
}
