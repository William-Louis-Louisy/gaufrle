import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import GamePage from "./GamePage";
import { useGameSession } from "../hooks/useGameSession";
import { usePublicationDate } from "../hooks/usePublicationDate";
import type { IGridData } from "../types/GameGrid";
import type { GameMode } from "../utils/GameSession";
import { selectScheduledGrid } from "../utils/GridSchedule";
import { gridMetadata } from "../utils/CellStatus";

vi.mock("react-dnd", () => ({
  DndProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("../hooks/useGameSession", () => ({ useGameSession: vi.fn() }));
vi.mock("../hooks/usePublicationDate", () => ({ usePublicationDate: vi.fn() }));
vi.mock("../utils/GridSchedule", async (importOriginal) => {
  const original = await importOriginal<typeof import("../utils/GridSchedule")>();
  return { ...original, selectScheduledGrid: vi.fn() };
});
vi.mock("./GameGrid", () => ({
  default: ({ indexValue, nonPlayableCells }: {
    indexValue: number;
    nonPlayableCells: readonly number[];
  }) => (
    <div data-testid="game-grid" data-size={indexValue} data-locked={nonPlayableCells.join(",")} />
  ),
}));
vi.mock("./GridTitle", () => ({
  default: ({ gridType, periodStart }: { gridType: string; periodStart: string }) =>
    <div data-testid="grid-title">{gridType}:{periodStart}</div>,
}));
vi.mock("./GridUnavailable", () => ({
  default: ({ weekly = false }: { weekly?: boolean }) =>
    <div data-testid="unavailable">{weekly ? "weekly" : "daily"}</div>,
}));
vi.mock("./Navigation/Loading", () => ({
  default: () => <div data-testid="loading">Chargement</div>,
}));
vi.mock("./Victory", () => ({
  default: ({ weekly = false }: { weekly?: boolean }) =>
    <div data-testid="victory">{weekly ? "weekly" : "daily"}</div>,
}));
vi.mock("./GameOver", () => ({
  default: ({ weekly = false }: { weekly?: boolean }) =>
    <div data-testid="game-over">{weekly ? "weekly" : "daily"}</div>,
}));
vi.mock("./SeeSolution", () => ({
  default: () => <div data-testid="solution">Solution</div>,
}));
vi.mock("./WordDefinitions", () => ({
  default: ({ words }: { words: string[] }) =>
    <div data-testid="definitions">{words.join(",")}</div>,
}));

const grid: IGridData = {
  id: "test-puzzle",
  date: "2026-11-10",
  type: "normal",
  words: ["abcde", "fghij", "klmno", "pqrst", "uvwxy", "zabcd"],
};

function session(overrides: Partial<ReturnType<typeof useGameSession>> = {}):
  ReturnType<typeof useGameSession> {
  return {
    isReady: true,
    victoryScore: null,
    remainingMoves: 12,
    correctGrid: [["a"]],
    gridLetters: [["b"]],
    cellStatus: [["default"]],
    minMoves: 10,
    isGridSolved: false,
    isGameIsOver: false,
    handleCellMove: vi.fn(),
    canCellMove: vi.fn(() => true),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usePublicationDate).mockReturnValue("2026-11-10");
  vi.mocked(selectScheduledGrid).mockReturnValue({
    grid,
    periodStart: "2026-11-10",
  });
  vi.mocked(useGameSession).mockReturnValue(session());
});

describe("P2.2 shared gameplay page", () => {
  test.each([
    ["normal", 5, false],
    ["medium", 7, false],
    ["hard", 7, true],
  ] as const)("preserves the %s mode configuration", (mode, size, weekly) => {
    const catalog = [grid];
    render(<GamePage mode={mode} grids={catalog} />);

    expect(selectScheduledGrid).toHaveBeenCalledWith(mode, catalog, "2026-11-10");
    expect(useGameSession).toHaveBeenCalledWith(mode, grid, "2026-11-10");
    expect(screen.getByTestId("grid-title").textContent).toBe(`${mode}:2026-11-10`);
    expect(screen.getByTestId("game-grid").getAttribute("data-size")).toBe(String(size));
    expect(screen.getByTestId("game-grid").getAttribute("data-locked"))
      .toBe(gridMetadata[mode].nonPlayableCells.join(","));
    expect(screen.getByText(/Mouvements restants/).textContent).toContain("12");
    expect(screen.queryByTestId("victory")).toBeNull();
    expect(screen.queryByTestId("definitions")).toBeNull();
    expect(weekly).toBe(mode === "hard");
  });

  test.each(["normal", "medium", "hard"] as const)(
    "shows the correct unavailable message for %s", (mode: GameMode) => {
      vi.mocked(selectScheduledGrid).mockReturnValue({
        grid: undefined,
        periodStart: "2026-11-10",
      });
      render(<GamePage mode={mode} grids={[]} />);
      expect(screen.getByTestId("unavailable").textContent)
        .toBe(mode === "hard" ? "weekly" : "daily");
      expect(screen.queryByTestId("game-grid")).toBeNull();
    }
  );

  test("shows a loader while the session is being restored", () => {
    vi.mocked(useGameSession).mockReturnValue(session({ isReady: false }));
    render(<GamePage mode="normal" grids={[grid]} />);
    expect(screen.getByTestId("loading")).not.toBeNull();
    expect(screen.queryByTestId("game-grid")).toBeNull();
  });

  test.each([
    ["normal", "daily"],
    ["hard", "weekly"],
  ] as const)("shows %s victory and definitions without a game-over", (mode, cadence) => {
    vi.mocked(useGameSession).mockReturnValue(session({
      isGridSolved: true,
      victoryScore: { stars: 3, movesUsed: 8, moveLimit: 12 },
    }));
    render(<GamePage mode={mode} grids={[grid]} />);
    expect(screen.getByTestId("victory").textContent).toBe(cadence);
    expect(screen.getByTestId("definitions").textContent).toBe(grid.words.join(","));
    expect(screen.queryByTestId("game-over")).toBeNull();
  });

  test.each([
    ["medium", "daily"],
    ["hard", "weekly"],
  ] as const)("shows %s defeat, solution and definitions", (mode, cadence) => {
    vi.mocked(useGameSession).mockReturnValue(session({ isGameIsOver: true }));
    render(<GamePage mode={mode} grids={[grid]} />);
    expect(screen.getByTestId("game-over").textContent).toBe(cadence);
    expect(screen.getByTestId("solution")).not.toBeNull();
    expect(screen.getByTestId("definitions").textContent).toBe(grid.words.join(","));
    expect(screen.queryByTestId("victory")).toBeNull();
  });
});
