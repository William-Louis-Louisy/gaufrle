import { render } from "@testing-library/react";
import { useDrag, useDrop } from "react-dnd";
import GameCell from "./GameCell";
import GameGrid from "./GameGrid";
import { IGameCell } from "../types/GameCell";

jest.mock("react-dnd", () => ({
  useDrag: jest.fn(() => [{ isDragging: false }, () => undefined]),
  useDrop: jest.fn(() => [{}, () => undefined]),
}));

type DragItem = { row: number; col: number };
type DragSpec = { canDrag: boolean };
type DropSpec = {
  canDrop: (item: DragItem) => boolean;
  drop: (item: DragItem) => void;
};

const getDragSpec = (): DragSpec =>
  (useDrag as jest.Mock).mock.calls[0][0] as DragSpec;
const getDropSpec = (): DropSpec =>
  (useDrop as jest.Mock).mock.calls[0][0] as DropSpec;

function renderCell(overrides: Partial<IGameCell> = {}) {
  const onMove = jest.fn();
  const canCellMove = jest.fn(() => true);
  const props: IGameCell = {
    row: 0,
    col: 0,
    letter: "a",
    onMove,
    canCellMove,
    status: "default",
    isGridSolved: false,
    isGameIsOver: false,
    nonPlayableCells: [6],
    indexValue: 5,
    ...overrides,
  };

  const view = render(<GameCell {...props} />);
  return { ...view, onMove, canCellMove };
}

describe("P0.4 drag-and-drop validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ["correct letter", { status: "correct" }],
    ["won game", { isGridSolved: true }],
    ["lost game", { isGameIsOver: true }],
    ["non-playable cell", { row: 1, col: 1 }],
  ] as Array<[string, Partial<IGameCell>]>)(
    "disables dragging and dropping for %s",
    (_label, overrides) => {
      const { onMove, canCellMove } = renderCell(overrides);

      expect(getDragSpec().canDrag).toBe(false);
      expect(getDropSpec().canDrop({ row: 0, col: 2 })).toBe(false);
      getDropSpec().drop({ row: 0, col: 2 });

      expect(onMove).not.toHaveBeenCalled();
      expect(canCellMove).not.toHaveBeenCalled();
    }
  );

  test("asks the authoritative move validator before allowing a drop", () => {
    const { onMove, canCellMove } = renderCell({
      canCellMove: jest.fn(() => false),
    });
    const target = { row: 0, col: 2 };

    expect(getDragSpec().canDrag).toBe(true);
    expect(getDropSpec().canDrop(target)).toBe(false);
    getDropSpec().drop(target);

    expect(canCellMove).not.toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
  });

  test("only dispatches an approved swap with the exact cell coordinates", () => {
    const onMove = jest.fn();
    const canCellMove = jest.fn(() => true);
    renderCell({ row: 2, col: 3, onMove, canCellMove });
    const source = { row: 0, col: 4 };

    expect(getDragSpec().canDrag).toBe(true);
    expect(getDropSpec().canDrop(source)).toBe(true);
    getDropSpec().drop(source);

    expect(canCellMove).toHaveBeenCalledWith(0, 4, 2, 3);
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith(0, 4, 2, 3);
  });

  test("propagates the terminal state to every rendered grid cell", () => {
    render(
      <GameGrid
        letters={[["a", "b"]]}
        cellStatus={[["default", "default"]]}
        onCellMove={jest.fn()}
        canCellMove={jest.fn(() => true)}
        nonPlayableCells={[]}
        indexValue={2}
        isGridSolved={false}
        isGameIsOver
      />
    );

    const options = (useDrag as jest.Mock).mock.calls.map(
      (call) => call[0] as DragSpec
    );
    expect(options).toHaveLength(2);
    expect(options.every((option) => option.canDrag === false)).toBe(true);
  });
});
