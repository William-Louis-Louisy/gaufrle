import { fireEvent, render, screen } from "@testing-library/react";
import GameGrid from "./GameGrid";

vi.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, () => undefined],
  useDrop: () => [{}, () => undefined],
}));

function renderGrid(canCellMove = vi.fn(() => true)) {
  const onCellMove = vi.fn();
  render(
    <GameGrid
      letters={[["b", "a"], ["", "c"]]}
      cellStatus={[["default", "default"], ["default", "correct"]]}
      indexValue={2}
      nonPlayableCells={[2]}
      onCellMove={onCellMove}
      canCellMove={canCellMove}
      isGridSolved={false}
      isGameIsOver={false}
    />
  );
  return { onCellMove, canCellMove };
}

describe("P1.4 accessible game interactions", () => {
  test("provides meaningful labels and excludes blocked cells from keyboard selection", () => {
    renderGrid();
    expect(screen.getByRole("group", { name: "Grille de lettres" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /ligne 1, colonne 1, lettre B, à replacer/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /ligne 2, colonne 1/i })).toBeNull();
    expect(screen.getByRole("button", { name: /ligne 2, colonne 2, lettre C, bien placée/i })).toHaveProperty("disabled", true);
  });

  test("allows an exchange via keyboard and validates it before dispatching", () => {
    const { onCellMove, canCellMove } = renderGrid();
    const first = screen.getByRole("button", { name: /ligne 1, colonne 1/i });
    const second = screen.getByRole("button", { name: /ligne 1, colonne 2/i });

    first.focus();
    fireEvent.click(first);
    expect(first.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("status").textContent).toMatch(/lettre sélectionnée/i);
    second.focus();
    fireEvent.click(second);
    expect(canCellMove).toHaveBeenCalledWith(0, 0, 0, 1);
    expect(onCellMove).toHaveBeenCalledWith(0, 0, 0, 1);
    expect(second.getAttribute("aria-pressed")).toBe("false");
  });

  test("does not exchange disallowed cells and Escape cancels selection", () => {
    const { onCellMove } = renderGrid(vi.fn(() => false));
    const first = screen.getByRole("button", { name: /ligne 1, colonne 1/i });
    const second = screen.getByRole("button", { name: /ligne 1, colonne 2/i });
    fireEvent.click(first);
    fireEvent.click(second);
    expect(onCellMove).not.toHaveBeenCalled();
    expect(second.getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(second, { key: "Escape" });
    expect(second.getAttribute("aria-pressed")).toBe("false");
  });
});
